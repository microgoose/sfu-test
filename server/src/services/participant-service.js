import * as participantStorage from "../storage/participant-storage.js";
import {Participant} from "../model/participant.js";
import * as wsManager from "../config/ws-manager.js";
import {getBySocketId} from "../infra/websocket/ws-user-service.js";
import {
    sendConsumed,
    sendLeftRoom,
    sendProduced,
    sendRecvTransportCreated,
    sendSendTransportCreated, sendTransportConnected
} from "../infra/websocket/ws-room-service.js";
import {
    connectTransport, consumeTransport,
    createTransport,
    getRouterByProducerId,
    produceTransport
} from "../infra/mediasoup/ms-transport-service.js";

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

    if (!participant)
        throw new Error(`Participant not found`);

    const room = participant.room; // ← после проверки

    participant.leave();
    participantStorage.remove(participant);
    wsManager.removeConnection(socketId);

    if (room) {                        // ← только если был в комнате
        sendLeftRoom(room, participant.id);
    }

    console.debug("Remove participant " + participant.id);
}

export async function setupTransport(socketId) {
    const participant = findBySocketId(socketId);
    if (!participant.room)
        throw new Error(`Participant ${participant.id} is not in a room`);

    const sendParams = await createTransport(participant.room.routerId);
    const recvParams = await createTransport(participant.room.routerId);
    sendSendTransportCreated(participant.id, sendParams);
    sendRecvTransportCreated(participant.id, recvParams);
}

export async function setupConnectTransport(socketId, { transportId, dtlsParameters }) {
    console.debug(`Connecting transport for socket id=${socketId}`);
    const participant = findBySocketId(socketId);
    await connectTransport(transportId, dtlsParameters);
    sendTransportConnected(participant.id, transportId);
}

export async function setupProduce(socketId, { transportId, kind, rtpParameters, appData }) {
    console.debug(`Setup producer ${transportId}`);
    const participant = findBySocketId(socketId);
    const producerId = await produceTransport(transportId, { kind, rtpParameters, appData });
    sendProduced(participant, { producerId, kind });
}

export async function setupConsume(socketId, {  transportId, producerId, rtpCapabilities }) {
    console.debug(`Setup consumer ${transportId}`);
    const participant = findBySocketId(socketId);
    const router = getRouterByProducerId(producerId);

    // Проверяем что роутер может доставить этот поток клиенту
    if (!router.canConsume({ producerId, rtpCapabilities })) {
        throw new Error(`Cannot consume ${producerId}`);
    }

    const consumerParas = await consumeTransport(transportId, producerId, rtpCapabilities);
    console.debug(`Consumer params ${JSON.stringify(consumerParas)}`);
    sendConsumed(participant.id, consumerParas);
}