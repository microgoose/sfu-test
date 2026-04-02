import { createResource } from "solid-js";
import {RoomList} from "../components/room-list";
import {getRoomList} from "../api/rooms-api";

export const Rooms = () => {
    const [rooms] = createResource(getRoomList);

    return (
        <main class="page">
            <section class="terminal-shell">
                <header class="terminal-header">
                    <h1 class="terminal-title">Rooms</h1>
                    <span class="terminal-subtitle">Available room list</span>
                </header>
                <div class="terminal-body">
                    <RoomList rooms={rooms()} loading={rooms.loading} />
                </div>
            </section>
        </main>
    );
};