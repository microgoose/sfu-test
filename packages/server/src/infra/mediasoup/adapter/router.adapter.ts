import {getWorker} from "@/infra/mediasoup/adapter/worker.adapter.js";

export async function createRouter() {
    const worker = getWorker();
    const router = await worker.createRouter({
        mediaCodecs: [
            {
                kind: 'audio',
                mimeType: 'audio/opus',
                clockRate: 48000,
                channels: 2,
                parameters: {
                    'minptime': 10,
                    'useinbandfec': 1,      // Forward Error Correction — восстанавливает потерянные пакеты
                    'usedtx': 1,            // Discontinuous Transmission — молчание не жрёт битрейт
                },
            },
            {
                kind: 'video',
                mimeType: 'video/VP8',
                clockRate: 90000,
            },
            {
                kind: 'video',
                mimeType: 'video/VP9',
                clockRate: 90000,
                parameters: {'profile-id': 2},
            },
            {
                kind: 'video',
                mimeType: 'video/H264',
                clockRate: 90000,
                parameters: {
                    'packetization-mode': 1,
                    'profile-level-id': '42e01f',
                    'level-asymmetry-allowed': 1,
                },
            },
        ],
    });
    console.debug(`[Router] Created id=${router.id}`);
    return router;
}