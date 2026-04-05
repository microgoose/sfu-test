import { Room } from '../model/room.ts';

const store = new Map<string, Room>();

export function save(room: Room): Room {
    store.set(room.id, room);
    return room;
}

export function findById(id: string): Room | undefined {
    return store.get(id);
}

export function findAll(): Room[] {
    return Array.from(store.values());
}

export function findByParticipantId(participantId: string): Room | undefined {
    return Array.from(store.values()).find(room => room.hasParticipant(participantId));
}