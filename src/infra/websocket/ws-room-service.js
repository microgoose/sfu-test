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

export function sendTransportCreated(participantId, params) {
    wsManager.sendTo(participantId, {
        type: MESSAGE_TYPES.RTP_CAPABILITIES_EVENT,
        params
    });
}

function getOtherParticipantIds(room, exceptParticipantId) {
    return Array.from(room.participants.values())
        .filter(p => p.id !== exceptParticipantId)
        .map(p => p.id);
}