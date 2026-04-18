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

export function joinRoom(participantId: string, roomId: string) {
    const participant = storage.findParticipantById(participantId);
    if (!participant) throw new Error(`Participant ${participantId} not found`);

    storage.joinRoom(roomId, participantId);
    publishParticipantJoined(roomId, {participant});
}

export function leaveRoom(participantId: string, roomId: string) {
    const transports = storage.findTransportsByRoomId(roomId);
    transports.forEach(t => closeTransport(roomId, t.id));
    storage.leaveRoom(roomId, participantId);
    publishParticipantLeft(roomId, {participantId});
}