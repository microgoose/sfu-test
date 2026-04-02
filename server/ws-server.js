import {WebSocketServer} from "ws";
import {wsRoomRoutes} from "./src/routes/room-router.js";
import {wsParticipantRoutes} from "./src/routes/participant-router.js";
import {MESSAGE_TYPES} from "./src/config/ws-routes.js";

const routes = {
    ...wsRoomRoutes,
    ...wsParticipantRoutes,
};

export function createWsServer(server) {
    const wsServer = new WebSocketServer({ server });
    wsServer.on("connection", onConnection);
}

function onMessage(socket, data) {
    const message = JSON.parse(data.toString());
    console.log("WebSocket message received:", message);

    if (!message.type)
        throw new Error(`Incorrect message ${message}`);

    for (let path of Object.keys(routes)) {
        if (message.type === path) {
            try {
                routes[path](socket, message);
            } catch (ex) {
                console.error(ex);
            }

            return;
        }
    }

    console.error(`Not found ${message.type}`);
}

function onConnection(socket) {
    socket.id = crypto.randomUUID();
    console.log(`WebSocket client connect ${socket.id}`);
    routes[MESSAGE_TYPES.CONNECT](socket);
    socket.on("message", (data) => onMessage(socket, data));
    socket.on("close", (code, reason) => onClose(code, reason, socket));
}

function onClose(code, reason, socket) {
    console.log(`WebSocket client disconnect ${socket.id}.`);
    routes[MESSAGE_TYPES.DISCONNECT](socket);
}
