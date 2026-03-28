import {getRouter, getWebRtcServerByRouterId} from "./ms-router-service.js";

const transports = new Map();
const routerTransports = new Map();

export async function createTransport(routerId) {
    const router = getRouter(routerId);
    const webRtcServer = getWebRtcServerByRouterId(routerId);

    const transport = await router.createWebRtcTransport({
        webRtcServer: webRtcServer,
        enableUdp: true,
        enableTcp: false
    });
    transports.set(transport.id, transport);
    routerTransports.set(routerId, transport);

    return {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
        sctpParameters: transport.sctpParameters,
    };
}