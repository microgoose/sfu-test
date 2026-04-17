import * as mediasoup from 'mediasoup';
import type {WebRtcServer, Worker} from "mediasoup/types";

let worker: Worker | null = null;
let webRtcServer: WebRtcServer | null = null;

export async function createWorker(announcedAddress: string): Promise<void> {
    console.debug('[Worker] Creating media-messaging worker');

    worker = await mediasoup.createWorker();
    webRtcServer = await worker.createWebRtcServer({
        listenInfos: [
            { protocol: 'udp', ip: '0.0.0.0', announcedAddress, port: 20000 },
            { protocol: 'tcp', ip: '0.0.0.0', announcedAddress, port: 20000 },
        ],
    });

    console.debug(`[Worker] Created pid=${worker.pid}`);
}

export function getWorker() {
    if (worker == null) throw new Error('Worker not initialized');
    return worker;
}

export function getWebRtcServer() {
    if (webRtcServer == null) throw new Error('WebRtcServer not initialized');
    return webRtcServer;
}