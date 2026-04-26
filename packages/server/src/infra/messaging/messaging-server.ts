import {joinRoom, leaveRoom} from "@/service/room.service.js";
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
            sockets.delete(userId);
        });

        ws.on('message', (data) => {
            exchanger.handleIncomingMessage(data.toString());
        });

        socket.onJoinRoom(async ({ body }) => {
            console.debug(`[Messaging] Participant ${userId} join room ${body.roomId}`);
            joinRoom(userId, body.roomId);
        });

        socket.onLeaveRoom(async ({body}) => {
            console.debug(`[Messaging] Participant ${userId} leaving room ${body.roomId}`);
            leaveRoom(userId, body.roomId);
        });

        socket.onGetRouterRtpCapabilities(({body}) => {
            console.debug(`[Messaging] Get rtp capabilities ${body.roomId}`);
            return getRtpCapabilities(body.roomId);
        });

        socket.onCreateTransport(({body}) => {
            console.debug(`[Messaging] Create transport for room ${body.roomId}`);
            return createTransport(body.roomId);
        });

        socket.onConnectTransport(({body}) => {
            console.debug(`[Messaging] Connect transport ${body.transportId} from room ${body.roomId}`);
            return connectTransport(body.transportId, body.dtlsParameters);
        });

        socket.onCreateProducer(async ({body}) => {
            console.debug(`[Messaging] Create producer for transport ${body.transportId}, kind ${body.kind}`);
            return createProducer(body);
        });

        socket.onGetProducersList(async ({body}) => {
            console.debug(`[Messaging] Get room ${body.roomId} producers`);
            return getRoomProducers(body.roomId);
        });

        socket.onCreateConsumer(({body}) => {
            console.debug(`[Messaging] Create consumer for transport ${body.transportId}, producer ${body.producerId}`);
            return createConsumer(body);
        });

        socket.onResumeConsumer(async ({body}) => {
            console.debug(`[Messaging] Resume consumer ${body.consumerId}`);
            resumeConsumer(body.consumerId);
        });

        sockets.set(userId, socket);
    });
}