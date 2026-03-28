import * as roomStorage from "../storage/room-storage.js";
import * as participantService from './participant-service.js';
import {Room} from "../model/room.js";
import * as wsManager from "../config/ws-manager.js";
import {sendJoinRoom, sendLeftRoom} from "../infra/websocket/ws-room-service.js";
import {createRouter, getRtpCapabilities} from "../infra/mediasoup/ms-router-service.js";

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

export async function createRoom(id) {
    const routerId = await createRouter();
    const room = new Room(id, routerId);

    roomStorage.save(room);
    console.debug(`Room created ${room.id}`);
}

export function addParticipantToRoom(socket, roomId) {
    const participantId = wsManager.findConnection(socket.id);
    const room = findById(roomId);
    const participant = participantService.findById(participantId);
    const rtpCapabilities = getRtpCapabilities(room.routerId);

    room.addParticipant(participant);
    roomStorage.save(room);
    sendJoinRoom(room, {
        participantId,
        rtpCapabilities,
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
    sendLeftRoom(room, participantId);

    console.debug(`Participant ${participantId} removed from room ${room.id}`);
}