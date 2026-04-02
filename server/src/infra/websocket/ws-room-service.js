import * as wsManager from "../../config/ws-manager.js";
import {MESSAGE_TYPES} from "../../config/ws-routes.js";

export function sendJoinRoom(room, {participantId, rtpCapabilities}) {
    const participantIds = getOtherParticipantIds(room, participantId);
    wsManager.broadcastToConnections(participantIds, {
        type: MESSAGE_TYPES.PARTICIPANT_JOINED,
        participantId,
    });

    wsManager.sendTo(participantId, {
        type: MESSAGE_TYPES.RTP_CAPABILITIES_EVENT,
        participantId,
        rtpCapabilities
    });
}

export function sendLeftRoom(room, participantId) {
    const participantIds = getOtherParticipantIds(room, participantId);
    wsManager.broadcastToConnections(participantIds, {
        type: MESSAGE_TYPES.PARTICIPANT_LEFT,
        participantId,
    });
}

export function sendSendTransportCreated(participantId, parameters) {
    wsManager.sendTo(participantId, {
        type: MESSAGE_TYPES.SEND_TRANSPORT_CREATED,
        parameters
    });
}

export function sendRecvTransportCreated(participantId, parameters) {
    wsManager.sendTo(participantId, {
        type: MESSAGE_TYPES.RECV_TRANSPORT_CREATED,
        parameters
    });
}

export function sendTransportConnected(participantId, transportId) {
    wsManager.sendTo(participantId, {
        type: MESSAGE_TYPES.TRANSPORT_CONNECTED,
        transportId
    });
}

export function sendProduced(participant, { producerId, kind }) {
    const participantIds = getOtherParticipantIds(participant.room, participant.id);
    wsManager.broadcastToConnections(participantIds, {
        type: MESSAGE_TYPES.NEW_PRODUCER,
        producerId,
        kind
    });

    wsManager.sendTo(participant.id, {
        type: MESSAGE_TYPES.PRODUCED,
        producerId,
    });
}

export function sendConsumed(participantId, parameters) {
    wsManager.sendTo(participantId, {
        type: MESSAGE_TYPES.CONSUMED,
        ...parameters,
    });
}

function getOtherParticipantIds(room, exceptParticipantId) {
    return Array.from(room.participants.values())
        .filter(p => p.id !== exceptParticipantId)
        .map(p => p.id);
}