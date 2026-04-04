import {BaseMessage} from './base.types';
import {RtpCapabilities} from "mediasoup-client/types";

// ─── Команды ───────────────────────────────

export interface JoinRoomPayload {
    roomId: string;
}

// ─── События ───────────────────────────────

export interface ParticipantJoinedMessage extends BaseMessage {
    type: 'room.participant.joined';
    payload: {
        participantId: string;
    };
}

export interface ParticipantLeftMessage extends BaseMessage {
    type: 'room.participant.left';
    payload: {
        participantId: string;
    };
}

export interface RtpCapabilitiesMessage extends BaseMessage {
    type: 'room.rtp-capabilities';
    payload: {
        rtpCapabilities: RtpCapabilities;
    };
}