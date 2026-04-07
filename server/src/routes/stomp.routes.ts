import {registerHandler} from '../infra/stomp/stomp-broker.ts';
import {COMMANDS} from '../config/ws.commands.ts';
import * as roomService from '../service/room.service.ts';
import * as participantService from '../service/participant.service.ts';
import {DtlsParameters, MediaKind, RtpCapabilities, RtpParameters} from "mediasoup/types";

interface JoinRoomBody {
    roomId: string;
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
    registerHandler<JoinRoomBody>(COMMANDS.room.join, (session, body) => {
        console.debug(`[STOMP Command] ${COMMANDS.room.join}`);
        roomService.joinRoom(session.id, body.roomId);
    });

    registerHandler(COMMANDS.room.leave, (session) => {
        console.debug(`[STOMP Command] ${COMMANDS.room.leave}`);
        roomService.leaveRoom(session.id);
    });

    registerHandler(COMMANDS.transport.create, async (session, body) => {
        console.debug(`[STOMP Command] ${COMMANDS.transport.create}`);
        await participantService.createTransport(session.id);
    });

    registerHandler<ConnectTransportBody>(COMMANDS.transport.connect, async (session, body) => {
        console.debug(`[STOMP Command] ${COMMANDS.transport.connect}`);
        await participantService.connectTransport(session.id, body.transportId, body.dtlsParameters);
    });

    registerHandler<ProduceBody>(COMMANDS.producer.create, async (session, body) => {
        console.debug(`[STOMP Command] ${COMMANDS.producer.create}`);
        await participantService.createProducer(session.id, body.transportId, body.kind, body.rtpParameters, body.appData);
    });

    registerHandler<ConsumeBody>(COMMANDS.consumer.create, async (session, body) => {
        console.debug(`[STOMP Command] ${COMMANDS.consumer.create}`);
        await participantService.createConsumer(session.id, body.transportId, body.producerId, body.rtpCapabilities);
    });

    registerHandler<ResumeConsumerBody>(COMMANDS.consumer.resume, async (_session, body) => {
        console.debug(`[STOMP Command] ${COMMANDS.consumer.resume}`);
        await participantService.resumeConsumer(body.consumerId);
    });
}