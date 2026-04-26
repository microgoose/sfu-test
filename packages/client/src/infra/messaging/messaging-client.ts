import {MessagingExchanger, MessagingRouter, MessagingSocket} from "@sfu-test/messaging";
import {getMessage} from "@/service/error.service";

export function createMessagingSocket(): Promise<MessagingSocket> {
    return new Promise((resolve, reject) => {
        let ws;

        try {
            ws = new WebSocket('ws://localhost:15674?userId=' + crypto.randomUUID());
        } catch (err) {
            reject(new Error(`Failed to create WebSocket: ${getMessage(err)}`));
            return;
        }

        ws.onerror = (event) => {
            const message = event instanceof ErrorEvent
                ? event.message
                : 'Unknown WebSocket error';

            reject(new Error(`WebSocket error: ${message}`));
        };

        ws.onclose = (event) => {
            if (!event.wasClean) {
                reject(new Error(`WebSocket closed unexpectedly: code=${event.code}, reason=${event.reason}`));
            }
        };

        ws.onopen = () => {
            ws.onclose = null;

            try {
                const router = new MessagingRouter();
                const exchanger = new MessagingExchanger({
                    router,
                    onErrorMessage: console.error,
                    onSend: (data) => ws.send(data),
                });

                ws.onmessage = (event) => {
                    exchanger.handleIncomingMessage(event.data.toString());
                };

                resolve(new MessagingSocket(exchanger));
            } catch (err) {
                ws.close();
                reject(new Error(`Failed to initialize messaging: ${getMessage(err)}`));
            }
        };
    });
}