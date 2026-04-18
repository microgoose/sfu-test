import {destinations, toExchange, toTopic} from '../destinations.js';
import {StompAdapter} from '../client.js';
import {
    ConnectTransportPayload,
    ConnectTransportResponse,
    CreateTransportResponse,
    RpcMessageHandler,
} from '../types.js';

export const createTransportMessaging = (adapter: StompAdapter) => ({
    create: (roomId: string): Promise<CreateTransportResponse> =>
        adapter.request(toExchange(destinations.transport.create(roomId))),

    onCreate: (roomId: string, handler: RpcMessageHandler<undefined, CreateTransportResponse>) =>
        adapter.handle(toTopic(destinations.transport.create(roomId)), handler),

    connect: (roomId: string, payload: ConnectTransportPayload): Promise<ConnectTransportResponse> =>
        adapter.request(toExchange(destinations.transport.connect(roomId)), payload),

    onConnect: (roomId: string, handler: RpcMessageHandler<ConnectTransportPayload, ConnectTransportResponse>) =>
        adapter.handle(toTopic(destinations.transport.connect(roomId)), handler),
});