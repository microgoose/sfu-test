import {onCleanup, onMount} from 'solid-js';
import {getStompClient, subscribe} from '../messaging/client';
import {useMediasoup} from './use-mediasoup';
import {joinRoom, leaveRoom} from "../api/rooms-api";
import {NewProducerMessage} from "../messaging/types/transport.types";
import {TOPICS} from "../messaging/topics";
import {StompSubscription} from "@stomp/stompjs";

interface UseRoomOptions {
    roomId: string;
    getStream: () => MediaStream;
}

export function useRoom(options: UseRoomOptions) {
    const {roomId} = options;
    const mediasoup = useMediasoup(options);
    const subs: StompSubscription[] = [];

    onMount(() => {
        // TODO параша, какого хуя здесь инициализация
        const client = getStompClient();

        client.onConnect = async () => {
            console.debug('Connected');
            const {rtpCapabilities} = await joinRoom(roomId);
            mediasoup.setup(rtpCapabilities);

            subs.push(subscribe<NewProducerMessage>(
                TOPICS.producer.new,
                (msg) => mediasoup.onNewProducer(msg.payload.producerId, msg.payload.kind)
            ));
        };

        client.activate();

        onCleanup(() => {
            subs.forEach(sub => sub.unsubscribe());
            subs.length = 0;
            leaveRoom(roomId).then(() => getStompClient().deactivate());
        });
    });

    return {
        videos: mediasoup.videos,
    };
}