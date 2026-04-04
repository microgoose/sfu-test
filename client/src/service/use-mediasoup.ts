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

export function useMediasoup(options: UseMediasoupOptions): MediasoupHook {
    const [videos, setVideos] = createSignal<VideoEntry[]>([]);

    const device = new Device();
    const connectCallbacks = new Map<string, () => void>();
    const produceCallbacks = new Map<string, (id: { id: string }) => void>();

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
        await device.load({ routerRtpCapabilities: rtpCapabilities });

        createTransport({ direction: 'send', sctpCapabilities: device.sctpCapabilities });
        createTransport({ direction: 'recv', sctpCapabilities: device.sctpCapabilities });
    }

    // ─── Транспорты ───────────────────────────────────────────

    async function handleSendTransportCreated(parameters: TransportOptions) {
        const newSendTransport = sendTransport = device.createSendTransport(parameters);

        newSendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
            try {
                connectCallbacks.set(newSendTransport.id, callback);
                connectTransport({ transportId: newSendTransport.id, dtlsParameters });
            } catch (e: any) {
                errback(e);
            }
        });

        newSendTransport.on('produce', ({ kind, rtpParameters, appData }, callback, errback) => {
            try {
                produceCallbacks.set(kind, callback); // матчим по kind
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
        const newRecvTransport = recvTransport = device.createRecvTransport(parameters);

        newRecvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
            try {
                connectCallbacks.set(newRecvTransport.id, callback);
                connectTransport({ transportId: newRecvTransport.id, dtlsParameters });
            } catch (e: any) {
                errback(e);
            }
        });
    }

    function handleTransportConnected(transportId: string) {
        const cb = connectCallbacks.get(transportId);
        if (cb) {
            cb();
            connectCallbacks.delete(transportId);
        }
    }

    // ─── Producer ─────────────────────────────────────────────

    async function startProducing() {
        const videoTrack = options.getStream().getVideoTracks()[0];
        const audioTrack = options.getStream().getAudioTracks()[0];

        if (videoTrack) await getSendTransport().produce({ track: videoTrack });
        if (audioTrack) await getSendTransport().produce({ track: audioTrack });
    }

    function handleProduced(producerId: string, kind: MediaKind) {
        const cb = produceCallbacks.get(kind);
        if (cb) {
            cb({ id: producerId });
            produceCallbacks.delete(kind);
        }
    }

    // ─── Consumer ─────────────────────────────────────────────

    function handleNewProducer(producerId: string, kind: MediaKind) {
        consume({
            transportId: getRecvTransport().id,
            producerId,
            kind,
            rtpCapabilities: device.recvRtpCapabilities,
        });
    }

    async function handleConsumed(payload: ConsumedMessage['payload']) {
        const { consumerId, producerId, kind, rtpParameters } = payload;

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

        resumeConsumer({ consumerId: consumer.id });
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