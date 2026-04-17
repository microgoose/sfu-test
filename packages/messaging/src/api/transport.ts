import {destinations, toExchange, toTopic} from '../destinations.js';
import {StompAdapter} from '../adapter.js';
import {
    ConnectTransportPayload,
    ConnectTransportResponse,
    CreateTransportResponse,
    RpcMessageHandler,
} from '../types.js';

export const createTransportMessaging = (stomp: StompAdapter) => ({
    create: (roomId: string): Promise<CreateTransportResponse> =>
        stomp.request(toExchange(destinations.transport.create(roomId))),

    onCreate: (roomId: string, handler: RpcMessageHandler<undefined, CreateTransportResponse>) =>
        stomp.handle(toTopic(destinations.transport.create(roomId)), handler),

    connect: (roomId: string, payload: ConnectTransportPayload): Promise<ConnectTransportResponse> =>
        stomp.request(toExchange(destinations.transport.connect(roomId)), payload),

    onConnect: (roomId: string, handler: RpcMessageHandler<ConnectTransportPayload, ConnectTransportResponse>) =>
        stomp.handle(toTopic(destinations.transport.connect(roomId)), handler),
});