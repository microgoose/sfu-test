import {For, Show} from "solid-js";
import {RoomCard} from "./room-card";
import {RoomCardSkeleton} from "./room-card-skeleton";

interface Room {
    id: string | number;
}

interface RoomListProps {
    rooms: Room[] | undefined;
    loading: boolean;
}

export const RoomList = (props: RoomListProps) => (
    <div class="terminal-list">
        <Show
            when={!props.loading}
            fallback={
                <For each={Array(3)}>
                    {() => <RoomCardSkeleton />}
                </For>
            }
        >
            <Show
                when={props.rooms?.length}
                fallback={<div class="terminal-empty">No rooms found.</div>}
            >
                <For each={props.rooms}>
                    {(room) => <RoomCard id={room.id} />}
                </For>
            </Show>
        </Show>
    </div>
);