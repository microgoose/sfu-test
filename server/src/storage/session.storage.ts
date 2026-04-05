const sessionToParticipant = new Map<string, string>();
const participantToSession = new Map<string, string>();

export function link(sessionId: string, participantId: string): void {
    sessionToParticipant.set(sessionId, participantId);
    participantToSession.set(participantId, sessionId);
}

export function unlink(sessionId: string): void {
    const participantId = sessionToParticipant.get(sessionId);
    if (participantId) participantToSession.delete(participantId);
    sessionToParticipant.delete(sessionId);
}

export function getParticipantId(sessionId: string): string {
    const id = sessionToParticipant.get(sessionId);
    if (!id) throw new Error(`No participant linked to session ${sessionId}`);
    return id;
}

export function getSessionId(participantId: string): string {
    const id = participantToSession.get(participantId);
    if (!id) throw new Error(`No session linked to participant ${participantId}`);
    return id;
}