import {createStore} from "solid-js/store";
import {Participant} from "@/domain/types";

interface ParticipantsStore {
    participants: Participant[];
}

const [store, setState] = createStore<ParticipantsStore>({
    participants: [],
});

export const participantStore = store;

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

export function getParticipantMedia(participantId: string) {
    return store.participants.find((participant) => participantId === participantId)?.media;
}

export function setParticipantMedia(participantId: string, media: MediaStream) {
    setState(
        'participants',
        (p) => p.id === participantId,
        'media',
        media
    );
}

export function resetParticipantMedia(participantId: string) {
    setState(
        'participants',
        (p) => p.id === participantId,
        'media',
        undefined
    );
}