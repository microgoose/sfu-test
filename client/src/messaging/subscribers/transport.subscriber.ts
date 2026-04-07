import {subscribe} from '../client';
import {TOPICS} from '../topics';
import {
    ConsumedMessage,
    NewProducerMessage,
    ProducedMessage,
    RecvTransportCreatedMessage,
    SendTransportCreatedMessage,
    TransportConnectedMessage,
} from '../types/transport.types';
import {StompSubscription} from '@stomp/stompjs';
import {MediaKind, TransportOptions} from 'mediasoup-client/types';

interface TransportSubscriberCallbacks {
    onSendTransportCreated: (parameters: TransportOptions) => void;
    onRecvTransportCreated: (parameters: TransportOptions) => void;
    onTransportConnected: (transportId: string) => void;
    onProduced: (producerId: string, kind: MediaKind) => void;
    onNewProducer: (producerId: string, kind: MediaKind) => void;
    onConsumed: (payload: ConsumedMessage['payload']) => void;
}

export function subscribeToTransport(
    callbacks: TransportSubscriberCallbacks
): StompSubscription[] {
    return [
        subscribe<SendTransportCreatedMessage>(
            TOPICS.transport.created,
            (msg) => callbacks.onSendTransportCreated(msg.payload.parameters)
        ),

        subscribe<RecvTransportCreatedMessage>(
            TOPICS.transport.created,
            (msg) => callbacks.onRecvTransportCreated(msg.payload.parameters)
        ),

        subscribe<TransportConnectedMessage>(
            TOPICS.transport.connected,
            (msg) => callbacks.onTransportConnected(msg.payload.transportId)
        ),

        subscribe<ProducedMessage>(
            TOPICS.producer.created,
            (msg) => callbacks.onProduced(msg.payload.producerId, msg.payload.kind)
        ),

        subscribe<NewProducerMessage>(
            TOPICS.producer.new,
            (msg) => callbacks.onNewProducer(msg.payload.producerId, msg.payload.kind)
        ),

        subscribe<ConsumedMessage>(
            TOPICS.consumer.created,
            (msg) => callbacks.onConsumed(msg.payload)
        ),
    ];
}