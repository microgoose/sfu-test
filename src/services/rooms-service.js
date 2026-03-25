import * as roomStorage from "../storage/room-storage.js";
import * as participantService from './participant-service.js';
import {Room} from "../model/room.js";
import {MESSAGE_TYPES} from "../config/ws-routes.js";
import * as wsManager from "../config/ws-manager.js";

export function findById(id) {
    console.debug(`Find room by id ${id}`);
    const room = roomStorage.findById(id);
    if (!room)
        throw new Error(`Room ${id} not found`);
    return room;
}

export function findAll() {
    console.debug("Find all rooms");
    return roomStorage.findAll();
}

export function createRoom(id) {
    let room = new Room();
    if (id)
        room.id = id;
    room = roomStorage.save(room);
    console.debug(`Room created ${room.id}`);
}

export function broadcastToRoom(room, payload) {
    for (let participant of Array.from(room.participants.values())) {
        wsManager.sendTo(participant.id, payload);
    }
}

export function addParticipantToRoom(socket, roomId) {
    const participantId = wsManager.findConnection(socket.id);
    const room = findById(roomId);
    const participant = participantService.findById(participantId);

    room.addParticipant(participant);
    roomStorage.save(room);
    broadcastToRoom(room, {
        type: MESSAGE_TYPES.PARTICIPANT_JOINED,
        participantId,
    });

    console.debug(`Added participant ${participantId} to ${roomId}`);
}

export function removeParticipantFromRoom(socket) {
    const participantId = wsManager.findConnection(socket.id);
    const room = roomStorage.findByParticipantId(participantId);
    if (!room)
        throw new Error(`Participant ${participantId} not found in any room`);

    room.removeParticipant(participantId);
    roomStorage.save(room);
    broadcastToRoom(room, {
        type: MESSAGE_TYPES.PARTICIPANT_LEFT,
        participantId,
    });

    console.debug(`Participant ${participantId} removed from room ${room.id}`);
}