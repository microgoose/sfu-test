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

export function createProducer(payload: ProducePayload): void {
    publish(COMMANDS.producer.create, payload);
}

export function getRoomProduces(roomId: string): void {
    publish(COMMANDS.producer.getRoomProduces, { roomId });
}

export function createConsumer(payload: ConsumePayload): void {
    publish(COMMANDS.consumer.create, payload);
}

export function resumeConsumer(payload: ResumeConsumerPayload): void {
    publish(COMMANDS.consumer.resume, payload);
}