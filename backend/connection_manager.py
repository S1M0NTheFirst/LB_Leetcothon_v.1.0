from fastapi import WebSocket
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        await self.broadcast_count()

    async def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            await self.broadcast_count()

    async def broadcast_count(self):
        count = len(self.active_connections)
        for connection in self.active_connections:
            try:
                await connection.send_text(str(count))
            except Exception:
                # If sending fails, the connection might be closed already
                pass

manager = ConnectionManager()
