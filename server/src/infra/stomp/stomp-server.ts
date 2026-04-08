import {WebSocket, WebSocketServer} from 'ws';
import {Server} from 'node:http';
import {onCommand, registerSession, removeSession} from './stomp-broker.ts';
import {connectParticipant, disconnectParticipant} from "../../service/participant.service.ts";
import {createSession, StompSession} from "./stomp-session.ts";

export function createStompServer(httpServer: Server, path: string): void {
    const wss = new WebSocketServer({ server: httpServer, path });

    wss.on('connection', (socket: WebSocket) => {
        const sessionId = crypto.randomUUID();
        console.debug(`[WS] Client connected: ${sessionId}`);

        function onConnect(session: StompSession) {
            registerSession(session);
            connectParticipant(sessionId);
        }

        function onDisconnect() {
            disconnectParticipant(sessionId);
            removeSession(sessionId);
        }

        createSession(socket, sessionId, {
            onConnect,
            onDisconnect,
            onCommand,
        });

        socket.on('close', () => {
            onDisconnect();
            console.error(`[WS] Socket closed ${sessionId}`);
        });

        socket.on('error', (err) => {
            onDisconnect();
            console.error(`[WS] Socket error ${sessionId}:`, err);
        });
    });

    console.debug(`[WS] STOMP server listening on ${path}`);
}