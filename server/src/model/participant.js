import {randomUUID} from "node:crypto";

export class Participant {
    constructor() {
        this.id = randomUUID();
        this.room = null;
    }

    joinRoom(room) {
        this.room = room;
    }

    leaveRoom() {
        this.room = null;
    }

    leave() {
        if (this.room)
            this.room.removeParticipant(this.id);
    }
}