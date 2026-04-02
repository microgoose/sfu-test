import {createSignal, onCleanup, onMount} from "solid-js";
import {Device} from "mediasoup-client";
import {createWsClient, MESSAGE_TYPES} from "../config/ws-config";
import {createRandomBallCanvasAnimation} from "./random-ball-animation";
import {AppData, RtpCapabilities, Transport, TransportOptions} from "mediasoup-client/types";

interface VideoEntry {
    id: string;
    label: string;
    stream: MediaStream;
}

interface UseRoomOptions {
    roomId: string;
    wsUrl: string;
    getCanvas: () => HTMLCanvasElement;
}

export function useRoom(options: UseRoomOptions) {
    const {roomId, wsUrl, getCanvas} = options;

    const [videos, setVideos] = createSignal<VideoEntry[]>([]);

    const device = new Device();
    const connectCallbacks = new Map<string, Function>();
    let recvTransport = null;
    const wsClient = createWsClient(wsUrl);

    onMount(() => {
        const canvasAnimation = createRandomBallCanvasAnimation(getCanvas());

        setVideos([{
            id: "local",
            label: "Local preview",
            stream: canvasAnimation.getStream(),
        }]);

        onCleanup(() => {
            canvasAnimation.stop();
            wsClient.leaveRoom(roomId);
        });
    });

    wsClient.setRoute(MESSAGE_TYPES.CONNECT, () => {
        wsClient.joinRoom(roomId);
    });

    wsClient.setRoute(MESSAGE_TYPES.PARTICIPANT_JOINED, (data) => {
        console.log("Participant joined", data);
    });

    wsClient.setRoute(MESSAGE_TYPES.PARTICIPANT_LEFT, (data) => {
        console.log("Participant left", data);
    });

    wsClient.setRoute(MESSAGE_TYPES.RTP_CAPABILITIES_EVENT, async (data) => {
        await device.load({routerRtpCapabilities: data.rtpCapabilities});
        wsClient.createTransport(device.sctpCapabilities);
    });

    wsClient.setRoute(MESSAGE_TYPES.SEND_TRANSPORT_CREATED, async (data: { parameters: TransportOptions }) => {
        const sendTransport = device.createSendTransport(data.parameters);

        sendTransport.on('connect', ({dtlsParameters}, callback, errback) => {
            try {
                connectCallbacks.set(sendTransport.id, callback);
                wsClient.connectTransport({ transportId: sendTransport.id, dtlsParameters });
            } catch (e) { errback(e); }
        });

        // 2. Браузер готов отправить трек — сообщаем серверу, получаем producerId
        sendTransport.on('produce', async ({kind, rtpParameters, appData}, callback, errback) => {
            try {
                wsClient.produce({
                    transportId: sendTransport.id,
                    kind,
                    rtpParameters,
                    appData,
                });

                wsClient.setRoute(MESSAGE_TYPES.PRODUCED, (data) => {
                    console.log(`Produced ${JSON.stringify(data)}`);
                    callback({id: data.producerId});
                });
            } catch (error) {
                errback(error);
            }
        });

        // 3. Только теперь вызываем produce — он триггерит события выше
        const canvasStream = videos()[0]?.stream;
        if (canvasStream) {
            const track = canvasStream.getVideoTracks()[0];
            if (track) {
                await sendTransport.produce({track});
            }
        }
    });

    wsClient.setRoute(MESSAGE_TYPES.RECV_TRANSPORT_CREATED, async (data: { parameters: TransportOptions }) => {
        recvTransport = device.createRecvTransport(data.parameters);

        recvTransport.on('connect', ({dtlsParameters}, callback, errback) => {
            try {
                connectCallbacks.set(recvTransport.id, callback);
                wsClient.connectTransport({transportId: recvTransport.id, dtlsParameters});
            } catch (e) { errback(e); }
        });
    });

    wsClient.setRoute(MESSAGE_TYPES.TRANSPORT_CONNECTED, ({transportId}) => {
        const cb = connectCallbacks.get(transportId);
        if (cb) {
            cb();
            connectCallbacks.delete(transportId);
        }
    });

    wsClient.setRoute(MESSAGE_TYPES.NEW_PRODUCER, async (data: {
        producerId: string,
        kind: string
    }) => {
        console.log(`New producer ${data.producerId}`);
        wsClient.consume({
            transportId: recvTransport.id,
            producerId: data.producerId,
            kind: data.kind,
            rtpCapabilities: device.rtpCapabilities,
        });
    });

    wsClient.setRoute(MESSAGE_TYPES.CONSUMED, async ({id, producerId, kind, rtpParameters}) => {
        console.log(`New consumer ${id}; ${producerId}`);
        const consumer = await recvTransport.consume({id, producerId, kind, rtpParameters});
        const stream = new MediaStream([consumer.track]);

        setVideos(prev => [...prev, {
            id: id,
            label: `Participant ${producerId.slice(0, 6)}`,
            stream,
        }]);

        wsClient.resumeConsumer({consumerId: consumer.id});
    })

    return {videos};
}