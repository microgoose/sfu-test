import type {Router, WebRtcServer, WebRtcTransport, Worker} from "mediasoup/types";

export interface WorkerEntry {
    worker: Worker;
    webRtcServer: WebRtcServer;
}

export interface RouterEntry {
    router: Router;
    webRtcServer: WebRtcServer,
}

export interface TransportEntry {
    transport: WebRtcTransport;
    routerId: string;
}