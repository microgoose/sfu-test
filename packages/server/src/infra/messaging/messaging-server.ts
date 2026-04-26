import {joinRoom, leaveAllRooms, leaveRoom} from "@/service/room.service.js";
import {WebSocketServer} from "ws";
import {MessagingExchanger, MessagingRouter, MessagingSocket} from "@sfu-test/messaging";
import {
    connectTransport,
    createConsumer,
    createProducer,
    createTransport,
    getRoomProducers,
    getRtpCapabilities,
    resumeConsumer
} from "@/service/signaling.service.js";
import type {IncomingMessage} from "node:http";

export const sockets = new Map<string, MessagingSocket>();

function extractUserId(request: IncomingMessage): string {
    const requestUrl = request.url;
    if (!requestUrl) throw new Error('Bad request');

    const url = new URL(requestUrl, 'ws://localhost');
    const userId = url.searchParams.get('userId');
    if (!userId) throw new Error('Unauthorized');

    return userId;
}

export function createMessagingServer(wss: WebSocketServer) {
    wss.on('connection', async (ws, request) => {
        let userId: string;

        try {
            userId = extractUserId(request);
            console.debug(`[Messaging] Participant ${userId} connected`);
        } catch (ex) {
            console.error('[Messaging] Error while connection: ', ex);
            ws.close(1008, 'Unauthorized');
            return;
        }

        const router = new MessagingRouter();
        const exchanger = new MessagingExchanger({
            router,
            onErrorMessage: console.error,
            onSend: (data) => ws.send(data),
        });

        const socket = new MessagingSocket(exchanger);

        ws.on('close', () => {
            console.debug(`[Messaging] Participant ${userId} disconnected`);
            leaveAllRooms(userId);
            sockets.delete(userId);
        });

        ws.on('message', (data) => {
            exchanger.handleIncomingMessage(data.toString());
        });

        socket.onJoinRoom((request) => {
            console.debug(`[Messaging] Participant ${userId} join room ${request.roomId}`);
            return joinRoom(userId, request.roomId);
        });

        socket.onLeaveRoom((request) => {
            console.debug(`[Messaging] Participant ${userId} leaving room ${request.roomId}`);
            leaveRoom(userId, request.roomId);
        });

        socket.onGetRouterRtpCapabilities((request) => {
            console.debug(`[Messaging] Get rtp capabilities ${request.roomId}`);
            return getRtpCapabilities(request.roomId);
        });

        socket.onCreateTransport((request) => {
            console.debug(`[Messaging] Create transport for room ${request.roomId}`);
            return createTransport(userId, request.roomId);
        });

        socket.onConnectTransport((request) => {
            console.debug(`[Messaging] Connect transport ${request.transportId} from room ${request.roomId}`);
            return connectTransport(request.transportId, request.dtlsParameters);
        });

        socket.onCreateProducer((request) => {
            console.debug(`[Messaging] Create producer for transport ${request.transportId}, kind ${request.kind}`);
            return createProducer(request);
        });

        socket.onGetProducersList((request) => {
            console.debug(`[Messaging] Get room ${request.roomId} producers`);
            return getRoomProducers(request.roomId);
        });

        socket.onCreateConsumer((request) => {
            console.debug(`[Messaging] Create consumer for transport ${request.transportId}, producer ${request.producerId}`);
            return createConsumer(request);
        });

        socket.onResumeConsumer((request) => {
            console.debug(`[Messaging] Resume consumer ${request.consumerId}`);
            resumeConsumer(request.consumerId);
        });

        sockets.set(userId, socket);
    });
}