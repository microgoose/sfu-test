import {createStore} from "solid-js/store";
import {Participant} from "@/domain/model";
import {MediaKind} from "mediasoup-client/types";

interface ParticipantsStore {
    participants: Participant[];
}

const [store, setState] = createStore<ParticipantsStore>({
    participants: [],
});

export const participantStore = store;

export function clearParticipants() {
    setState('participants', []);
}

export function addParticipant(participant: Participant) {
    setState('participants', participants => ([
        ...participants,
        participant
    ]));
}

export function removeParticipant(participantId: string) {
    setState('participants', participants =>
        participants.filter((p) => p.id !== participantId)
    );
}

export function setTrack(participantId: string, track: MediaStreamTrack) {
    switch (track.kind) {
        case "audio":
            setState('participants', (p) => p.id === participantId, 'audioTrack', track);
            break;
        case "video":
            setState('participants', (p) => p.id === participantId, 'videoTrack', track);
            break;
        default:
            throw new Error('Unknown media kind');
    }
}

export function resetTrack(participantId: string, kind: MediaKind) {
    switch (kind) {
        case "audio":
            setState('participants', (p) => p.id === participantId, 'audioTrack', undefined);
            break;
        case "video":
            setState('participants', (p) => p.id === participantId, 'videoTrack', undefined);
            break;
        default:
            throw new Error('Unknown media kind');
    }
}