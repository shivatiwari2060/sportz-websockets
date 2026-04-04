import { WebSocket, WebSocketServer } from "ws";

function sendJson(socket, payload) {
  const message = JSON.stringify(payload);
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(message);
}

function broadcast(wss, payload) {
  const message = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;
    try {
      client.send(message);
    } catch (error) {
      console.error("Failed to send the client", error.message);
    }
  }
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });
  wss.on("connection", (socket) => {
    sendJson(socket, { type: "Welcome" });
    socket.on("error", console.error);
  });
  function broadcastMatchCreated(match) {
    broadcast(wss, { type: "match_created", data: match });
  }
  return { broadcastMatchCreated };
}
