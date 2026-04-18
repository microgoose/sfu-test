import {destinations, toExchange, toTopic} from '../destinations.js';
import {StompAdapter} from '../client.js';
import {RpcMessageHandler, RtpCapabilitiesResponse} from '../types.js';

export const createRouterMessaging = (adapter: StompAdapter) => ({
    getRtpCapabilities: (roomId: string): Promise<RtpCapabilitiesResponse> =>
        adapter.request(toExchange(destinations.router.getRtpCapabilities(roomId))),

    onGetRtpCapabilities: (roomId: string, handler: RpcMessageHandler<undefined, RtpCapabilitiesResponse>) =>
        adapter.handle(toTopic(destinations.router.getRtpCapabilities(roomId)), handler),
});