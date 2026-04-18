import {MediaKind} from "mediasoup-client/types";

export interface User {
    id: string;
    name: string;
}

export interface Participant extends User {
    videoTrack?: MediaStreamTrack;
    audioTrack?: MediaStreamTrack;
}

export interface ParticipantMediaTrack {
    participantId: string;
    producerId: string;
    kind: MediaKind;
    track: MediaStreamTrack;
}