import * as mediasoup from 'mediasoup';
import {WebRtcServer, Worker} from "mediasoup/types";

interface WorkerEntry {
    worker: Worker;
    webRtcServer: WebRtcServer;
}

const workers: WorkerEntry[] = [];

export async function createWorker(announcedAddress: string): Promise<void> {
    console.debug('[Worker] Creating mediasoup worker');

    const worker = await mediasoup.createWorker();
    const webRtcServer = await worker.createWebRtcServer({
        listenInfos: [
            { protocol: 'udp', ip: '0.0.0.0', announcedAddress, port: 20000 },
            { protocol: 'tcp', ip: '0.0.0.0', announcedAddress, port: 20000 },
        ],
    });

    workers.push({ worker, webRtcServer });
    console.debug(`[Worker] Created pid=${worker.pid}`);
}

// Round-robin для будущего масштабирования
let currentIndex = 0;

export function getWorkerEntry(): WorkerEntry {
    if (workers.length === 0)
        throw new Error('No workers available');

    const entry = workers[currentIndex];
    currentIndex = (currentIndex + 1) % workers.length;
    return entry;
}