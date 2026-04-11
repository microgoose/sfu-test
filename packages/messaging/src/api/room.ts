import {destinations, toExchange, toTopic} from '../destinations.js';
import {StompAdapter} from '../adapter.js';
import {
    JoinRoomPayload,
    JoinRoomResponse,
    LeaveRoomPayload,
    MessageHandler,
    ParticipantJoinedEvent,
    ParticipantLeftEvent,
    RpcMessageHandler,
} from '../types.js';

export const createRoomApi = (stomp: StompAdapter) => ({
    join: (roomId: string, payload: JoinRoomPayload): Promise<JoinRoomResponse> =>
        stomp.request(toExchange(destinations.room.join(roomId)), payload),

    onJoin: (roomId: string, handler: RpcMessageHandler<JoinRoomPayload, JoinRoomResponse>) =>
        stomp.handle(toTopic(destinations.room.join(roomId)), handler),

    leave: (roomId: string, payload: LeaveRoomPayload) =>
        stomp.publish(toExchange(destinations.room.leave(roomId)), payload),

    onLeave: (roomId: string, handler: MessageHandler<LeaveRoomPayload>) =>
        stomp.subscribe(toTopic(destinations.room.leave(roomId)), handler),

    publishParticipantJoined: (roomId: string, payload: ParticipantJoinedEvent) =>
        stomp.publish(toExchange(destinations.room.participantJoined(roomId)), payload),

    onParticipantJoined: (roomId: string, handler: MessageHandler<ParticipantJoinedEvent>) =>
        stomp.subscribe(toTopic(destinations.room.participantJoined(roomId)), handler),

    publishParticipantLeft: (roomId: string, payload: ParticipantLeftEvent) =>
        stomp.publish(toExchange(destinations.room.participantLeft(roomId)), payload),

    onParticipantLeft: (roomId: string, handler: MessageHandler<ParticipantLeftEvent>) =>
        stomp.subscribe(toTopic(destinations.room.participantLeft(roomId)), handler),
});