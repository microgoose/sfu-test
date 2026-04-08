import {Participant} from '../model/participant.ts';
import * as participantStorage from '../storage/participant.storage.ts';
import * as roomStorage from '../storage/room.storage.ts';
import * as sessionStorage from '../storage/session.storage.ts';
import {broadcastExcept} from '../infra/stomp/stomp-broker.ts';
import {TOPICS} from '../config/ws.topics.ts';

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
