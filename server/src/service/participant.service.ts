import {Participant} from '../model/participant.ts';
import * as participantStorage from '../storage/participant.storage.ts';
import * as roomStorage from '../storage/room.storage.ts';
import * as sessionStorage from '../storage/session.storage.ts';
import * as transportService from '../infra/mediasoup/transport.service.ts';
import {broadcastExcept, sendTo} from '../infra/stomp/stomp-broker.ts';
import {TOPICS} from '../config/ws.topics.ts';
import {DtlsParameters, MediaKind, RtpCapabilities, RtpParameters} from 'mediasoup/types';

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

export async function createTransport(sessionId: string): Promise<void> {
    const room = getRoomBySession(sessionId);
    const parameters = await transportService.createTransport(room.routerId);
    sendTo(sessionId, TOPICS.transport.created, { parameters });
}

export async function connectTransport(sessionId: string, transportId: string, dtlsParameters: DtlsParameters): Promise<void> {
    await transportService.connectTransport(transportId, dtlsParameters);
    sendTo(sessionId, TOPICS.transport.connected, { transportId });
}

// ─── Producer ─────────────────────────────────────────────────

export async function createProducer(
    sessionId: string,
    transportId: string,
    kind: MediaKind,
    rtpParameters: RtpParameters,
    appData: Record<string, unknown>,
): Promise<void> {
    const participantId = sessionStorage.getParticipantId(sessionId);
    const room = getRoomBySession(sessionId);
    const producerId = await transportService.createProducer(transportId, kind, rtpParameters, appData);

    sendTo(sessionId, TOPICS.producer.created, { producerId });

    const otherSessionIds = room
        .getOtherParticipantIds(participantId)
        .map(id => sessionStorage.getSessionId(id));

    broadcastExcept(sessionId, otherSessionIds, TOPICS.producer.new, { producerId, kind });
}

// ─── Consumer ─────────────────────────────────────────────────

export async function createConsumer(
    sessionId: string,
    transportId: string,
    producerId: string,
    rtpCapabilities: RtpCapabilities,
): Promise<void> {
    if (!transportService.canConsume(producerId, rtpCapabilities))
        throw new Error(`Cannot consume producer ${producerId}`);

    const params = await transportService.createConsumer(transportId, producerId, rtpCapabilities);
    sendTo(sessionId, TOPICS.consumer.created, params);
}

export async function resumeConsumer(consumerId: string): Promise<void> {
    await transportService.resumeConsumer(consumerId);
}

// ─── Helpers ──────────────────────────────────────────────────

function getRoomBySession(sessionId: string) {
    const participantId = sessionStorage.getParticipantId(sessionId);
    const room = roomStorage.findByParticipantId(participantId);
    if (!room) throw new Error(`Participant ${participantId} is not in a room`);
    return room;
}
