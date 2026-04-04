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
        client.activate();
        client.onConnect = () => {
            subscriptions.push(
                ...setupRoomSubscriptions(mediasoup),
                ...setupTransportSubscriptions(mediasoup)
            );

            roomPublisher.join({roomId});
        };
    });

    onCleanup(() => {
        subscriptions.forEach(sub => sub.unsubscribe());
        roomPublisher.leave({roomId});
        getStompClient().deactivate();
    });

    return {
        videos: mediasoup.videos,
    };
}

function setupRoomSubscriptions(mediasoup: MediasoupHook) {
    return subscribeToRoom({
        onParticipantJoined: (participantId) => {
            console.log('Participant joined:', participantId);
        },
        onParticipantLeft: (participantId) => {
            console.log('Participant left:', participantId);
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