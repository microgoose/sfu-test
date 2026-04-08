import {onCleanup, onMount} from 'solid-js';
import {getStompClient} from '../messaging/client';
import {useMediasoup} from './use-mediasoup';
import {joinRoom, leaveRoom} from "../api/rooms-api";

interface UseRoomOptions {
    roomId: string;
    getStream: () => MediaStream;
}

export function useRoom(options: UseRoomOptions) {
    const {roomId} = options;
    const mediasoup = useMediasoup(options);

    onMount(() => {
        // TODO параша, какого хуя здесь инициализация
        const client = getStompClient();

        client.onConnect = async () => {
            console.debug('Connected');
            const {rtpCapabilities} = await joinRoom(roomId);
            mediasoup.setup(rtpCapabilities).catch(console.error);
        };

        client.activate();
    });

    onCleanup(() => {
        leaveRoom(roomId)
            .then(() => getStompClient().deactivate())
            .catch(console.error);
    });

    return {
        videos: mediasoup.videos,
    };
}