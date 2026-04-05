import { randomUUID } from 'node:crypto';
import { Participant } from './participant.ts';

export class Room {
    readonly id: string;
    readonly routerId: string;
    readonly participants = new Map<string, Participant>();

    constructor(id: string, routerId: string) {
        this.id = id ?? randomUUID();
        this.routerId = routerId;
    }

    addParticipant(participant: Participant): void {
        if (this.participants.has(participant.id))
            throw new Error(`Participant ${participant.id} already in room ${this.id}`);
        this.participants.set(participant.id, participant);
    }

    removeParticipant(participantId: string): void {
        if (!this.participants.delete(participantId))
            throw new Error(`Participant ${participantId} not found in room ${this.id}`);
    }

    hasParticipant(participantId: string): boolean {
        return this.participants.has(participantId);
    }

    getOtherParticipantIds(excludeId: string): string[] {
        return Array.from(this.participants.keys()).filter(id => id !== excludeId);
    }
}
