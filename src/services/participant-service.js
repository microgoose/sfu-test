import * as participantStorage from "../storage/participant-storage.js";
import {Participant} from "../model/participant.js";
import * as wsManager from "../config/ws-manager.js";
import {getBySocketId} from "../infra/websocket/ws-user-service.js";
import {sendLeftRoom, sendTransportCreated} from "../infra/websocket/ws-room-service.js";
import {createTransport} from "../infra/mediasoup/ms-transport-service.js";

export function findById(id) {
    console.debug(`Find participant by id ${id}`);
    const participant = participantStorage.findById(id);
    if (!participant)
        throw new Error(`Participant ${id} not found`);
    return participant;
}

export function findBySocketId(socketId) {
    const userId = getBySocketId(socketId);
    return findById(userId);
}

export function connectParticipant(socket) {
    const participant = participantStorage.save(new Participant());
    wsManager.addConnection(participant.id, socket);
    console.debug("Create participant " + participant.id);
}

export function disconnectParticipant(socketId) {
    const participant = findBySocketId(socketId);
    const room = participant.room;

    if (!participant)
        throw new Error(`Participant not found`);

    participant.leave();
    participantStorage.remove(participant);
    wsManager.removeConnection(socketId);
    sendLeftRoom(room, participant.id);

    console.debug("Remove participant " + participant.id);
}

export async function setupTransport(socketId) {
    const participant = findBySocketId(socketId);
    const params = await createTransport();
    sendTransportCreated(participant.id, params);
}