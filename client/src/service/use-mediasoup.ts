import {createSignal} from 'solid-js';
import {Device} from 'mediasoup-client';
import {Consumer, MediaKind, RtpCapabilities, Transport, TransportOptions,} from 'mediasoup-client/types';
import {
    connectTransport,
    createConsumer,
    createProducer,
    createTransport,
    getRoomProduces,
    resumeConsumer
} from "../api/transport.api";
import {subscribe} from "../messaging/client";
import {TOPICS} from "../messaging/topics";
import {NewProducerMessage} from "../messaging/types/transport.types";

interface VideoEntry {
    id: string;
    label: string;
    stream: MediaStream;
}

interface UseMediasoupOptions {
    roomId: string,
    getStream: () => MediaStream;
}

// TODO можно подумать о том что бы разделить на классы с состоянием, сложность ебейшая
// TODO сервер не чистит убывших, поток шлётся даже закрытым
export function useMediasoup(options: UseMediasoupOptions) {
    const [videos, setVideos] = createSignal<VideoEntry[]>([]);

    const device = new Device();
    let recvTransport: Transport | null = null;

    function getRecvTransport() {
        if (!recvTransport)
            throw new Error('Recv transport not initialized!');
        return recvTransport;
    }

    function createLocalSendTransport(device: Device, parameters: TransportOptions) {
        console.debug('Send transport created');
        const sendTransport = device.createSendTransport(parameters);

        sendTransport.on('connect', ({dtlsParameters}, callback, errback) => {
            console.debug(`Connect send transport ${sendTransport.id}`);
            connectTransport({transportId: sendTransport.id, dtlsParameters})
                .then(callback)
                .catch(errback);
        });

        sendTransport.on('produce', ({kind, rtpParameters, appData}, callback, errback) => {
            console.debug(`Create producer, transport ${sendTransport.id} ${kind}`);
            createProducer({transportId: sendTransport.id, kind, rtpParameters, appData})
                .then(payload => callback({ id: payload.producerId }))
                .catch(errback);
        });

        return sendTransport;
    }

    function createLocalRecvTransport(device: Device, parameters: TransportOptions) {
        console.debug('Recv transport created');
        const recvTransport = device.createRecvTransport(parameters);

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

        async function consumeNewProducer(producerId: string, kind: MediaKind) {
            console.debug(`Add new producer, producerId=${producerId} kind=${kind}`);
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
            resumeConsumer({consumerId: consumer.id});
        }

        recvTransport.on('connect', ({dtlsParameters}, callback, errback) => {
            console.debug(`Connect recv transport ${recvTransport.id}`);
            connectTransport({transportId: recvTransport.id, dtlsParameters})
                .then(callback)
                .catch(errback);
        });

        getRoomProduces(options.roomId).then(producers => {
            producers.forEach(p => consumeNewProducer(p.producerId, p.kind));
        });

        subscribe<NewProducerMessage>(TOPICS.producer.new, (msg) => {
            consumeNewProducer(msg.payload.producerId, msg.payload.kind)
                .catch(console.error);
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

    return { videos, setup };
}