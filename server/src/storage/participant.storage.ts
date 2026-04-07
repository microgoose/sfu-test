import {Participant} from '../model/participant.ts';

const store = new Map<string, Participant>();

export function save(participant: Participant): Participant {
    store.set(participant.id, participant);
    return participant;
}

export function remove(participantId: string): void {
    store.delete(participantId);
}

export function findById(id: string): Participant | undefined {
    return store.get(id);
}

export function findAll(): Participant[] {
    return Array.from(store.values());
}