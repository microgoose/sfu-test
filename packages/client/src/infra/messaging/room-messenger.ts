import {
    JoinRoomPayload,
    LeaveRoomPayload,
    MessageHandler,
    MessagingApi,
    ParticipantJoinedEvent,
    ParticipantLeftEvent
} from "@sfu-test/messaging";

export class RoomMessenger {
    private readonly roomId;
    private readonly client;

    constructor(client: MessagingApi, roomId: string) {
        this.roomId = roomId;
        this.client = client;
    }

    join(payload: JoinRoomPayload) {
        console.debug(`Send join room ${this.roomId}`);
        this.client.room.join(this.roomId, payload);
    }

    leave(payload: LeaveRoomPayload) {
        console.debug(`Send leave room ${this.roomId}`);
        this.client.room.leave(this.roomId, payload);
    }

    onParticipantJoined(handler: MessageHandler<ParticipantJoinedEvent>) {
        this.client.room.onParticipantJoined(this.roomId, handler);
    }

    onParticipantLeft(handler: MessageHandler<ParticipantLeftEvent>) {
        this.client.room.onParticipantLeft(this.roomId, handler);
    }
}