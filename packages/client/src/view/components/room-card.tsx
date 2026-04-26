import {ParticipantVideo} from "@/view/components/participant-video";
import {ParticipantAudio} from "@/view/components/participant-audio";
import {Participant} from "@/service/participants.store";

interface RoomCardProps {
    participant: Participant
}

export const RoomCard = (props: RoomCardProps) => {
    return (
        <article class="room-card">
            <ParticipantVideo participant={props.participant}/>
            <ParticipantAudio audioTrack={props.participant.audioTrack}/>
            <span class="room-card-label">{props.participant.name}</span>
        </article>
    );
};