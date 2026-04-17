import {destinations, toExchange, toTopic} from '../destinations.js';
import {StompAdapter} from '../adapter.js';
import {RpcMessageHandler, RtpCapabilitiesResponse} from '../types.js';

export const createRouterMessaging = (stomp: StompAdapter) => ({
    getRtpCapabilities: (roomId: string): Promise<RtpCapabilitiesResponse> =>
        stomp.request(toExchange(destinations.router.getRtpCapabilities(roomId))),

    onGetRtpCapabilities: (roomId: string, handler: RpcMessageHandler<undefined, RtpCapabilitiesResponse>) =>
        stomp.handle(toTopic(destinations.router.getRtpCapabilities(roomId)), handler),
});