import {For} from "solid-js";
import {RoomCard} from "@/view/components/room-card";
import {participants} from "@/service/room-participant/participants.store";

export function RoomCardList() {
    return (
        <div class="room-card-grid">
            <For each={participants}>
                {(participant) => <RoomCard participant={participant}/>}
            </For>
        </div>
    );
}