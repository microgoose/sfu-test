import {registerHandler} from '../infra/stomp/stomp-broker.ts';
import {COMMANDS} from '../config/ws.commands.ts';
import * as transportService from '../service/transport.service.ts';
import * as producerService from '../service/producer.service.ts';
import * as consumerService from '../service/consumer.service.ts';
import {DtlsParameters, MediaKind, RtpCapabilities, RtpParameters} from "mediasoup/types";

interface ConnectTransportBody {
    transportId: string;
    dtlsParameters: DtlsParameters;
}

interface GetRoomProducersList {
    roomId: string
}

interface ProduceBody {
    transportId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
}

interface ConsumeBody {
    transportId: string;
    producerId: string;
    rtpCapabilities: RtpCapabilities;
}

interface ResumeConsumerBody {
    consumerId: string;
}

export function registerTransportRoutes(): void {
    registerHandler(COMMANDS.transport.create, async (session) => {
        console.debug(`[STOMP Command, session ${session.id}] Create transport`);
        await transportService.createTransport(session.id);
    });

    registerHandler<ConnectTransportBody>(COMMANDS.transport.connect, async (session, body) => {
        console.debug(`[STOMP Command, session ${session.id}] Connect transport`);
        await transportService.connectTransport(session.id, body.transportId, body.dtlsParameters);
    });
}

export function registerConsumerRoutes(): void {
    registerHandler<ConsumeBody>(COMMANDS.consumer.create, async (session, body) => {
        console.debug(`[STOMP Command, session ${session.id}] Create consumer`);
        await consumerService.createConsumer(session.id, body.transportId, body.producerId, body.rtpCapabilities);
    });

    registerHandler<ResumeConsumerBody>(COMMANDS.consumer.resume, async (session, body) => {
        console.debug(`[STOMP Command, session ${session.id}] Resume consumer ${body.consumerId}`);
        await consumerService.resumeConsumer(body.consumerId);
    });
}

export function registerProducerRoutes(): void {
    registerHandler<GetRoomProducersList>(COMMANDS.producer.getRoomProduces, async (session, body) => {
        console.debug(`[STOMP Command, session ${session.id}] Get room producers`);
        producerService.getBySession(session.id, body.roomId);
    });

    registerHandler<ProduceBody>(COMMANDS.producer.create, async (session, body) => {
        console.debug(`[STOMP Command, session ${session.id}] Create producer`);
        await producerService.createProducer(session.id, body.transportId, body.kind, body.rtpParameters);
    });
}