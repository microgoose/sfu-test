import '../assets/css/room.css';
import {RoomCardList} from "@/view/components/room-card-list";
import {participantStore} from "@/service/room-participant/participants.store";
import {RoomService} from "@/service/room.service";
import {onCleanup, onMount} from "solid-js";

interface RoomWidgetProps {
    roomService: RoomService
}

export const RoomWidget = (props: RoomWidgetProps) => {
    function join() {
        props.roomService.join().catch(console.error);
    }

    function leave() {
        props.roomService.leave().catch(console.error);
    }

    onMount(() => {
        window.addEventListener('pagehide', leave);
    });

    onCleanup(() => {
        window.removeEventListener('pagehide', leave);
        leave();
    });

    join();

    return <RoomCardList participants={participantStore.participants}/>;
};
