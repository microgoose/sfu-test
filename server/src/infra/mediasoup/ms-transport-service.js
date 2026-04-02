import {getRouter, getWebRtcServerByRouterId} from "./ms-router-service.js";

const transports = new Map();
const consumers = new Map();
const producers = new Map();
const transportRouter = new Map();
const producerTransport = new Map();
const consumerTransport = new Map();

export function getTransport(transportId) {
    const transport = transports.get(transportId);
    if (!transport)
        throw new Error(`Transport ${transportId} not found`);
    return transport;
}

export function getRouterByProducerId(producerId) {
    const transport = producerTransport.get(producerId);
    if (!transport)
        throw new Error(`Producer ${producerId} transport not found`);

    const router = transportRouter.get(transport.id);
    if (!router)
        throw new Error(`Transport ${transport.id} router not found`);
    return router;
}

export async function createTransport(routerId) {
    console.debug(`Creating transport for router id=${routerId}`);
    const router = getRouter(routerId);
    const webRtcServer = getWebRtcServerByRouterId(routerId);

    const transport = await router.createWebRtcTransport({
        webRtcServer: webRtcServer,
        enableUdp: true,
        enableTcp: false
    });

    transports.set(transport.id, transport);
    transportRouter.set(transport.id, router);
    console.debug(`Transport created id=${transport.id} for router id=${routerId}`);

    return {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
        sctpParameters: transport.sctpParameters,
    };
}

export async function connectTransport(transportId, dtlsParameters) {
    console.debug(`Connecting transport id=${transportId}`);
    const transport = getTransport(transportId);
    await transport.connect({dtlsParameters});
    console.debug(`Transport connected id=${transportId}`);
}

export async function produceTransport(transportId, {kind, rtpParameters, appData}) {
    console.debug(`Producing on transport id=${transportId}`);
    const transport = getTransport(transportId);
    const producer = await transport.produce({kind, rtpParameters, appData});
    producers.set(producer.id, producer);
    producerTransport.set(producer.id, transport);
    console.debug(`Producer created id=${producer.id}`);
    return producer.id;
}

export async function consumeTransport(transportId, producerId, rtpCapabilities) {
    console.debug(`Consuming on transport id=${transportId}`);
    const transport = getTransport(transportId);
    const consumer = await transport.consume({
        producerId,
        rtpCapabilities,
        paused: true,
    });

    consumers.set(consumer.id, consumer);
    consumerTransport.set(consumer.id, transport);
    console.debug(`Consumer created id=${consumer.id}`);

    return {
        id: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
    };
}

export async function resumeConsume(consumerId) {
    const consumer = consumers.get(consumerId);
    consumer.resume();
}