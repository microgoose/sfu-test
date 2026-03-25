import * as participantStorage from "../storage/participant-storage.js";
import {Participant} from "../model/participant.js";
import * as wsManager from "../config/ws-manager.js";
import {broadcastToRoom} from "./rooms-service.js";
import {MESSAGE_TYPES} from "../config/ws-routes.js";

export function findById(id) {
    console.debug(`Find participant by id ${id}`);
    const participant = participantStorage.findById(id);
    if (!participant)
        throw new Error(`Participant ${id} not found`);
    return participant;
}

export function findByRoomId(roomId) {
    console.debug(`Find participant by id ${id}`);
    const participant = participantStorage.findById(id);
    if (!participant)
        throw new Error(`Participant ${id} not found`);
    return participant;
}

export function connectParticipant(socket) {
    const participant = participantStorage.save(new Participant());
    wsManager.addConnection(participant.id, socket);
    console.debug("Create participant " + participant.id);
}

export function disconnectParticipant(socket) {
    const userId = wsManager.findConnection(socket.id);
    const participant = participantStorage.findById(userId);
    const room = participant.room;

    if (!participant)
        throw new Error(`Participant not found`);

    participant.disconnect();
    participantStorage.remove(participant);
    wsManager.removeConnection(socket);
    broadcastToRoom(room, {
        type: MESSAGE_TYPES.PARTICIPANT_LEFT,
        participantId: participant.id,
    });

    console.debug("Remove participant " + participant.id);
}