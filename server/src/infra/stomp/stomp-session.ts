import {createStompServerSession, StompServerSessionLayer} from 'stomp-protocol';
import {WebSocket} from 'ws';

export interface StompSession {
    id: string;
    send(destination: string, body: object): void;
    close(): void;
}

export type OnCommandCallback = (
    session: StompSession,
    destination: string,
    body: unknown,
) => void;

export interface StompSessionCallbacks {
    onConnect:    (session: StompSession) => void;
    onDisconnect: (sessionId: string) => void;
    onCommand:    OnCommandCallback;
}

export function createSession(
    socket: WebSocket,
    sessionId: string,
    callbacks: StompSessionCallbacks,
): StompSession {
    let server: StompServerSessionLayer;
    const subscriptions = new Map<string, string>();

    const session: StompSession = {
        id: sessionId,

        send(destination: string, body: object): void {
            const subscriptionId = subscriptions.get(destination) ?? 'sub-0';

            server.message(
                {
                    destination,
                    'message-id': crypto.randomUUID(),
                    subscription: subscriptionId,
                },
                JSON.stringify({
                    type: destination,
                    payload: body
                }),
            ).catch(console.error);
        },

        close(): void {
            socket.close();
        },
    };

    server = createStompServerSession(socket as any, {
        connect(_headers) {
            server.connected({ version: '1.2', server: 'SFU/1.0' })
                .then(() => callbacks.onConnect(session))
                .catch(console.error);
        },

        send(headers, body) {
            const destination = headers?.destination;
            if (!destination || !body) return;

            try {
                const parsed = JSON.parse(body);
                callbacks.onCommand(session, destination, parsed);
            } catch (e) {
                console.error(`[STOMP Session] Parse error on ${destination}:`, e);
            }
        },

        subscribe(headers) {
            const destination = headers?.destination;
            const id = headers?.id;
            if (destination && id) {
                subscriptions.set(destination, id);
                console.debug(`[STOMP Session]: Subscribe ${destination} id=${id}`);
            }
        },

        unsubscribe(headers) {
            const id = headers?.id;
            if (id) {
                for (const [dest, subId] of subscriptions.entries()) {
                    if (subId === id) {
                        subscriptions.delete(dest);
                        break;
                    }
                }
            }
        },

        disconnect() {
            callbacks.onDisconnect(sessionId);
        },

        onProtocolError(err) {
            console.error(`[STOMP Session] Error:`, err);
        },

        // Обязательные заглушки
        begin() {
        },
        commit() {
        },
        abort() {
        },
        ack() {
        },
        nack() {
        },
        onEnd() {
        }
    });

    return session;
}