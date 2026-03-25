import {randomUUID} from "node:crypto";

export class Room {
    constructor() {
        this.id = randomUUID();
        this.participants = new Map();
    }

    addParticipant(participant) {
        if (this.participants.has(participant.id))
            throw new Error(`Participant ${participant.id} already in room ${this.id}`);

        this.participants.set(participant.id, participant);
        participant.joinRoom(this);
    }

    removeParticipant(participantId) {
        const participant = this.participants.get(participantId);

        if (participant === null)
            throw new Error(`Participant ${participantId} not found in room ${this.id}`);

        this.participants.delete(participantId);
        participant.leaveRoom(this);
    }

    hasParticipant(participantId) {
        return this.participants.has(participantId);
    }
}