import { registerHandler } from '../infra/stomp/stomp-broker.ts';
import { COMMANDS } from '../config/ws.commands.ts';
import * as roomService from '../service/room.service.ts';
import * as participantService from '../service/participant.service.ts';
import {DtlsParameters, MediaKind, RtpCapabilities, RtpParameters, SctpCapabilities} from "mediasoup/types";

interface JoinRoomBody {
    roomId: string;
}

interface CreateTransportBody {
    direction: 'send' | 'recv';
    dtlsParameters: SctpCapabilities;
}

interface ConnectTransportBody {
    transportId: string;
    dtlsParameters: DtlsParameters;
}

interface ProduceBody {
    transportId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
    appData: Record<string, unknown>;
}

interface ConsumeBody {
    transportId: string;
    producerId: string;
    rtpCapabilities: RtpCapabilities;
}

interface ResumeConsumerBody {
    consumerId: string;
}

export function registerStompRoutes(): void {
    registerHandler(COMMANDS.room.join, (session, body) => {
        console.debug(`[STOMP Routes] ${COMMANDS.room.join}`);
        const { roomId } = body as JoinRoomBody;
        roomService.joinRoom(session.id, roomId);
    });

    registerHandler(COMMANDS.room.leave, (session) => {
        console.debug(`[STOMP Routes] ${COMMANDS.room.leave}`);
        roomService.leaveRoom(session.id);
    });

    registerHandler(COMMANDS.transport.create, (session, body) => {
        console.debug(`[STOMP Routes] ${COMMANDS.transport.create}`);
        const { direction, dtlsParameters } = body as CreateTransportBody;
        participantService.setupTransport(session.id, direction, dtlsParameters);
    });

    registerHandler(COMMANDS.transport.connect, (session, body) => {
        console.debug(`[STOMP Routes] ${COMMANDS.transport.connect}`);
        const { transportId, dtlsParameters } = body as ConnectTransportBody;
        participantService.setupConnectTransport(session.id, transportId, dtlsParameters);
    });

    registerHandler(COMMANDS.producer.produce, (session, body) => {
        console.debug(`[STOMP Routes] ${COMMANDS.producer.produce}`);
        const { transportId, kind, rtpParameters, appData } = body as ProduceBody;
        participantService.setupProduce(session.id, transportId, kind, rtpParameters, appData);
    });

    registerHandler(COMMANDS.consumer.consume, (session, body) => {
        console.debug(`[STOMP Routes] ${COMMANDS.consumer.consume}`);
        const { transportId, producerId, rtpCapabilities } = body as ConsumeBody;
        participantService.setupConsume(session.id, transportId, producerId, rtpCapabilities);
    });

    registerHandler(COMMANDS.consumer.resume, (_session, body) => {
        console.debug(`[STOMP Routes] ${COMMANDS.consumer.resume}`);
        const { consumerId } = body as ResumeConsumerBody;
        participantService.setupResumeConsumer(consumerId);
    });
}