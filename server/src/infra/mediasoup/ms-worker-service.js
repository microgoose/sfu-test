import * as mediasoup from "mediasoup";

export const workers = new Map();
export const workerWebRtcServers = new Map();

export function getWorker() {
    if (workers.size === 0)
        throw new Error('No workers found');

    const [pid] = workers.keys();
    const worker = workers.get(pid);
    if (!worker)
        throw new Error('Couldn\'t get a worker');

    return worker;
}

export function getWebRtcServerByWorkerPid(pid) {
    const webRtcServer = workerWebRtcServers.get(pid);
    if (!webRtcServer)
        throw new Error(`Worker pid=${pid} WebRTC server not found`);
    return webRtcServer;
}

export async function createWorker() {
    console.debug('Creating mediasoup worker');
    const worker = await mediasoup.createWorker();
    workers.set(worker.pid, worker);
    console.debug(`Worker created pid=${worker.pid}`);

    const webRtcServer = await worker.createWebRtcServer({
        listenInfos: [
            {
                protocol: 'udp',
                ip: '0.0.0.0',
                announcedAddress: '192.168.31.111',
                port: 20000
            },
            {
                protocol: 'tcp',
                ip: '0.0.0.0',
                announcedAddress: '192.168.31.111',
                port: 20000
            }
        ]
    });
    workerWebRtcServers.set(worker.pid, webRtcServer);
    console.debug(`WebRTC server created for worker pid=${worker.pid}`);
}
