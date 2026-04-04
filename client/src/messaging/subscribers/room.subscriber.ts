import {StompSubscription} from '@stomp/stompjs';
import {subscribe} from '../client';
import {TOPICS} from '../topics';
import {ParticipantJoinedMessage, ParticipantLeftMessage, RtpCapabilitiesMessage} from '../types/room.types';
import {RtpCapabilities} from "mediasoup-client/types";

interface RoomSubscriberCallbacks {
    onParticipantJoined?: (participantId: string) => void;
    onParticipantLeft?:   (participantId: string) => void;
    onRtpCapabilities?:  (rtpCapabilities: RtpCapabilities) => void;
}

export function subscribeToRoom(callbacks: RoomSubscriberCallbacks): StompSubscription[] {
    return [
        subscribe(TOPICS.room.participantJoined, (msg: ParticipantJoinedMessage) => {
            callbacks.onParticipantJoined?.(msg.payload.participantId);
        }),

        subscribe(TOPICS.room.participantLeft, (msg: ParticipantLeftMessage) => {
            callbacks.onParticipantLeft?.(msg.payload.participantId);
        }),

        subscribe(TOPICS.room.rtpCapabilities, (msg: RtpCapabilitiesMessage) => {
            callbacks.onRtpCapabilities?.(msg.payload.rtpCapabilities);
        }),
    ];
}