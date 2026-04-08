import {getRouter, getWebRtcServer} from './router.service.ts';
import {
    Consumer,
    DtlsParameters,
    MediaKind,
    Producer,
    RtpCapabilities,
    RtpParameters,
    WebRtcTransport
} from "mediasoup/types";

interface TransportEntry {
    transport: WebRtcTransport;
    routerId: string;
}

const transports = new Map<string, TransportEntry>();
const producers = new Map<string, Producer>();
const consumers = new Map<string, Consumer>();

// transportId → producerId (для поиска роутера по producerId)
const producerToTransport = new Map<string, string>();

// ─── Transport ────────────────────────────────────────────────

export async function createTransport(routerId: string) {
    const router = getRouter(routerId);
    const webRtcServer = getWebRtcServer(routerId);

    const transport = await router.createWebRtcTransport({
        webRtcServer,
        enableUdp: true,
        enableTcp: false,
    });

    transports.set(transport.id, {transport, routerId});
    console.debug(`[Transport] Created id=${transport.id}`);

    return {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
        sctpParameters: transport.sctpParameters,
    };
}

export async function connectTransport(
    transportId: string,
    dtlsParameters: DtlsParameters,
): Promise<void> {
    const entry = getTransportEntry(transportId);
    await entry.transport.connect({dtlsParameters});
    console.debug(`[Transport] Connected id=${transportId}`);
}

// ─── Producer ─────────────────────────────────────────────────

export async function createProducer(
    transportId: string,
    kind: MediaKind,
    rtpParameters: RtpParameters
): Promise<string> {
    const {transport} = getTransportEntry(transportId);

    const producer = await transport.produce({kind, rtpParameters});
    producers.set(producer.id, producer);
    producerToTransport.set(producer.id, transportId);

    console.debug(`[Transport] Producer created id=${producer.id} kind=${kind}`);
    return producer.id;
}

// ─── Consumer ─────────────────────────────────────────────────

export function canConsume(
    producerId: string,
    rtpCapabilities: RtpCapabilities,
): boolean {
    const transportId = producerToTransport.get(producerId);
    if (!transportId) return false;

    const entry = transports.get(transportId);
    if (!entry) return false;

    const router = getRouter(entry.routerId);
    return router.canConsume({producerId, rtpCapabilities});
}

export async function createConsumer(
    transportId: string,
    producerId: string,
    rtpCapabilities: RtpCapabilities,
) {
    const {transport} = getTransportEntry(transportId);

    const consumer = await transport.consume({
        producerId,
        rtpCapabilities,
        paused: true,
    });

    consumers.set(consumer.id, consumer);
    console.debug(`[Transport] Consumer created id=${consumer.id}`);

    return {
        consumerId: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
    };
}

export async function resumeConsumer(consumerId: string): Promise<void> {
    const consumer = consumers.get(consumerId);
    if (!consumer) throw new Error(`Consumer ${consumerId} not found`);
    await consumer.resume();
    console.debug(`[Transport] Consumer resumed id=${consumerId}`);
}

// ─── Helpers ──────────────────────────────────────────────────

function getTransportEntry(transportId: string): TransportEntry {
    const entry = transports.get(transportId);
    if (!entry) throw new Error(`Transport ${transportId} not found`);
    return entry;
}