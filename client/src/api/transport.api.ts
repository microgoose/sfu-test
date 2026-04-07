import {
    ConnectTransportPayload,
    ConsumedMessage,
    ConsumePayload,
    CreateTransportPayload,
    ProducedMessage,
    ProducePayload,
    ResumeConsumerPayload,
    SendTransportCreatedMessage,
    TransportConnectedMessage
} from "../messaging/types/transport.types";
import {TransportOptions} from "mediasoup-client/types";
import {pendingSubscription} from "../messaging/client";
import {TOPICS} from "../messaging/topics";
import * as transportPublisher from '../messaging/publishers/transport.publisher';

export function createTransport(payload: CreateTransportPayload): Promise<TransportOptions> {
    const response = pendingSubscription<SendTransportCreatedMessage>(TOPICS.transport.created)
        .then(msg => msg.payload.parameters);
    transportPublisher.createTransport(payload);
    return response;
}

export function connectTransport(payload: ConnectTransportPayload): Promise<TransportConnectedMessage['payload']> {
    const response = pendingSubscription<TransportConnectedMessage>(TOPICS.transport.connected)
        .then((msg) => msg.payload);
    transportPublisher.connectTransport(payload);
    return response;
}

export function createProducer(payload: ProducePayload): Promise<ProducedMessage['payload']> {
    const response = pendingSubscription<ProducedMessage>(TOPICS.producer.created)
        .then(msg => msg.payload);
    transportPublisher.createProducer(payload);
    return response;
}

export function createConsumer(payload: ConsumePayload): Promise<ConsumedMessage['payload']> {
    const response = pendingSubscription<ConsumedMessage>(TOPICS.consumer.created)
        .then(msg => msg.payload);
    transportPublisher.createConsumer(payload);
    return response;
}

export function resumeConsumer(payload: ResumeConsumerPayload): void {
    transportPublisher.resumeConsumer(payload);
}