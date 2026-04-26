import '../assets/css/room.css';
import {RoomCardList} from "@/view/components/room-card-list";
import {onCleanup, onMount} from "solid-js";
import {useRoomService} from "@/service/room.service";

export const RoomWidget = () => {
    const roomService = useRoomService();

    onMount(() => {
        window.addEventListener('pagehide', roomService.leave);
        roomService.join();
    });

    onCleanup(() => {
        window.removeEventListener('pagehide', roomService.leave);
        roomService.leave();
    });

    return <RoomCardList/>;
};
