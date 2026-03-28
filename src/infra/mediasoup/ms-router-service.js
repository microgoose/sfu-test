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
    const router = await worker.createRouter();
    routers.set(router.id, router);
    workerRouters.set(worker.pid, router);
    return router.id;
}

export async function getRtpCapabilities(routerId) {
    return getRouter(routerId).rtpCapabilities;
}