import {destinations, toExchange, toTopic} from '../destinations.js';
import {StompAdapter} from '../adapter.js';
import {
    CloseProducerEvent,
    CreateProducerPayload,
    CreateProducerResponse,
    MessageHandler,
    NewProducerEvent,
    ProducerListResponse,
    RpcMessageHandler,
} from '../types.js';

export const createProducerMessaging = (stomp: StompAdapter) => ({
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

    publishClose: (roomId: string, payload: CloseProducerEvent) =>
        stomp.publish(toExchange(destinations.producer.close(roomId)), payload),

    onClose: (roomId: string, handler: MessageHandler<CloseProducerEvent>) =>
        stomp.subscribe(toTopic(destinations.producer.close(roomId)), handler),
});