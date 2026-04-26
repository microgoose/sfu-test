import * as storage from '@/storage/storage.js';
import * as routerAdapter from '@/infra/mediasoup/adapter/router.adapter.js';
import {publishParticipantJoined, publishParticipantLeft} from "@/service/messaging.service.js";
import {closeTransport} from "@/service/signaling.service.js";

export function getRoomById(id: string) {
    const room = storage.findRoomById(id);
    if (!room) throw new Error(`Room ${id} not found`);
    return room;
}

export async function createRoom(roomId: string, createdBy: string) {
    console.log(`[RoomService] Create room id=${roomId}`);
    const router = await routerAdapter.createRouter();
    storage.saveRouter(router, roomId);
    storage.saveRoom({id: roomId, createdBy, routerId: router.id});
    return {roomId};
}

export async function joinRoom(participantId: string, roomId: string) {
    const participant = storage.findParticipantById(participantId);
    if (!participant) throw new Error(`Participant ${participantId} not found`);

    const room = storage.findRoomById(roomId);
    if (!room)
        await createRoom(roomId, participantId);

    storage.joinRoom(roomId, participantId);
    publishParticipantJoined(roomId, {participant});
    const participants = storage.findParticipantsByRoomId(roomId);

    return {
        roomId: roomId,
        participants: participants,
    };
}

export function leaveRoom(participantId: string, roomId: string) {
    const transports = storage.findTransportsByParticipantId(participantId);
    transports.forEach(t => closeTransport(roomId, t.id));
    storage.leaveRoom(roomId, participantId);
    publishParticipantLeft(roomId, {participantId});
}

export function leaveAllRooms(participantId: string) {
    storage
        .findRoomsByParticipantId(participantId)
        .forEach((room) => leaveRoom(participantId, room.id));
}