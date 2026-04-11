import {onCleanup, onMount} from "solid-js";
import {useMediasoup} from "@/service/use-mediasoup";
import {client, messaging} from "@/infra/messaging/messaging-client";
import {connectMessagingClient} from "@sfu-test/messaging";

interface UseRoomOptions {
    roomId: string;
    getStream: () => MediaStream;
}

export function useRoom(options: UseRoomOptions) {
    const {roomId} = options;
    const mediasoup = useMediasoup(options);

    onMount(async () => {
        // TODO параша, какого хуя здесь инициализация
        await connectMessagingClient(client);
        // TODO фиксированный юзер
        const response = await messaging.room.join(roomId, { userId: '1' });
        mediasoup.setup(response.rtpCapabilities);
    });

    onCleanup(() => {
        messaging.room.leave(roomId, { userId: '1' });
    });

    return {
        videos: mediasoup.videos,
    };
}