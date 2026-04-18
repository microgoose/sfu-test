import {Client, IMessage, type StompSubscription} from '@stomp/stompjs';
import {createRoomMessaging} from "./api/room.js";
import {createTransportMessaging} from "./api/transport.js";
import {createProducerMessaging} from "./api/producer.js";
import {createConsumerMessaging} from "./api/consumer.js";
import {createRouterMessaging} from "./api/router.js";
import {MessageHandler, RpcMessageHandler} from "./types.js";

export type MessagingClient = ReturnType<typeof createMessaging>;
export type StompAdapter = ReturnType<typeof createStompAdapter>;

export function createClient(brokerURL: string, login: string, passcode: string) {
    return new Client({
        brokerURL,
        connectHeaders: { login, passcode },
        reconnectDelay: 3000,

        onDisconnect: (frame) => {
            console.debug('[STOMP] Disconnected:', frame);
        },

        onWebSocketError: (event) => {
            console.error('WebSocket error:', event);
        },

        onWebSocketClose: (event) => {
            console.debug('[WS] WebSocket closed. Code:', event.code, 'Reason:', event.reason);
        },
    });
}

export const createStompAdapter = (client: Client) => ({
    publish<T>(destination: string, body: T): void {
        client.publish({
            destination,
            body: JSON.stringify(body),
            headers: {'content-type': 'application/json'},
        });
    },

    subscribe<T>(destination: string, handler: MessageHandler<T>): StompSubscription {
        return client.subscribe(destination, (msg: IMessage) => {
            handler(JSON.parse(msg.body) as T);
        });
    },

    handle<Req, Res>(destination: string, handler: RpcMessageHandler<Req, Res>): StompSubscription {
        return client.subscribe(destination, async (msg: IMessage) => {
            const replyTo = msg.headers['reply-to'];
            if (!replyTo) {
                console.warn(`[Adapter] No reply-to header on ${destination}, ignoring`);
                return;
            }

            try {
                const result = await handler(
                    msg.body ? JSON.parse(msg.body) as Req : undefined as Req
                );
                client.publish({
                    destination: replyTo,
                    body: result ? JSON.stringify(result) : undefined,
                    headers: {'content-type': 'application/json'},
                });
            } catch (err) {
                console.error(`[Adapter] Error handling ${destination}:`, err);
            }
        });
    },

    request<TReq, TRes>(destination: string, payload?: TReq): Promise<TRes> {
        return new Promise((resolve, reject) => {
            const routingKey = destination.split('/').pop()!;
            const replyTo = `/exchange/amq.direct/${routingKey.replace(/\./g, '-')}-${crypto.randomUUID()}`;

            const sub = client.subscribe(replyTo, (msg: IMessage) => {
                sub.unsubscribe();
                clearTimeout(timer);
                resolve(JSON.parse(msg.body) as TRes);
            });

            client.publish({
                destination,
                body: JSON.stringify(payload),
                headers: {
                    'reply-to': replyTo,
                    'content-type': 'application/json'
                },
            });

            const timer = setTimeout(() => {
                sub.unsubscribe();
                reject(new Error(`RPC timeout: ${destination}`));
            }, 10_000);
        });
    },
});

export const createMessaging = (adapter: StompAdapter) => ({
    room: createRoomMessaging(adapter),
    transport: createTransportMessaging(adapter),
    producer: createProducerMessaging(adapter),
    consumer: createConsumerMessaging(adapter),
    router: createRouterMessaging(adapter),
});

export function connectMessagingClient(client: Client): Promise<void> {
    return new Promise((resolve, reject) => {
        if (client.active)
            resolve();

        client.onConnect = () => {
            console.debug('[Messaging Client] Connected');
            resolve();
        };

        client.onStompError = (frame) => {
            reject(new Error(frame.headers['message']));
            console.error('STOMP error: ', frame.headers['message']);
        }

        client.activate();
    });
}