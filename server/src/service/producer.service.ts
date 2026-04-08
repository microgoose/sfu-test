import {MediaKind, RtpParameters} from "mediasoup/types";
import * as sessionStorage from "../storage/session.storage.ts";
import * as transportService from "../infra/mediasoup/transport.service.ts";
import {broadcastExcept, sendTo} from "../infra/stomp/stomp-broker.ts";
import {TOPICS} from "../config/ws.topics.ts";
import {getRoomBySession} from "./room.service.ts";

export async function createProducer(
    sessionId: string,
    transportId: string,
    kind: MediaKind,
    rtpParameters: RtpParameters
): Promise<void> {
    const participantId = sessionStorage.getParticipantId(sessionId);
    const room = getRoomBySession(sessionId);
    const producerId = await transportService.createProducer(transportId, kind, rtpParameters);

    sendTo(sessionId, TOPICS.producer.created, { producerId });

    const otherSessionIds = room
        .getOtherParticipantIds(participantId)
        .map(id => sessionStorage.getSessionId(id));

    broadcastExcept(sessionId, otherSessionIds, TOPICS.producer.new, { producerId, kind });
}