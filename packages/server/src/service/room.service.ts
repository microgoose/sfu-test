import {messaging} from "@/infra/messaging/messaging-client.js";
import {getWebRtcServer} from "@/infra/mediasoup/adapter/worker.adapter.js";
import * as storage from '@/storage/storage.js';
import * as routerAdapter from '@/infra/mediasoup/adapter/router.adapter.js';
import type {DtlsParameters, MediaKind, RtpCapabilities, RtpParameters, WebRtcTransport} from "mediasoup/types";

export function getRoomById(id: string) {
    const room = storage.findRoomById(id);
    if (!room) throw new Error(`Room ${id} not found`);
    return room;
}

export function getTransport(transportId: string) {
    const transport = storage.findTransportById(transportId);
    if (!transport) throw new Error(`Transport ${transportId} not found`);
    return transport;
}

export function getRouterByTransportId(transportId: string) {
    const router = storage.findRouterByTransportId(transportId);
    if (!router) throw new Error(`Router by transport ${transportId} not found`);
    return router;
}

export function getRouterByRoomId(roomId: string) {
    const router = storage.findRouterByRoomId(roomId);
    if (!router) throw new Error(`Router by room ${roomId} not found`);
    return router;
}

export async function createRoom(roomId: string, createdBy: string) {
    console.log(`[RoomService] Create room id=${roomId}`);
    const router = await routerAdapter.createRouter();
    storage.saveRouter(router, roomId);
    storage.saveRoom({id: roomId, createdBy, routerId: router.id});
    registerRoomRoutes(roomId);
    return {roomId};
}

export function joinRoom(participantId: string, roomId: string) {
    const participant = storage.findParticipantById(participantId);
    if (!participant) throw new Error(`Participant ${participantId} not found`);

    storage.joinRoom(roomId, participantId);
    messaging.room.publishParticipantJoined(roomId, participant);
}

export function leaveRoom(participantId: string, roomId: string) {
    const transports = storage.findTransportsByRoomId(roomId);
    transports.forEach(t => closeTransport(roomId, t.id));
    storage.leaveRoom(roomId, participantId);

    messaging.room.publishParticipantLeft(roomId, {participantId});
}

export async function getRtpCapabilities(roomId: string) {
    const room = getRoomById(roomId);
    const router = storage.findRouterById(room.routerId);
    if (!router) throw new Error(`Router ${room.routerId} not found`);
    return router.rtpCapabilities;
}

export async function createTransport(roomId: string) {
    const room = getRoomById(roomId);
    const router = getRouterByRoomId(roomId);
    const webRtcServer = getWebRtcServer();

    const transport = await router.createWebRtcTransport({
        webRtcServer,
        enableUdp: true,
        enableTcp: false,
    });

    storage.saveTransport(transport, room.routerId);
    registerTransportRoutes(roomId, transport);

    return {
        transportId: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
        sctpParameters: transport.sctpParameters,
    };
}

export async function connectTransport(transportId: string, dtlsParameters: DtlsParameters) {
    console.debug(`[RoomService] Connect transport ${transportId}`);
    await getTransport(transportId).connect({dtlsParameters});
}

export async function closeTransport(roomId: string, transportId: string) {
    console.debug(`[RoomService] Close transport ${transportId}`);
    const producers = storage.findProducersByTransport(transportId);
    const transport = getTransport(transportId);

    transport.close();
    storage.deleteTransport(transportId);

    messaging.producer.publishClose(roomId, {
        producers: producers.map(p => ({
            participantId: p.participantId,
            producerId: p.producer.id,
            kind: p.producer.kind,
        })),
    });
}

export async function createProducer(
    roomId: string,
    participantId: string,
    transportId: string,
    kind: MediaKind,
    rtpParameters: RtpParameters,
) {
    console.debug(`[RoomService] Create producer for transport ${transportId}`);
    getRoomById(roomId); // guard
    const transport = getTransport(transportId);
    const producer = await transport.produce({kind, rtpParameters});
    storage.saveProducer(producer, transportId, participantId);

    messaging.producer.publishNew(roomId, {
        kind: producer.kind,
        participantId,
        producerId: producer.id,
    });
    return {producerId: producer.id};
}

export function getRoomProducers(roomId: string) {
    console.debug(`[RoomService] Get room producers for room ${roomId}`);
    return {
        producers: storage.findProducersByRoom(roomId).map(({producer, participantId}) => ({
            producerId: producer.id,
            participantId,
            kind: producer.kind,
        })),
    };
}

export async function createConsumer(
    transportId: string,
    producerId: string,
    rtpCapabilities: RtpCapabilities,
) {
    console.debug(`[RoomService] Create consumer for producer ${producerId}, transport ${transportId}`);
    const transport = getTransport(transportId);
    const router = getRouterByTransportId(transportId);

    if (!router.canConsume({producerId, rtpCapabilities}))
        throw new Error(`Cannot consume producer ${producerId}`);

    const consumer = await transport.consume({
        producerId,
        rtpCapabilities,
        paused: true,
    });

    storage.saveConsumer(consumer, transportId);

    return {
        consumerId: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
    };
}

export async function resumeConsumer(consumerId: string): Promise<void> {
    console.debug(`[RoomService] Resume consumer ${consumerId}`);
    const consumer = storage.findConsumerById(consumerId);
    if (!consumer) throw new Error(`Consumer ${consumerId} not found`);
    await consumer.resume();
}

function registerRoomRoutes(roomId: string): void {
    messaging.room.onJoin(roomId, (event) => {
        console.debug(`[RoomService] Participant ${event.participantId} join room ${roomId}`);
        joinRoom(event.participantId, roomId);
    });

    messaging.router.onGetRtpCapabilities(roomId, () => {
        console.debug(`[RoomService] Get rtp capabilities ${roomId}`);
        return getRtpCapabilities(roomId);
    });

    messaging.room.onLeave(roomId, (event) => {
        console.debug(`[RoomService] Participant ${event.participantId} leaving room ${roomId}`);
        leaveRoom(event.participantId, roomId);
    });

    messaging.transport.onCreate(roomId, () => {
        console.debug(`[RoomService] Create transport for room ${roomId}`);
        return createTransport(roomId);
    });

    messaging.transport.onConnect(roomId, async (event) => {
        console.debug(`[RoomService] Connect transport ${event.transportId} from ${roomId}`);
        await connectTransport(event.transportId, event.dtlsParameters);
        return {transportId: event.transportId};
    });

    messaging.producer.onCreate(roomId, (event) => {
        console.debug(`[RoomService] Create producer for transport ${event.transportId}, kind ${event.kind}`);
        return createProducer(roomId, event.participantId, event.transportId, event.kind, event.rtpParameters);
    });

    messaging.producer.onGetList(roomId, () => {
        console.debug(`[RoomService] Get room ${roomId} producers`);
        return getRoomProducers(roomId);
    });

    messaging.consumer.onCreate(roomId, (event) => {
        console.debug(`[RoomService] Create consumer for transport ${event.transportId}, producer ${event.producerId}`);
        return createConsumer(event.transportId, event.producerId, event.recvRtpCapabilities);
    });

    messaging.consumer.onResume(roomId, (event) => {
        console.debug(`[RoomService] Resume consumer ${event.consumerId}`);
        return resumeConsumer(event.consumerId);
    });
}

function registerTransportRoutes(roomId: string, transport: WebRtcTransport) {
    transport.on('icestatechange', (iceState) => {
        console.debug(`[Room Service] Transport ICE: ${transport.id} ${iceState}`);
        // TODO задержка 30 сек +не факт что дисконет, может связь пропала
        // TODO удалять участника из комнаты
        if (iceState === 'disconnected')
            closeTransport(roomId, transport.id);
    });
}