import {getWorkerEntry} from "./worker.service.ts";
import {Router, RouterRtpCodecCapability, WebRtcServer} from "mediasoup/types";

interface RouterEntry {
    router: Router;
    webRtcServer: WebRtcServer,
}

const routers = new Map<string, RouterEntry>();
const MEDIA_CODECS: RouterRtpCodecCapability[] = [
    { kind: 'video', mimeType: 'video/VP8', clockRate: 90000 },
    { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
];

export async function createRouter(): Promise<string> {
    const { worker, webRtcServer } = getWorkerEntry();

    const router = await worker.createRouter({ mediaCodecs: MEDIA_CODECS });

    routers.set(router.id, { router, webRtcServer });
    console.debug(`[Router] Created id=${router.id}`);

    return router.id;
}

export function getRouter(routerId: string): Router {
    const entry = routers.get(routerId);
    if (!entry) throw new Error(`Router ${routerId} not found`);
    return entry.router;
}

export function getWebRtcServer(routerId: string) {
    const entry = routers.get(routerId);
    if (!entry) throw new Error(`Router ${routerId} not found`);
    return entry.webRtcServer;
}

export function getRtpCapabilities(routerId: string) {
    return getRouter(routerId).rtpCapabilities;
}