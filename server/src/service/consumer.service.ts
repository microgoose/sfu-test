import {RtpCapabilities} from "mediasoup/types";
import * as transportService from "../infra/mediasoup/transport.adapter.ts";
import {sendTo} from "../infra/stomp/stomp-broker.ts";
import {TOPICS} from "../config/ws.topics.ts";

export async function createConsumer(
    sessionId: string,
    transportId: string,
    producerId: string,
    rtpCapabilities: RtpCapabilities,
): Promise<void> {
    if (!transportService.canConsume(producerId, rtpCapabilities))
        throw new Error(`Cannot consume producer ${producerId}`);

    const params = await transportService.createConsumer(transportId, producerId, rtpCapabilities);
    sendTo(sessionId, TOPICS.consumer.created, params);
}

export async function resumeConsumer(consumerId: string): Promise<void> {
    await transportService.resumeConsumer(consumerId);
}