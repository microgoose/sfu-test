import {Room} from '../model/room.ts';
import {Producer} from "mediasoup/types";

const rooms = new Map<string, Room>();
const producers = new Map<string, Producer>();
const roomProducers = new Map<string, Set<string>>();

export function saveRoom(room: Room): Room {
    rooms.set(room.id, room);
    return room;
}

export function findById(id: string): Room | undefined {
    return rooms.get(id);
}

export function findAll(): Room[] {
    return Array.from(rooms.values());
}

export function findByParticipantId(participantId: string): Room | undefined {
    return Array.from(rooms.values()).find(room => room.hasParticipant(participantId));
}

export function saveProducer(roomId: string, producer: Producer) {
    producers.set(producer.id, producer);

    if (roomProducers.has(roomId))
        roomProducers.get(roomId)?.add(producer.id);
    else
        roomProducers.set(roomId, new Set(producer.id));
}

export function findProducersByRoom(roomId: string) {
    const result: Producer[] = [];
    roomProducers.get(roomId)?.forEach((producerId) => {
        const producer = producers.get(producerId);
        if (producer)
            result.push(producer);
    });
    return result;
}