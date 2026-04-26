import {createStore} from "solid-js/store";
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

export const [participants, setParticipants] = createStore<Participant[]>([]);

export class ParticipantRepository {
    addParticipant(participant: Participant) {
        setParticipants(ps => [...ps, participant]);
    }

    removeParticipant(participantId: string) {
        setParticipants(ps => ps.filter(p => p.id !== participantId));
    }

    setTrack(participantId: string, track: MediaStreamTrack) {
        setParticipants(
            p => p.id === participantId,
            track.kind === 'audio' ? 'audioTrack' : 'videoTrack', track
        );
    }

    resetTrack(participantId: string, kind: MediaKind) {
        setParticipants(
            p => p.id === participantId,
            kind === 'audio' ? 'audioTrack' : 'videoTrack', undefined
        );
    }

    clearParticipants() {
        setParticipants([]);
    }
}