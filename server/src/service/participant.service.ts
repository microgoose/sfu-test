import { Participant } from '../model/participant.ts';
import * as participantStorage from '../storage/participant.storage.ts';
import * as roomStorage from '../storage/room.storage.ts';
import * as sessionStorage from '../storage/session.storage.ts';
import {
    createTransport,
    connectTransport,
    createProducer,
    createConsumer,
    canConsume,
    resumeConsumer,
} from '../infra/mediasoup/transport.service.ts';
import { sendTo, broadcastExcept } from '../infra/stomp/stomp-broker.ts';
import { TOPICS } from '../config/ws.topics.ts';
import { DtlsParameters, MediaKind, RtpCapabilities, RtpParameters, SctpCapabilities } from 'mediasoup/types';

// ─── Lifecycle ────────────────────────────────────────────────

export function connectParticipant(sessionId: string): void {
    const participant = new Participant();
    participantStorage.save(participant);
    sessionStorage.link(sessionId, participant.id);
    console.debug(`[ParticipantService] Connected ${participant.id}`);
}

export function disconnectParticipant(sessionId: string): void {
    const participantId = sessionStorage.getParticipantId(sessionId);
    const room = roomStorage.findByParticipantId(participantId);

    if (room) {
        room.removeParticipant(participantId);
        const otherSessionIds = room
            .getOtherParticipantIds(participantId)
            .map(id => sessionStorage.getSessionId(id));

        broadcastExcept(sessionId, otherSessionIds, TOPICS.room.participantLeft, { participantId });
    }

    participantStorage.remove(participantId);
    sessionStorage.unlink(sessionId);
    console.debug(`[ParticipantService] Disconnected ${participantId}`);
}

// ─── Transport ────────────────────────────────────────────────

export async function setupTransport(sessionId: string, direction: string, sctpCapabilities: SctpCapabilities): Promise<void> {
    const room = getRoomBySession(sessionId);
    const parameters = await createTransport(room.routerId);

    if (direction === 'send')
        sendTo(sessionId, TOPICS.transport.sendCreated, { parameters });
    else if (direction === 'recv')
        sendTo(sessionId, TOPICS.transport.recvCreated, { parameters });
    else
        throw new Error(`Unknown direction: ${direction}`);
}

export async function setupConnectTransport(sessionId: string, transportId: string, dtlsParameters: DtlsParameters): Promise<void> {
    await connectTransport(transportId, dtlsParameters);
    sendTo(sessionId, TOPICS.transport.connected, { transportId });
}

// ─── Producer ─────────────────────────────────────────────────

export async function setupProduce(
    sessionId: string,
    transportId: string,
    kind: MediaKind,
    rtpParameters: RtpParameters,
    appData: Record<string, unknown>,
): Promise<void> {
    const participantId = sessionStorage.getParticipantId(sessionId);
    const room = getRoomBySession(sessionId);
    const producerId = await createProducer(transportId, kind, rtpParameters, appData);

    sendTo(sessionId, TOPICS.producer.produced, { producerId });

    const otherSessionIds = room
        .getOtherParticipantIds(participantId)
        .map(id => sessionStorage.getSessionId(id));

    broadcastExcept(sessionId, otherSessionIds, TOPICS.producer.newProducer, { producerId, kind });
}

// ─── Consumer ─────────────────────────────────────────────────

export async function setupConsume(
    sessionId: string,
    transportId: string,
    producerId: string,
    rtpCapabilities: RtpCapabilities,
): Promise<void> {
    if (!canConsume(producerId, rtpCapabilities))
        throw new Error(`Cannot consume producer ${producerId}`);

    const params = await createConsumer(transportId, producerId, rtpCapabilities);
    sendTo(sessionId, TOPICS.consumer.consumed, params);
}

export async function setupResumeConsumer(consumerId: string): Promise<void> {
    await resumeConsumer(consumerId);
}

// ─── Helpers ──────────────────────────────────────────────────

function getRoomBySession(sessionId: string) {
    const participantId = sessionStorage.getParticipantId(sessionId);
    const room = roomStorage.findByParticipantId(participantId);
    if (!room) throw new Error(`Participant ${participantId} is not in a room`);
    return room;
}
