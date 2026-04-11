import {MEDIA_CODECS} from "../config.ts";
import {getWorker} from "@/infra/mediasoup/adapter/worker.adapter.ts";

export async function createRouter() {
    const worker = getWorker();
    const router = await worker.createRouter({mediaCodecs: MEDIA_CODECS});
    console.debug(`[Router] Created id=${router.id}`);
    return router;
}