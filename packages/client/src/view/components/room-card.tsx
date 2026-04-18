import {Participant} from "@/domain/model";
import {VideoCard} from "@/view/components/video-card";

interface RoomCardProps {
    participant: Participant
}

export const RoomCard = (props: RoomCardProps) => {
    return (
        <article class="room-card">
            <VideoCard participant={props.participant}/>
            <span class="room-card-label">{props.participant.name}</span>
        </article>
    );
};