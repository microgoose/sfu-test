import {BaseMessage} from './base.types';
import {
    DtlsParameters,
    MediaKind,
    RtpCapabilities,
    RtpParameters,
    SctpCapabilities,
    TransportOptions,
} from 'mediasoup-client/types';

// ─── Команды ───────────────────────────────

export interface CreateTransportPayload {
    direction: 'send' | 'recv';
    sctpCapabilities: SctpCapabilities;
}

export interface ConnectTransportPayload {
    transportId: string;
    dtlsParameters: DtlsParameters;
}

export interface ProducePayload {
    transportId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
    appData: Record<string, unknown>;
}

export interface ConsumePayload {
    transportId: string;
    producerId: string;
    kind: MediaKind;
    rtpCapabilities: RtpCapabilities;
}

export interface ResumeConsumerPayload {
    consumerId: string;
}

// ─── События ───────────────────────────────

export interface SendTransportCreatedMessage extends BaseMessage {
    type: 'transport.send.created';
    payload: {
        parameters: TransportOptions;
    };
}

export interface RecvTransportCreatedMessage extends BaseMessage {
    type: 'transport.recv.created';
    payload: {
        parameters: TransportOptions;
    };
}

export interface TransportConnectedMessage extends BaseMessage {
    type: 'transport.connected';
    payload: {
        transportId: string;
    };
}

export interface ProducedMessage extends BaseMessage {
    type: 'producer.produced';
    payload: {
        producerId: string;
        kind: MediaKind;
    };
}

export interface NewProducerMessage extends BaseMessage {
    type: 'producer.new';
    payload: {
        producerId: string;
        kind: MediaKind;
    };
}

export interface ConsumedMessage extends BaseMessage {
    type: 'consumer.consumed';
    payload: {
        consumerId: string;
        producerId: string;
        kind: MediaKind;
        rtpParameters: RtpParameters;
    };
}