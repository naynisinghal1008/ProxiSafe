import asyncio
import websockets
import json
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Store connected clients
CLIENTS = set()

async def register(websocket):
    """Register a new client"""
    CLIENTS.add(websocket)
    logger.info(f"New client connected. Total clients: {len(CLIENTS)}")

async def unregister(websocket):
    """Unregister a client"""
    CLIENTS.remove(websocket)
    logger.info(f"Client disconnected. Total clients: {len(CLIENTS)}")

async def broadcast(message):
    """Broadcast message to all connected clients"""
    if CLIENTS:
        await asyncio.gather(
            *[client.send(message) for client in CLIENTS],
            return_exceptions=True
        )

async def handle_connection(websocket, path):
    """Handle WebSocket connection"""
    await register(websocket)
    try:
        async for message in websocket:
            try:
                # Parse the incoming message
                data = json.loads(message)
                
                # Add server timestamp
                data['server_timestamp'] = datetime.now().isoformat()
                
                # Broadcast to all clients
                await broadcast(json.dumps(data))
                
            except json.JSONDecodeError:
                logger.error("Invalid JSON received")
            except Exception as e:
                logger.error(f"Error processing message: {e}")
    finally:
        await unregister(websocket)

async def main():
    server = await websockets.serve(
        handle_connection,
        "localhost",
        3001,
        ping_interval=None  # Disable ping-pong for better performance
    )
    logger.info("WebSocket server started on ws://localhost:3001")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main()) 