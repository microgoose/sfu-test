import {DtlsParameters, MediaKind, RtpCapabilities, RtpParameters} from 'mediasoup/types';
import {messaging} from '../infra/messaging/messaging-client.ts';
import * as routerAdapter from '../infra/mediasoup/adapter/router.adapter.ts';
import * as storage from '../storage/storage.ts';
import {getWebRtcServer} from "@/infra/mediasoup/adapter/worker.adapter.ts";

// ---------------------------------------------------------------------------
// Room
// ---------------------------------------------------------------------------

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

export function getAllRooms() {
    return storage.findAllRooms();
}

export async function createRoom(roomId: string, createdBy: string): Promise<void> {
    const router = await routerAdapter.createRouter();
    storage.saveRouter(router, roomId);
    storage.saveRoom({ id: roomId, createdBy, routerId: router.id });
    registerRoomRoutes(roomId);
    console.log(`[RoomService] Room created id=${roomId}`);
}

// ---------------------------------------------------------------------------
// Participants
// ---------------------------------------------------------------------------

export function joinRoom(participantId: string, roomId: string) {
    const participant = storage.findParticipantById(participantId);
    if (!participant) throw new Error(`Participant ${participantId} not found`);

    const room = getRoomById(roomId);
    storage.joinRoom(roomId, participantId);

    const router = storage.findRouterById(room.routerId);
    if (!router) throw new Error(`Router ${room.routerId} not found`);

    messaging.room.publishParticipantJoined(roomId, { userId: participantId });
    console.debug(`[RoomService] Participant ${participantId} joined room ${roomId}`);
    return router.rtpCapabilities;
}

export function leaveRoom(participantId: string) {
    const rooms = storage.findRoomsByParticipant(participantId);
    if (rooms.length === 0) throw new Error(`Participant ${participantId} is not in any room`);

    for (const room of rooms) {
        storage.leaveRoom(room.id, participantId);
        messaging.room.publishParticipantLeft(room.id, { userId: participantId });
        console.debug(`[RoomService] Participant ${participantId} left room ${room.id}`);
    }
}

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

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

    const parameters = {
        transportId: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
        sctpParameters: transport.sctpParameters,
    };
    console.debug(`[RoomService] Transport ${transport.id} created in room ${roomId}`);
    return parameters;
}

export async function connectTransport(transportId: string, dtlsParameters: DtlsParameters) {
    await getTransport(transportId).connect({dtlsParameters});
    console.debug(`[RoomService] Transport ${transportId} connected`);
}

// ---------------------------------------------------------------------------
// Producer
// ---------------------------------------------------------------------------

export async function createProducer(
    roomId: string,
    participantId: string,
    transportId: string,
    kind: MediaKind,
    rtpParameters: RtpParameters,
) {
    getRoomById(roomId); // guard
    const transport = getTransport(transportId);
    const producer = await transport.produce({kind, rtpParameters});
    storage.saveProducer(producer, transportId, participantId);

    messaging.producer.publishNew(roomId, {
        kind: producer.kind,
        userId: participantId,
        producerId: producer.id,
    });
    console.debug(`[RoomService] Producer ${producer.id} created for transport ${transportId}`);
    return { producerId: producer.id };
}

export function getRoomProducers(roomId: string) {
    return {
        producers: storage.findProducersByRoom(roomId)
            .map(({ producer, userId }) => ({
                producerId: producer.id,
                userId,
                kind: producer.kind as 'audio' | 'video',
            })),
    };
}

// ---------------------------------------------------------------------------
// Consumer
// ---------------------------------------------------------------------------

export async function createConsumer(
    transportId: string,
    producerId: string,
    rtpCapabilities: RtpCapabilities,
) {
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

    const parameters = {
        consumerId: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
    };
    console.debug(`[RoomService] Consumer ${parameters.consumerId} created for transport ${transportId}`);
    return parameters;
}

export async function resumeConsumer(consumerId: string): Promise<void> {
    const consumer = storage.findConsumerById(consumerId);
    if (!consumer) throw new Error(`Consumer ${consumerId} not found`);
    await consumer.resume();
    console.debug(`[RoomService] Consumer resume ${consumerId}`);
}

// ---------------------------------------------------------------------------
// Internal: messaging routes
// ---------------------------------------------------------------------------

function registerRoomRoutes(roomId: string): void {
    messaging.room.onJoin(roomId, (event) => {
        console.debug(`[RoomService] Participant ${event.userId} joining room ${roomId}`);
        return { rtpCapabilities: joinRoom(event.userId, roomId) };
    });

    messaging.room.onLeave(roomId, (event) => {
        console.debug(`[RoomService] Participant ${event.userId} leaving room ${roomId}`);
        leaveRoom(event.userId);
    });

    messaging.transport.onCreate(roomId, () => {
        console.debug(`[RoomService] Create transport for room ${roomId}`);
        return createTransport(roomId);
    });

    messaging.transport.onConnect(roomId, async (event) => {
        console.debug(`[RoomService] Connect transport ${event.transportId} from ${roomId}`);
        await connectTransport(event.transportId, event.dtlsParameters);
        return { transportId: event.transportId };
    });

    messaging.producer.onCreate(roomId, (event) => {
        console.debug(`[RoomService] Create producer for transport ${event.transportId}, kind ${event.kind}`);
        return createProducer(roomId, event.userId, event.transportId, event.kind, event.rtpParameters);
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