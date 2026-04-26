import {getWebRtcServer} from "@/infra/mediasoup/adapter/worker.adapter.js";
import * as storage from '@/storage/storage.js';
import type {DtlsParameters, MediaKind, RtpCapabilities, RtpParameters} from "mediasoup/types";
import {publishCloseProducer, publishNewProducer} from "@/service/messaging.service.js";
import {getRoomById} from "@/service/room.service.js";

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

export async function getRtpCapabilities(roomId: string) {
    const room = getRoomById(roomId);
    const router = storage.findRouterById(room.routerId);
    if (!router) throw new Error(`Router ${room.routerId} not found`);
    return {rtpCapabilities: router.rtpCapabilities};
}

export async function createTransport(participantId: string, roomId: string) {
    const room = getRoomById(roomId);
    const router = getRouterByRoomId(roomId);
    const webRtcServer = getWebRtcServer();

    const transport = await router.createWebRtcTransport({
        webRtcServer,
        enableUdp: true,
        enableTcp: false,
    });

    storage.saveTransport(transport, participantId, room.routerId);

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
    return {transportId};
}

export async function closeTransport(roomId: string, transportId: string) {
    console.debug(`[RoomService] Close transport ${transportId}`);
    const producers = storage.findProducersByTransport(transportId);
    const transport = getTransport(transportId);

    transport.close();
    storage.deleteTransport(transportId);

    publishCloseProducer(roomId, {
        producers: producers.map(p => ({
            participantId: p.participantId,
            producerId: p.producer.id,
            kind: p.producer.kind,
        })),
    });
}

export interface CreateProducerParams {
    roomId: string,
    participantId: string,
    transportId: string,
    kind: MediaKind,
    rtpParameters: RtpParameters,
}

export async function createProducer(params: CreateProducerParams) {
    console.debug(`[RoomService] Create producer for transport ${params.transportId}`);
    getRoomById(params.roomId); // guard
    const transport = getTransport(params.transportId);
    const producer = await transport.produce({kind: params.kind, rtpParameters: params.rtpParameters});
    storage.saveProducer(producer, params.transportId, params.participantId);

    publishNewProducer(params.roomId, {
        kind: producer.kind,
        participantId: params.participantId,
        producerId: producer.id,
    });

    return { producerId: producer.id };
}

export function getRoomProducers(roomId: string) {
    return {
        producers: storage.findProducersByRoom(roomId).map(({producer, participantId}) => ({
            producerId: producer.id,
            participantId,
            kind: producer.kind,
        })),
    };
}

export interface CreateConsumerParams {
    transportId: string,
    producerId: string,
    recvRtpCapabilities: RtpCapabilities,
}

export async function createConsumer(params: CreateConsumerParams) {
    console.debug(`[RoomService] Create consumer for producer ${params.producerId}, transport ${params.transportId}`);
    const transport = getTransport(params.transportId);
    const router = getRouterByTransportId(params.transportId);

    if (!router.canConsume({producerId: params.producerId, rtpCapabilities: params.recvRtpCapabilities}))
        throw new Error(`Cannot consume producer ${params.producerId}`);

    const consumer = await transport.consume({
        producerId: params.producerId,
        rtpCapabilities: params.recvRtpCapabilities,
        paused: true,
    });

    storage.saveConsumer(consumer, params.transportId);

    return {
        consumerId: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
    };
}

export function resumeConsumer(consumerId: string) {
    const consumer = storage.findConsumerById(consumerId);
    if (!consumer) throw new Error(`Consumer ${consumerId} not found`);
    consumer.resume().catch(console.error);
}