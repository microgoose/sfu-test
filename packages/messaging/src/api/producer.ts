import {destinations, toExchange, toTopic} from '../destinations.js';
import {StompAdapter} from '../adapter.js';
import {
    CreateProducerPayload,
    CreateProducerResponse,
    MessageHandler,
    NewProducerEvent,
    ProducerListResponse,
    RpcMessageHandler,
} from '../types.js';

export const createProducerApi = (stomp: StompAdapter) => ({
    create: (roomId: string, payload: CreateProducerPayload): Promise<CreateProducerResponse> =>
        stomp.request(toExchange(destinations.producer.create(roomId)), payload),

    onCreate: (roomId: string, handler: RpcMessageHandler<CreateProducerPayload, CreateProducerResponse>) =>
        stomp.handle(toTopic(destinations.producer.create(roomId)), handler),

    getList: (roomId: string): Promise<ProducerListResponse> =>
        stomp.request(toExchange(destinations.producer.getList(roomId))),

    onGetList: (roomId: string, handler: RpcMessageHandler<undefined, ProducerListResponse>) =>
        stomp.handle(toTopic(destinations.producer.getList(roomId)), handler),

    publishNew: (roomId: string, payload: NewProducerEvent) =>
        stomp.publish(toExchange(destinations.producer.new(roomId)), payload),

    onNew: (roomId: string, handler: MessageHandler<NewProducerEvent>) =>
        stomp.subscribe(toTopic(destinations.producer.new(roomId)), handler),
});