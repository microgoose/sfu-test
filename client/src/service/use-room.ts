import {onCleanup, onMount} from 'solid-js';
import {getStompClient} from '../messaging/client';
import {subscribeToRoom} from '../messaging/subscribers/room.subscriber';
import {subscribeToTransport} from '../messaging/subscribers/transport.subscriber';
import * as roomPublisher from '../messaging/publishers/room.publisher';
import {MediasoupHook, useMediasoup} from './use-mediasoup';
import {StompSubscription} from '@stomp/stompjs';

interface UseRoomOptions {
    roomId: string;
    getStream: () => MediaStream;
}

export function useRoom(options: UseRoomOptions) {
    const {roomId} = options;
    const mediasoup = useMediasoup(options);
    const subscriptions: StompSubscription[] = [];

    onMount(() => {
        const client = getStompClient();

        client.onConnect = () => {
            console.debug('Connected');
            if (subscriptions.length > 0) return;

            subscriptions.push(
                ...setupRoomSubscriptions(mediasoup),
                ...setupTransportSubscriptions(mediasoup)
            );

            roomPublisher.join({roomId});
        };

        client.activate();

        onCleanup(() => {
            subscriptions.forEach(sub => sub.unsubscribe());
            subscriptions.length = 0;
            roomPublisher.leave({roomId});
            getStompClient().deactivate();
        });
    });

    return {
        videos: mediasoup.videos,
    };
}

function setupRoomSubscriptions(mediasoup: MediasoupHook) {
    return subscribeToRoom({
        onParticipantJoined: (participantId) => {
            console.debug('Participant joined:', participantId);
        },
        onParticipantLeft: (participantId) => {
            console.debug('Participant left:', participantId);
        },
        onRtpCapabilities: mediasoup.handleRtpCapabilities,
    });
}

function setupTransportSubscriptions(mediasoup: MediasoupHook) {
    return subscribeToTransport({
        onSendTransportCreated: mediasoup.handleSendTransportCreated,
        onRecvTransportCreated: mediasoup.handleRecvTransportCreated,
        onTransportConnected: mediasoup.handleTransportConnected,
        onProduced: mediasoup.handleProduced,
        onNewProducer: mediasoup.handleNewProducer,
        onConsumed: mediasoup.handleConsumed,
    });
}