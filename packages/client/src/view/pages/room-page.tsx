import '../assets/css/room.css';
import {useParams} from "@solidjs/router";
import {createResource, Show} from "solid-js";
import {createRoomService, RoomContext} from "@/service/room.service";
import {TextLoader} from "@/view/components/text-loader";
import {RoomWidget} from "@/view/components/room-widget";

export const RoomPage = () => {
    const params = useParams<{ roomId: string }>();
    const [roomService] = createResource(
        () => params.roomId,
        roomId => createRoomService(roomId)
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
                        {roomService => (
                            <RoomContext.Provider value={roomService()}>
                                <RoomWidget/>
                            </RoomContext.Provider>
                        )}
                    </Show>
                </div>
            </section>
        </main>
    );
};
