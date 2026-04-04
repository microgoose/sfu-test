import {JoinRoomPayload} from '../types/room.types';
import {COMMANDS} from "../commands";
import {publish} from "../client";

export function join(payload: JoinRoomPayload): void {
    publish(COMMANDS.room.join, payload);
}

export function leave(payload: JoinRoomPayload): void {
    publish(COMMANDS.room.leave, payload);
}