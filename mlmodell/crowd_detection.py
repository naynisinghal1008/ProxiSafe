import cv2
import numpy as np
import torch
import imutils
from imutils.video import FPS
from scipy.spatial import distance as dist
import os
from pathlib import Path
import base64
import json
import logging
import argparse
from datetime import datetime
import socketio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CrowdDetector:
    def __init__(self, model_path='yolov5s.pt', min_distance=50, websocket_url='http://localhost:3000', hall_id=None):
        """
        Initialize the crowd detector with YOLO model
        """
        self.min_distance = min_distance
        self.websocket_url = websocket_url
        self.hall_id = hall_id
        self.sio = socketio.Client()
        
        self.sio.on('connect', self.on_connect)
        self.sio.on('disconnect', self.on_disconnect)
        self.sio.on('error', self.on_error)
        
        try:
            self.model = torch.hub.load('ultralytics/yolov5', 'custom', path=model_path)
            if torch.cuda.is_available():
                self.model.cuda()
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.model = torch.hub.load('ultralytics/yolov5', 'yolov5s')
        
        self.model.conf = 0.5 
        self.model.iou = 0.45  

    def on_connect(self):
        """Socket.IO connect handler"""
        logger.info('Connected to server')
        if self.hall_id:
            self.sio.emit('join_hall', self.hall_id)

    def on_disconnect(self):
        """Socket.IO disconnect handler"""
        logger.info('Disconnected from server')

    def on_error(self, error):
        """Socket.IO error handler"""
        logger.error(f'Socket.IO error: {error}')

    def encode_frame(self, frame):
        """
        Encode frame to base64 for frontend display
        """
        _, buffer = cv2.imencode('.jpg', frame)
        return base64.b64encode(buffer).decode('utf-8')

    def process_frame(self, frame):
        """
        Process a single frame and detect crowds
        """
        frame = imutils.resize(frame, width=640)
        results = self.model(frame)
        detections = results.xyxy[0].numpy()
        
        centroids = []
        violations = set()
        people_data = []
        
        for i in range(len(detections)):
            x1, y1, x2, y2, conf, cls = detections[i]
            if int(cls) == 0: 
                cX = int((x1 + x2) / 2)
                cY = int((y1 + y2) / 2)
                centroids.append((cX, cY))
                
                people_data.append({
                    'id': i,
                    'position': {'x': cX, 'y': cY},
                    'confidence': float(conf),
                    'bbox': [int(x1), int(y1), int(x2), int(y2)]
                })
                
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
        
        if len(centroids) >= 2:
            D = dist.cdist(centroids, centroids, metric="euclidean")
            for i in range(D.shape[0]):
                for j in range(i + 1, D.shape[1]):
                    if D[i, j] < self.min_distance:
                        violations.add(i)
                        violations.add(j)
        
        for i in violations:
            if i < len(detections):
                x1, y1, x2, y2 = detections[i][:4]
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
                if i < len(people_data):
                    people_data[i]['violation'] = True
        
        text = f"Total People: {len(centroids)} | Violations: {len(violations)}"
        cv2.putText(frame, text, (10, frame.shape[0] - 25),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.70, (0, 0, 255), 2)
        
        return frame, {
            'frame': self.encode_frame(frame),
            'timestamp': datetime.now().isoformat(),
            'hall_id': self.hall_id,
            'statistics': {
                'total_people': len(centroids),
                'violations': len(violations)
            },
            'people': people_data
        }

    def send_data(self, data):
        """
        Send data through Socket.IO
        """
        try:
            self.sio.emit('hall_update', data)
            if any(person.get('violation', False) for person in data['people']):
                self.sio.emit('violation_alert', {
                    'hall_id': self.hall_id,
                    'violations': [p['id'] for p in data['people'] if p.get('violation', False)],
                    'timestamp': data['timestamp']
                })
        except Exception as e:
            logger.error(f"Error sending data: {e}")

    def process_video(self, video_path, output_path=None):
        """
        Process a video file or camera stream
        """
        try:
            self.sio.connect(self.websocket_url)
            
            cap = cv2.VideoCapture(video_path)
            fps = FPS().start()
            
            if output_path:
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                out = cv2.VideoWriter(output_path, fourcc, 20.0, 
                                    (int(cap.get(3)), int(cap.get(4))))
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                    
                processed_frame, detection_data = self.process_frame(frame)
                
                self.send_data(detection_data)
                
                if output_path:
                    out.write(processed_frame)
                
                cv2.imshow('Crowd Detection', processed_frame)
                fps.update()
                
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
            
            fps.stop()
            logger.info(f"[INFO] Elapsed time: {fps.elapsed():.2f}")
            logger.info(f"[INFO] Approx. FPS: {fps.fps():.2f}")
            
        except Exception as e:
            logger.error(f"Error in video processing: {e}")
        finally:
            if 'cap' in locals():
                cap.release()
            if 'out' in locals() and output_path:
                out.release()
            cv2.destroyAllWindows()
            
            if self.sio.connected:
                self.sio.disconnect()

def main():
    parser = argparse.ArgumentParser(description='Crowd Detection System')
    parser.add_argument('--video_path', type=str, required=True, help='Path to video file')
    parser.add_argument('--hall_id', type=str, required=True, help='Hall ID')
    parser.add_argument('--websocket_url', type=str, default='http://localhost:3000', help='Socket.IO server URL')
    parser.add_argument('--min_distance', type=int, default=50, help='Minimum distance for violation detection')
    parser.add_argument('--output_path', type=str, help='Output video path (optional)')
    
    args = parser.parse_args()
    
    detector = CrowdDetector(
        min_distance=args.min_distance,
        websocket_url=args.websocket_url,
        hall_id=args.hall_id
    )
    
    # Check if it's a camera index (numeric string) or a file path
    if args.video_path.isdigit() or os.path.exists(args.video_path):
        detector.process_video(args.video_path, args.output_path)
    else:
        logger.error(f"Error: Video file {args.video_path} not found")

if __name__ == "__main__":
    main()