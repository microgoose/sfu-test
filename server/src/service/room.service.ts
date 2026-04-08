import {Room} from '../model/room.ts';
import * as roomStorage from '../storage/room.storage.ts';
import * as participantStorage from '../storage/participant.storage.ts';
import * as sessionStorage from '../storage/session.storage.ts';
import {createRouter, getRtpCapabilities} from '../infra/mediasoup/router.service.ts';
import {broadcastExcept, sendTo} from '../infra/stomp/stomp-broker.ts';
import {TOPICS} from '../config/ws.topics.ts';

export async function createRoom(id: string): Promise<void> {
    const routerId = await createRouter();
    roomStorage.save(new Room(id, routerId));
    console.debug(`[RoomService] Room created id=${id}`);
}

export function findRoomById(id: string): Room {
    const room = roomStorage.findById(id);
    if (!room) throw new Error(`Room ${id} not found`);
    return room;
}

export function findAllRooms(): Room[] {
    return roomStorage.findAll();
}

export function getRoomBySession(sessionId: string) {
    const participantId = sessionStorage.getParticipantId(sessionId);
    const room = roomStorage.findByParticipantId(participantId);
    if (!room) throw new Error(`Participant ${participantId} is not in a room`);
    return room;
}

export function joinRoom(sessionId: string, roomId: string): void {
    const participantId = sessionStorage.getParticipantId(sessionId);
    const participant = participantStorage.findById(participantId);
    if (!participant) throw new Error(`Participant ${participantId} not found`);

    const room = findRoomById(roomId);
    room.addParticipant(participant);

    const rtpCapabilities = getRtpCapabilities(room.routerId);
    const otherSessionIds = room
        .getOtherParticipantIds(participantId)
        .map(id => sessionStorage.getSessionId(id));

    sendTo(sessionId, TOPICS.room.rtpCapabilities, { rtpCapabilities });
    broadcastExcept(sessionId, otherSessionIds, TOPICS.room.participantJoined, { participantId });
    console.debug(`[RoomService] Participant ${participantId} joined room ${roomId}`);
}

export function leaveRoom(sessionId: string): void {
    const participantId = sessionStorage.getParticipantId(sessionId);
    const room = roomStorage.findByParticipantId(participantId);
    if (!room) throw new Error(`Participant ${participantId} is not in any room`);

    room.removeParticipant(participantId);

    const otherSessionIds = room
        .getOtherParticipantIds(participantId)
        .map(id => sessionStorage.getSessionId(id));

    broadcastExcept(sessionId, otherSessionIds, TOPICS.room.participantLeft, { participantId });
    console.debug(`[RoomService] Participant ${participantId} left room ${room.id}`);
}
