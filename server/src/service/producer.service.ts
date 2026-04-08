import {MediaKind, RtpParameters} from "mediasoup/types";
import * as sessionStorage from "../storage/session.storage.ts";
import * as transportService from "../infra/mediasoup/transport.adapter.ts";
import {broadcastExcept, sendTo} from "../infra/stomp/stomp-broker.ts";
import {TOPICS} from "../config/ws.topics.ts";
import {getRoomBySession} from "./room.service.ts";
import {findProducersByRoom, saveProducer} from "../storage/room.storage.ts";

export async function createProducer(
    sessionId: string,
    transportId: string,
    kind: MediaKind,
    rtpParameters: RtpParameters
) {
    const participantId = sessionStorage.getParticipantId(sessionId);
    const room = getRoomBySession(sessionId);
    const producer = await transportService.createProducer(transportId, kind, rtpParameters);

    saveProducer(room.id, producer);
    sendTo(sessionId, TOPICS.producer.created, { producerId: producer.id });

    const otherSessionIds = room
        .getOtherParticipantIds(participantId)
        .map(id => sessionStorage.getSessionId(id));

    broadcastExcept(sessionId, otherSessionIds, TOPICS.producer.new, { producerId: producer.id, kind });
}

export function getBySession(sessionId: string, roomId: string,) {
    const producers = findProducersByRoom(roomId)
        .map(producer => ({ producerId: producer.id, kind: producer.kind }));

    sendTo(sessionId, TOPICS.producer.roomList, producers);
}