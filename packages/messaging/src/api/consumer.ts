import {destinations, toExchange, toTopic} from '../destinations.js';
import {StompAdapter} from '../adapter.js';
import {
    CreateConsumerPayload,
    CreateConsumerResponse,
    MessageHandler,
    ResumeConsumerPayload,
    RpcMessageHandler,
} from '../types.js';

export const createConsumerMessaging = (stomp: StompAdapter) => ({
    create: (roomId: string, payload: CreateConsumerPayload): Promise<CreateConsumerResponse> =>
        stomp.request(toExchange(destinations.consumer.create(roomId)), payload),

    onCreate: (roomId: string, handler: RpcMessageHandler<CreateConsumerPayload, CreateConsumerResponse>) =>
        stomp.handle(toTopic(destinations.consumer.create(roomId)), handler),

    resume: (roomId: string, payload: ResumeConsumerPayload) =>
        stomp.publish(toExchange(destinations.consumer.resume(roomId)), payload),

    onResume: (roomId: string, payload: MessageHandler<ResumeConsumerPayload>) =>
        stomp.subscribe(toExchange(destinations.consumer.resume(roomId)), payload),
});