import {OnCommandCallback, StompSession} from "./stomp-session.ts";

type CommandHandler<T> = (session: StompSession, body: T) => void | Promise<void>;

const sessions = new Map<string, StompSession>();
const handlers = new Map<string, CommandHandler<any>>();

export function registerSession(session: StompSession): void {
    sessions.set(session.id, session);
    console.debug(`[Broker] Session registered: ${session.id}`);
}

export function removeSession(sessionId: string): void {
    sessions.delete(sessionId);
    console.debug(`[Broker] Session removed: ${sessionId}`);
}

export function getSession(sessionId: string): StompSession {
    const session = sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    return session;
}

export function registerHandler<T>(destination: string, handler: CommandHandler<T>): void {
    handlers.set(destination, handler);
}

export const onCommand: OnCommandCallback = (session, destination, body) => {
    const handler = handlers.get(destination);

    if (!handler) {
        console.error(`[Broker] No handler for: ${destination}`);
        return;
    }

    Promise.resolve(handler(session, body)).catch(console.error);
};

// Отправить сообщение конкретной сессии
export function sendTo(sessionId: string, destination: string, body: object): void {
    const session = sessions.get(sessionId);
    if (!session) {
        console.error(`[Broker] sendTo: session ${sessionId} not found`);
        return;
    }
    console.debug(`[Broker] Send to ${destination}`);
    session.send(destination, body);
}

// Отправить всем кроме одного
export function broadcastExcept(
    excludeSessionId: string,
    sessionIds: string[],
    destination: string,
    body: object,
): void {
    sessionIds
        .filter(id => id !== excludeSessionId)
        .forEach(id => sendTo(id, destination, body));
}