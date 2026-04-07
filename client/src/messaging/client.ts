import {Client} from '@stomp/stompjs';

let instance: Client | null = null;

export function getStompClient(): Client {
    if (instance) return instance;

    instance = new Client({
        // TODO
        brokerURL: 'ws://localhost:8080/ws',
        reconnectDelay: 5000,
        onStompError: (frame) => {
            console.error('[STOMP] Error:', frame.headers.message);
        },
    });

    return instance;
}

export function publish(destination: string, payload: object) {
    getStompClient().publish({
        destination: destination,
        body: JSON.stringify(payload),
    });
}

export function subscribe<T>(topic: string, callback: (msg: T) => void) {
    return getStompClient().subscribe(topic, (frame) => {
        const msg: T = JSON.parse(frame.body);
        callback(msg);
    });
}

export function pendingSubscription<T>(topic: string, timeoutMs = 5000) {
    return new Promise<T>((res, rej) => {
        const timer = setTimeout(() => {
            sub.unsubscribe();
            const err = new Error(`[STOMP] pending timeout: ${topic}`);
            console.error(err.message);
            rej(err);
        }, timeoutMs);

        const sub = getStompClient().subscribe(topic, (frame) => {
            try {
                const msg: T = JSON.parse(frame.body);
                clearTimeout(timer);
                sub.unsubscribe();
                res(msg);
            } catch (e) {
                clearTimeout(timer);
                sub.unsubscribe();
                rej(e);
            }
        });
    });
}