export const connections = new Map();
export const socketToConnection = new Map();

export function findConnection(socketId) {
    return socketToConnection.get(socketId);
}

export function addConnection(connId, socket) {
    connections.set(connId, socket);
    socketToConnection.set(socket.id, connId);
}

export function removeConnection(socketId) {
    const connId = socketToConnection.get(socketId);
    connections.delete(connId);
    socketToConnection.delete(socketId);
}

export function sendTo(connId, message) {
    const socket = connections.get(connId);
    if (socket) {
        socket.send(JSON.stringify(message));
    } else {
        console.error(`Socket not found for user ${connId}`);
    }
}

export function broadcastToConnections(connIds, message) {
    connIds.forEach(connId => sendTo(connId, message));
}