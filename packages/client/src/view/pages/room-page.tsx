import '../assets/css/room.css';
import {useParams} from "@solidjs/router";
import {createResource, Show} from "solid-js";
import {createRoomService} from "@/service/room.service";
import {RoomWidget} from "@/view/components/room-widget";
import {TextLoader} from "@/view/components/text-loader";

export const RoomPage = () => {
    const params = useParams<{ roomId: string }>();
    const [roomService] = createResource(
        params.roomId,
        (roomId) => createRoomService(roomId)
    );

    return (
        <main class="page">
            <section class="terminal-shell">
                <header class="terminal-header">
                    <h1 class="terminal-title">Room</h1>
                    <span class="terminal-subtitle">id={params.roomId}</span>
                </header>
                <div class="terminal-body">
                    <Show when={roomService()} fallback={<TextLoader/>}>
                        {rs => <RoomWidget roomService={rs()}/> }
                    </Show>
                </div>
            </section>
        </main>
    );
};
