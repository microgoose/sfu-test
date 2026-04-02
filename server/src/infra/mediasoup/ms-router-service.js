import {getWebRtcServerByWorkerPid, getWorker} from "./ms-worker-service.js";

export const routers = new Map();
export const workerRouters = new Map();

export function getRouter(id) {
    const router = routers.get(id);
    if (!router)
        throw new Error(`Router ${id} not found`);

    return router;
}

export function getWebRtcServerByRouterId(routerId) {
    const worker = workerRouters.get(routerId);
    if (!worker)
        throw new Error(`Router ${routerId} worker not found`);

    return getWebRtcServerByWorkerPid(worker.pid);
}

export async function createRouter() {
    const worker = getWorker();
    console.debug(`Creating router on worker pid=${worker.pid}`);

    const router = await worker.createRouter({
        mediaCodecs: [
            {
                kind: "audio",
                mimeType: "audio/opus",
                clockRate: 48000,
                channels: 2,
            },
            {
                kind: "video",
                mimeType: "video/VP8",
                clockRate: 90000,
            },
        ],
    });

    routers.set(router.id, router);
    workerRouters.set(router.id, worker);
    console.debug(`Router created id=${router.id} on worker pid=${worker.pid}`);

    return router.id;
}

export function getRtpCapabilities(routerId) {
    console.debug(`Getting rtp capabilities for router id=${routerId}`);
    const rtpCapabilities = getRouter(routerId).rtpCapabilities;
    console.debug(`Got rtp capabilities codecs=${rtpCapabilities.codecs.length}`);
    return rtpCapabilities;
}
