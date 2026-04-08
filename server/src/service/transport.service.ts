import * as transportService from "../infra/mediasoup/transport.service.ts";
import {sendTo} from "../infra/stomp/stomp-broker.ts";
import {TOPICS} from "../config/ws.topics.ts";
import {DtlsParameters} from "mediasoup/types";
import {getRoomBySession} from "./room.service.ts";

export async function createTransport(sessionId: string): Promise<void> {
    const room = getRoomBySession(sessionId);
    const parameters = await transportService.createTransport(room.routerId);
    sendTo(sessionId, TOPICS.transport.created, { parameters });
}

export async function connectTransport(sessionId: string, transportId: string, dtlsParameters: DtlsParameters): Promise<void> {
    await transportService.connectTransport(transportId, dtlsParameters);
    sendTo(sessionId, TOPICS.transport.connected, { transportId });
}