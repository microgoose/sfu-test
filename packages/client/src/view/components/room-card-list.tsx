import {For} from "solid-js";
import {RoomCard} from "@/view/components/room-card";
import {Participant} from "@/domain/model";

interface RoomCardListProps {
    participants: Participant[]
}

export function RoomCardList(props: RoomCardListProps) {
    return (
        <div class="room-card-grid">
            <For each={props.participants}>
                {(participant) => (
                    <RoomCard participant={participant}/>
                )}
            </For>
        </div>
    );
}