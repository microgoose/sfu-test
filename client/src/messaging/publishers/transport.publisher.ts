import {publish} from '../client';
import {COMMANDS} from '../commands';
import {
    ConnectTransportPayload,
    ConsumePayload,
    CreateTransportPayload,
    ProducePayload,
    ResumeConsumerPayload,
} from '../types/transport.types';

export function createTransport(payload: CreateTransportPayload): void {
    publish(COMMANDS.transport.create, payload);
}

export function connectTransport(payload: ConnectTransportPayload): void {
    publish(COMMANDS.transport.connect, payload);
}

export function produce(payload: ProducePayload): void {
    publish(COMMANDS.producer.produce, payload);
}

export function consume(payload: ConsumePayload): void {
    publish(COMMANDS.consumer.consume, payload);
}

export function resumeConsumer(payload: ResumeConsumerPayload): void {
    publish(COMMANDS.consumer.resume, payload);
}