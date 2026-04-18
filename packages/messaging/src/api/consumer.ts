import {destinations, toExchange, toTopic} from '../destinations.js';
import {StompAdapter} from '../client.js';
import {
    CreateConsumerPayload,
    CreateConsumerResponse,
    MessageHandler,
    ResumeConsumerPayload,
    RpcMessageHandler,
} from '../types.js';

export const createConsumerMessaging = (adapter: StompAdapter) => ({
    create: (roomId: string, payload: CreateConsumerPayload): Promise<CreateConsumerResponse> =>
        adapter.request(toExchange(destinations.consumer.create(roomId)), payload),

    onCreate: (roomId: string, handler: RpcMessageHandler<CreateConsumerPayload, CreateConsumerResponse>) =>
        adapter.handle(toTopic(destinations.consumer.create(roomId)), handler),

    resume: (roomId: string, payload: ResumeConsumerPayload) =>
        adapter.publish(toExchange(destinations.consumer.resume(roomId)), payload),

    onResume: (roomId: string, payload: MessageHandler<ResumeConsumerPayload>) =>
        adapter.subscribe(toExchange(destinations.consumer.resume(roomId)), payload),
});