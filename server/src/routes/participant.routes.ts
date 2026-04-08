import {registerHandler} from '../infra/stomp/stomp-broker.ts';
import {COMMANDS} from '../config/ws.commands.ts';
import * as roomService from '../service/room.service.ts';

interface JoinRoomBody {
    roomId: string;
}

export function registerParticipantRoutes(): void {
    registerHandler<JoinRoomBody>(COMMANDS.room.join, (session, body) => {
        console.debug(`[STOMP Command, session ${session.id}] Join room ${body.roomId} `);
        roomService.joinRoom(session.id, body.roomId);
    });

    registerHandler(COMMANDS.room.leave, (session) => {
        console.debug(`[STOMP Command, session ${session.id}] Leave his room`);
        roomService.leaveRoom(session.id);
    });
}