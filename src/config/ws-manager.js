export const connections = new Map();
export const socketToConnection = new Map();

export function findConnection(socketId) {
    return socketToConnection.get(socketId);
}

export function addConnection(userId, socket) {
    if (!connections.has(userId))
        connections.set(userId, new Set());

    connections.get(userId).add(socket);
    socketToConnection.set(socket.id, userId);
}

export function removeConnection(socket) {
    const userId = socketToConnection.get(socket.id);

    if (userId) {
        connections.get(userId)?.delete(socket);
        if (connections.get(userId)?.size === 0) {
            connections.delete(userId);
        }
    }

    socketToConnection.delete(socket.id);
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