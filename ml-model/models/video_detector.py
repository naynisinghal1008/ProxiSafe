"""
ProxiSafe video detector — person detection + social-distancing checks.

Backends (set DETECTOR_BACKEND):
  - (unset): YOLO if ultralytics is installed, else HOG
  - hog  : OpenCV HOG (no extra deps; weak on tiny/wide crowds)
  - yolo : Ultralytics YOLOv8 (pip install ultralytics — better for crowds)

Tune via env: MIN_DISTANCE_PIXELS, YOLO_MODEL, YOLO_CONF, HOG_SCALE, etc.
"""

import logging
import os
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np

logger = logging.getLogger(__name__)


def _tile_starts(length: int, tile: int, step: int) -> List[int]:
    """Sliding-window start positions that cover [0, length) with windows of size tile."""
    if length <= 0 or tile <= 0:
        return []
    if length <= tile:
        return [0]
    starts = list(range(0, length - tile + 1, step))
    last = length - tile
    if not starts or starts[-1] != last:
        starts.append(last)
    return starts


def _default_detector_backend() -> str:
    """Prefer YOLO when ultralytics is installed (better for crowds); else HOG."""
    explicit = os.getenv("DETECTOR_BACKEND", "").strip().lower()
    if explicit:
        return explicit
    try:
        import ultralytics  # noqa: F401

        return "yolo"
    except ImportError:
        return "hog"


class VideoDetector:
    """Person detection and pairwise distance violations (pixel space)."""

    def __init__(self, min_distance_pixels: Optional[int] = None):
        self.min_distance_pixels = int(
            min_distance_pixels if min_distance_pixels is not None else os.getenv("MIN_DISTANCE_PIXELS", "80")
        )
        self.backend = _default_detector_backend()
        self._yolo = None
        self._yolo_failed_reason: Optional[str] = None

        if self.backend == "yolo":
            try:
                from ultralytics import YOLO

                model_name = os.getenv("YOLO_MODEL", "yolov8s.pt")
                self._yolo = YOLO(model_name)
                logger.info("YOLO detector loaded: %s", model_name)
            except Exception as e:
                self._yolo_failed_reason = str(e)
                logger.warning("YOLO unavailable (%s), using HOG instead", e)
                self.backend = "hog"

        hog_scale = float(os.getenv("HOG_SCALE", "1.05"))
        self._hog_scale = max(1.01, min(hog_scale, 1.15))
        self._hog_win_stride = int(os.getenv("HOG_WIN_STRIDE", "8"))

        self._hog_cv: Optional[Any] = None
        if self.backend != "yolo" or self._yolo is None:
            self._hog_cv = cv2.HOGDescriptor()
            self._hog_cv.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
            logger.warning(
                "HOG person detector active — tiny/distant people in crowd shots often score 0. "
                "Install ultralytics (see requirements-yolo.txt) for YOLO."
            )

    def _get_center(self, bbox: Tuple[int, int, int, int]) -> Tuple[float, float]:
        x, y, w, h = bbox
        return (x + w / 2, y + h / 2)

    def _distance(self, b1: Tuple, b2: Tuple) -> float:
        c1 = self._get_center(b1)
        c2 = self._get_center(b2)
        return float(np.sqrt((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2))

    def detect_persons(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        if self.backend == "yolo" and self._yolo is not None:
            return self._detect_yolo(frame)
        return self._detect_hog(frame)

    def _detect_hog(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        assert self._hog_cv is not None
        # HOG expects rough pedestrian scale; downscale huge frames so tiny distant crowds aren't missed entirely
        h, w = frame.shape[:2]
        max_edge = int(os.getenv("HOG_MAX_EDGE", "900"))
        scale_back = 1.0
        proc = frame
        if max(h, w) > max_edge:
            scale_back = max_edge / float(max(h, w))
            proc = cv2.resize(frame, (int(w * scale_back), int(h * scale_back)))
        ws = (self._hog_win_stride, self._hog_win_stride)
        rects, _ = self._hog_cv.detectMultiScale(
            proc,
            winStride=ws,
            padding=(8, 8),
            scale=self._hog_scale,
        )
        out = []
        for r in rects:
            x, y, rw, rh = (int(r[0]), int(r[1]), int(r[2]), int(r[3]))
            if scale_back < 1.0:
                inv = 1.0 / scale_back
                x, y = int(x * inv), int(y * inv)
                rw, rh = int(rw * inv), int(rh * inv)
            out.append((x, y, rw, rh))
        return out

    def _yolo_env(self) -> Tuple[float, int, int]:
        conf = float(os.getenv("YOLO_CONF", "0.12"))
        imgsz = int(os.getenv("YOLO_IMGSZ", "1280"))
        max_det = int(os.getenv("YOLO_MAX_DET", "500"))
        return conf, imgsz, max_det

    def _boxes_from_yolo_results(self, results) -> List[Tuple[int, int, int, int, float]]:
        out: List[Tuple[int, int, int, int, float]] = []
        for r in results:
            if r.boxes is None or len(r.boxes) == 0:
                continue
            for b in r.boxes:
                xyxy = b.xyxy[0].cpu().numpy()
                x1, y1, x2, y2 = xyxy.astype(float)
                x, y = int(x1), int(y1)
                w, h = int(x2 - x1), int(y2 - y1)
                cf = float(b.conf[0].cpu().numpy())
                if w > 0 and h > 0:
                    out.append((x, y, w, h, cf))
        return out

    def _nms_xywh(
        self, scored: List[Tuple[int, int, int, int, float]], iou_thresh: float = 0.45
    ) -> List[Tuple[int, int, int, int]]:
        if not scored:
            return []
        boxes = [(s[0], s[1], s[2], s[3]) for s in scored]
        scores = [float(s[4]) for s in scored]
        idx = cv2.dnn.NMSBoxes(boxes, scores, score_threshold=0.001, nms_threshold=iou_thresh)
        if idx is None or len(idx) == 0:
            return []
        flat = np.array(idx).flatten().tolist()
        return [tuple(scored[i][:4]) for i in flat]

    def _detect_yolo_full(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        assert self._yolo is not None
        conf, imgsz, max_det = self._yolo_env()
        results = self._yolo.predict(
            frame,
            classes=[0],
            conf=conf,
            verbose=False,
            imgsz=imgsz,
            max_det=max_det,
        )
        scored = self._boxes_from_yolo_results(results)
        return self._nms_xywh(scored)

    def _detect_yolo_tiled(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Overlapping tiles so small/distant people get a reasonable native resolution."""
        assert self._yolo is not None
        h, w = frame.shape[:2]
        conf, _, max_det = self._yolo_env()
        tile = int(os.getenv("YOLO_TILE_SIZE", "640"))
        overlap = float(os.getenv("YOLO_TILE_OVERLAP", "0.2"))
        step = max(int(tile * (1 - overlap)), 1)
        imgsz_tile = int(os.getenv("YOLO_TILE_INFER_SIZE", "640"))

        scored: List[Tuple[int, int, int, int, float]] = []
        for y0 in _tile_starts(h, tile, step):
            for x0 in _tile_starts(w, tile, step):
                roi = frame[y0 : y0 + tile, x0 : x0 + tile]
                if roi.shape[0] < 16 or roi.shape[1] < 16:
                    continue
                infer_sz = max(32, min(imgsz_tile, max(roi.shape[0], roi.shape[1])))
                results = self._yolo.predict(
                    roi,
                    classes=[0],
                    conf=conf,
                    verbose=False,
                    imgsz=infer_sz,
                    max_det=max_det,
                )
                for bx, by, bw, bh, cf in self._boxes_from_yolo_results(results):
                    scored.append((bx + x0, by + y0, bw, bh, cf))

        return self._nms_xywh(scored)

    def _use_yolo_tiling(self, frame: np.ndarray) -> bool:
        tiling = os.getenv("YOLO_TILING", "auto").strip().lower()
        if tiling in ("1", "true", "yes", "on"):
            return True
        if tiling in ("0", "false", "no", "off"):
            return False
        # auto: wide frames benefit from tiles (small persons in crowd shots)
        h, w = frame.shape[:2]
        min_edge = int(os.getenv("YOLO_TILING_MIN_EDGE", "1120"))
        return max(h, w) >= min_edge

    def _detect_yolo(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        assert self._yolo is not None
        if self._use_yolo_tiling(frame):
            return self._detect_yolo_tiled(frame)
        return self._detect_yolo_full(frame)

    def find_violations(self, boxes: List[Tuple[int, int, int, int]]) -> List[int]:
        violations = set()
        for i in range(len(boxes)):
            for j in range(i + 1, len(boxes)):
                if self._distance(boxes[i], boxes[j]) < self.min_distance_pixels:
                    violations.add(i)
                    violations.add(j)
        return list(violations)

    def process_frame(self, frame_bytes: bytes) -> Dict[str, Any]:
        nparr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return {"error": "Invalid image", "violation_count": 0}

        boxes = self.detect_persons(frame)
        violations = self.find_violations(boxes)
        violation_count = len(violations)

        detections = []
        for i, (x, y, w, h) in enumerate(boxes):
            detections.append(
                {
                    "bbox": [int(x), int(y), int(w), int(h)],
                    "is_violation": i in violations,
                }
            )

        return {
            "detections": detections,
            "violation_count": violation_count,
            "total_persons": len(boxes),
            "detector_backend": self.backend,
            "yolo_tiled": (
                self.backend == "yolo"
                and self._yolo is not None
                and self._use_yolo_tiling(frame)
            ),
        }

    def process_frame_with_overlay(self, frame_bytes: bytes) -> bytes:
        nparr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return frame_bytes

        boxes = self.detect_persons(frame)
        violations = self.find_violations(boxes)
        violation_set = set(violations)

        for i, (x, y, w, h) in enumerate(boxes):
            color = (0, 0, 255) if i in violation_set else (0, 255, 0)
            label = "VIOLATION" if i in violation_set else "OK"
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 3)
            cv2.putText(frame, label, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        _, buf = cv2.imencode(".jpg", frame)
        return buf.tobytes()

    def info(self) -> Dict[str, Any]:
        return {
            "backend": self.backend,
            "min_distance_pixels": self.min_distance_pixels,
            "yolo_model": os.getenv("YOLO_MODEL", "yolov8s.pt") if self.backend == "yolo" else None,
            "yolo_fallback_reason": self._yolo_failed_reason,
        }
