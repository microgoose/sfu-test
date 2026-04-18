import {destinations, toExchange, toTopic} from '../destinations.js';
import {StompAdapter} from '../client.js';
import {
    CloseProducerEvent,
    CreateProducerPayload,
    CreateProducerResponse,
    MessageHandler,
    NewProducerEvent,
    ProducerListResponse,
    RpcMessageHandler,
} from '../types.js';

export const createProducerMessaging = (adapter: StompAdapter) => ({
    create: (roomId: string, payload: CreateProducerPayload): Promise<CreateProducerResponse> =>
        adapter.request(toExchange(destinations.producer.create(roomId)), payload),

    onCreate: (roomId: string, handler: RpcMessageHandler<CreateProducerPayload, CreateProducerResponse>) =>
        adapter.handle(toTopic(destinations.producer.create(roomId)), handler),

    getList: (roomId: string): Promise<ProducerListResponse> =>
        adapter.request(toExchange(destinations.producer.getList(roomId))),

    onGetList: (roomId: string, handler: RpcMessageHandler<undefined, ProducerListResponse>) =>
        adapter.handle(toTopic(destinations.producer.getList(roomId)), handler),

    publishNew: (roomId: string, payload: NewProducerEvent) =>
        adapter.publish(toExchange(destinations.producer.new(roomId)), payload),

    onNew: (roomId: string, handler: MessageHandler<NewProducerEvent>) =>
        adapter.subscribe(toTopic(destinations.producer.new(roomId)), handler),

    publishClose: (roomId: string, payload: CloseProducerEvent) =>
        adapter.publish(toExchange(destinations.producer.close(roomId)), payload),

    onClose: (roomId: string, handler: MessageHandler<CloseProducerEvent>) =>
        adapter.subscribe(toTopic(destinations.producer.close(roomId)), handler),
});