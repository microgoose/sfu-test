export const connections = new Map();
export const socketToConnection = new Map();

export function findConnection(socketId) {
    return socketToConnection.get(socketId);
}

export function addConnection(userId, socket) {
    connections.set(userId, socket);
    socketToConnection.set(socket.id, userId);
}

export function removeConnection(socketId) {
    const userId = socketToConnection.get(socketId);
    connections.delete(userId);
    socketToConnection.delete(socketId);
}

export function sendTo(connId, message) {
    const sockets = connections.get(connId);
    if (sockets) {
        sockets.forEach(socket => socket.send(JSON.stringify(message)));
    }
}

export function broadcastToConnections(userIds, message) {
    userIds.forEach(userId => sendTo(userId, message));
}