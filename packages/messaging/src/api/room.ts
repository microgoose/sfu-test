import {destinations, toExchange, toTopic} from '../destinations.js';
import {StompAdapter} from '../client.js';
import {
    JoinRoomPayload,
    LeaveRoomPayload,
    MessageHandler,
    ParticipantJoinedEvent,
    ParticipantLeftEvent,
} from '../types.js';

export const createRoomMessaging = (adapter: StompAdapter) => ({
    join: (roomId: string, payload: JoinRoomPayload) =>
        adapter.publish(toExchange(destinations.room.join(roomId)), payload),

    onJoin: (roomId: string, handler: MessageHandler<JoinRoomPayload>) =>
        adapter.subscribe(toTopic(destinations.room.join(roomId)), handler),

    leave: (roomId: string, payload: LeaveRoomPayload) =>
        adapter.publish(toExchange(destinations.room.leave(roomId)), payload),

    onLeave: (roomId: string, handler: MessageHandler<LeaveRoomPayload>) =>
        adapter.subscribe(toTopic(destinations.room.leave(roomId)), handler),

    publishParticipantJoined: (roomId: string, payload: ParticipantJoinedEvent) =>
        adapter.publish(toExchange(destinations.room.participantJoined(roomId)), payload),

    onParticipantJoined: (roomId: string, handler: MessageHandler<ParticipantJoinedEvent>) =>
        adapter.subscribe(toTopic(destinations.room.participantJoined(roomId)), handler),

    publishParticipantLeft: (roomId: string, payload: ParticipantLeftEvent) =>
        adapter.publish(toExchange(destinations.room.participantLeft(roomId)), payload),

    onParticipantLeft: (roomId: string, handler: MessageHandler<ParticipantLeftEvent>) =>
        adapter.subscribe(toTopic(destinations.room.participantLeft(roomId)), handler),
});