import * as wsManager from "../../config/ws-manager.js";

export function getBySocketId(socketId) {
    const userId = wsManager.findConnection(socketId);
    if (!userId)
        throw new Error(`User connection ${socketId} not found`);
    return userId;
}