import {Accessor, createSignal} from 'solid-js';
import {Device} from 'mediasoup-client';
import {Consumer, MediaKind, RtpCapabilities, Transport, TransportOptions,} from 'mediasoup-client/types';
import {connectTransport, createConsumer, createProducer, createTransport, resumeConsumer} from "../api/transport.api";

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
    setup: (rtpCapabilities: RtpCapabilities) => void;
    onNewProducer: (producerId: string, kind: MediaKind) => Promise<void>
}

// TODO можно подумать о том что бы разделить на классы с состоянием, сложность ебейшая
// TODO сервер не чистит убывших, поток шлётся даже закрытым
export function useMediasoup(options: UseMediasoupOptions): MediasoupHook {
    const [videos, setVideos] = createSignal<VideoEntry[]>([]);

    const device = new Device();
    let recvTransport: Transport | null = null;

    function getRecvTransport() {
        if (!recvTransport)
            throw new Error('Recv transport not initialized!');
        return recvTransport;
    }

    async function setup(rtpCapabilities: RtpCapabilities) {
        if (device.loaded)
            return;

        await device.load({routerRtpCapabilities: rtpCapabilities});

        const sendTransportParams = await createTransport({
            direction: 'send',
            sctpCapabilities: device.sctpCapabilities
        });
        const sendTransport = createLocalSendTransport(device, sendTransportParams);

        const recvTransportParams = await createTransport({
            direction: 'recv',
            sctpCapabilities: device.sctpCapabilities
        });
        recvTransport = createLocalRecvTransport(device, recvTransportParams);

        await startProducing(sendTransport);
    }

    function createLocalSendTransport(device: Device, parameters: TransportOptions) {
        console.debug('Send transport created');
        const sendTransport = device.createSendTransport(parameters);

        sendTransport.on('connect', ({dtlsParameters}, callback, errback) => {
            console.debug(`Connect send transport ${sendTransport.id}, dtlsParameters ${JSON.stringify(dtlsParameters)}`);
            connectTransport({transportId: sendTransport.id, dtlsParameters})
                .then(callback)
                .catch(errback);
        });

        sendTransport.on('produce', ({kind, rtpParameters, appData}, callback, errback) => {
            console.debug(`Create producer, transport ${sendTransport.id} ${kind} ${JSON.stringify(rtpParameters)}`);
            createProducer({transportId: sendTransport.id, kind, rtpParameters, appData})
                .then(payload => callback({ id: payload.producerId }))
                .catch(errback);
        });

        return sendTransport;
    }

    function createLocalRecvTransport(device: Device, parameters: TransportOptions) {
        console.debug('Recv transport created');
        const recvTransport = device.createRecvTransport(parameters);

        recvTransport.on('connect', ({dtlsParameters}, callback, errback) => {
            console.debug(`Connect recv transport ${recvTransport.id}, dtlsParameters ${JSON.stringify(dtlsParameters)}`);
            connectTransport({transportId: recvTransport.id, dtlsParameters})
                .then(callback)
                .catch(errback);
        });

        return recvTransport;
    }

    async function startProducing(sendTransport: Transport) {
        console.debug(`Start producing.. Transport ${sendTransport.id}`);
        const stream = options.getStream();
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        setVideos(prev => [...prev, {
            id: 'local',
            label: `Local track`,
            stream: stream,
        }]);

        if (videoTrack) await sendTransport.produce({track: videoTrack});
        if (audioTrack) await sendTransport.produce({track: audioTrack});
    }

    function applyConsumer(producerId: string, consumer: Consumer) {
        const mediaStream = new MediaStream([consumer.track]);
        setVideos(prev => {
            const existing = prev.find(v => v.id === producerId);
            if (existing) {
                existing.stream.addTrack(consumer.track);
                return [...prev];
            }

            return [...prev, {
                id: producerId,
                label: `Participant ${producerId.slice(0, 6)}`,
                stream: mediaStream,
            }];
        });
    }

    async function onNewProducer(producerId: string, kind: MediaKind) {
        console.debug(`On new producer, producerId=${producerId} kind=${kind}`);
        const consumerParams = await createConsumer({
            transportId: getRecvTransport().id,
            producerId,
            rtpCapabilities: device.recvRtpCapabilities,
            kind,
        });
        console.debug(`Consumer created:`, JSON.stringify(consumerParams));

        const consumer = await getRecvTransport().consume({
            id: consumerParams.consumerId,
            producerId,
            kind,
            rtpParameters: consumerParams.rtpParameters,
        });
        console.debug(`Consume started id=${consumer.id} kind=${consumer.kind}`);

        applyConsumer(producerId, consumer);
        resumeConsumer({ consumerId: consumer.id });
    }

    return {
        videos,
        setup,
        onNewProducer,
    };
}