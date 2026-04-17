import {Participant} from "@/domain/types";
import {VideoCard} from "@/view/components/video-card";
import {Show} from "solid-js";

interface RoomCardProps {
    participant: Participant
}

export const RoomCard = (props: RoomCardProps) => {
    return (
        <article class="room-card">
            <Show when={props.participant.media}>
                {stream => <VideoCard stream={stream()}/>}
            </Show>

            <span class="room-card-label">{props.participant.name}</span>
        </article>
    );
};