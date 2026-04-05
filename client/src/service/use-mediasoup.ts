import {Accessor, createSignal} from 'solid-js';
import {Device} from 'mediasoup-client';
import {MediaKind, RtpCapabilities, Transport, TransportOptions,} from 'mediasoup-client/types';
import {
    connectTransport,
    consume,
    createTransport,
    produce,
    resumeConsumer
} from "../messaging/publishers/transport.publisher";
import {ConsumedMessage} from "../messaging/types/transport.types";

interface VideoEntry {
    id: string;
    label: string;
    stream: MediaStream;
}

interface UseMediasoupOptions {
    getStream: () => MediaStream;
}

interface PendingProducer {
    producerId: string,
    kind: MediaKind
}

export interface MediasoupHook {
    videos: Accessor<VideoEntry[]>,
    handleRtpCapabilities: (rtpCapabilities: RtpCapabilities) => void;
    handleSendTransportCreated: (parameters: TransportOptions) => void;
    handleRecvTransportCreated: (parameters: TransportOptions) => void;
    handleTransportConnected: (transportId: string) => void;
    handleProduced: (producerId: string, kind: MediaKind) => void;
    handleNewProducer: (producerId: string, kind: MediaKind) => void;
    handleConsumed: (payload: ConsumedMessage['payload']) => void;
}

// TODO можно подумать о том что бы разделить на классы с состоянием, сложность ебейшая
// TODO сервер не чистит убывших, поток шлётся даже закрытым
export function useMediasoup(options: UseMediasoupOptions): MediasoupHook {
    const [videos, setVideos] = createSignal<VideoEntry[]>([]);

    const device = new Device();
    const connectCallbacks = new Map<string, () => void>();
    const produceCallbacks = new Map<string, (id: { id: string }) => void>();
    const pendingProducers = new Map<string, MediaKind>();

    let sendTransport: Transport | null = null;
    let recvTransport: Transport | null = null;

    function getSendTransport() {
        if (!sendTransport)
            throw new Error('Send transport is null');
        return sendTransport;
    }

    function getRecvTransport() {
        if (!recvTransport)
            throw new Error('Send transport is null');
        return recvTransport;
    }

    // ─── Device ──────────────────────────────────────────────

    async function handleRtpCapabilities(rtpCapabilities: RtpCapabilities) {
        console.debug('Handle RTP capabilities');

        if (!device.loaded) {
            console.debug('Load device');
            await device.load({routerRtpCapabilities: rtpCapabilities});
        }

        createTransport({direction: 'send', sctpCapabilities: device.sctpCapabilities});
        createTransport({direction: 'recv', sctpCapabilities: device.sctpCapabilities});
    }

    // ─── Транспорты ───────────────────────────────────────────

    async function handleSendTransportCreated(parameters: TransportOptions) {
        console.debug('Send transport created');
        const newSendTransport = sendTransport = device.createSendTransport(parameters);

        newSendTransport.on('connect', ({dtlsParameters}, callback, errback) => {
            try {
                console.debug(`Connect send transport ${newSendTransport.id}`);
                connectCallbacks.set(newSendTransport.id, callback);
                connectTransport({transportId: newSendTransport.id, dtlsParameters});
            } catch (e: any) {
                errback(e);
            }
        });

        newSendTransport.on('produce', ({kind, rtpParameters, appData}, callback, errback) => {
            try {
                console.debug(`Request producer, transport ${newSendTransport.id} ${kind}`);
                produceCallbacks.set(kind, callback);
                produce({
                    transportId: newSendTransport.id,
                    kind,
                    rtpParameters,
                    appData,
                });
            } catch (e: any) {
                errback(e);
            }
        });

        await startProducing();
    }

    async function handleRecvTransportCreated(parameters: TransportOptions) {
        console.debug('Recv transport created');
        const newRecvTransport = recvTransport = device.createRecvTransport(parameters);

        newRecvTransport.on('connect', ({dtlsParameters}, callback, errback) => {
            try {
                console.debug(`Connect recv transport ${newRecvTransport.id}`);
                connectCallbacks.set(newRecvTransport.id, callback);
                connectTransport({transportId: newRecvTransport.id, dtlsParameters});
            } catch (e: any) {
                errback(e);
            }
        });

        for (const [producerId, kind] of pendingProducers.entries()) {
            doConsume(producerId, kind);
        }
        pendingProducers.clear();
    }

    function handleTransportConnected(transportId: string) {
        console.debug(`Transport connected ${transportId}`);
        console.debug('Send transport id:', sendTransport?.id);
        console.debug('Recv transport id:', recvTransport?.id);

        const cb = connectCallbacks.get(transportId);
        if (cb) {
            cb();
            connectCallbacks.delete(transportId);
        }
    }

    // ─── Producer ─────────────────────────────────────────────

    async function startProducing() {
        console.debug(`Start produsing..`);
        const stream = options.getStream();
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        setVideos(prev => [...prev, {
            id: 'local',
            label: `Local track`,
            stream: stream,
        }]);

        if (videoTrack) await getSendTransport().produce({track: videoTrack});
        if (audioTrack) await getSendTransport().produce({track: audioTrack});
    }

    function handleProduced(producerId: string, kind: MediaKind) {
        console.debug(`Producer registred ${producerId}`);
        const cb = produceCallbacks.get(kind);
        if (cb) {
            cb({id: producerId});
            produceCallbacks.delete(kind);
        }
    }

    // ─── Consumer ─────────────────────────────────────────────

    function handleNewProducer(producerId: string, kind: MediaKind) {
        if (!recvTransport) {
            console.debug(`Queuing producer ${producerId} (no transport yet)`);
            pendingProducers.set(producerId, kind);
            return;
        }

        console.debug(`Consuming producer ${producerId}`);
        doConsume(producerId, kind);
    }

    function doConsume(producerId: string, kind: MediaKind) {
        console.debug(`Start consuming producer ${producerId}`);
        consume({
            transportId: getRecvTransport().id,
            producerId,
            kind,
            rtpCapabilities: device.recvRtpCapabilities,
        });
    }

    async function handleConsumed(payload: ConsumedMessage['payload']) {
        console.debug('Handle consumed');
        const {consumerId, producerId, kind, rtpParameters} = payload;
        pendingProducers.delete(producerId);

        const consumer = await getRecvTransport().consume({
            id: consumerId,
            producerId,
            kind,
            rtpParameters,
        });

        const mediaStream = new MediaStream([consumer.track]);

        setVideos(prev => {
            // audio — добавляем трек к существующему участнику
            const existing = prev.find(v => v.id === producerId);
            if (existing) {
                existing.stream.addTrack(consumer.track);
                return [...prev];
            }

            // video — создаём новый стрим
            return [...prev, {
                id: producerId,
                label: `Participant ${producerId.slice(0, 6)}`,
                stream: mediaStream,
            }];
        });

        resumeConsumer({consumerId: consumer.id});
    }

    return {
        videos,
        // Хэндлеры для useRoom
        handleRtpCapabilities,
        handleSendTransportCreated,
        handleRecvTransportCreated,
        handleTransportConnected,
        handleProduced,
        handleNewProducer,
        handleConsumed,
    };
}