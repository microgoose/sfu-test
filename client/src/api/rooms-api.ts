import {ParticipantLeftMessage, RtpCapabilitiesMessage} from "../messaging/types/room.types";
import {pendingSubscription} from "../messaging/client";
import {TOPICS} from "../messaging/topics";
import {join, leave} from "../messaging/publishers/room.publisher";

export async function getRoomList() {
    const response = await fetch("http://localhost:8080/api/v1/room");
    return response.json();
}

export function joinRoom(roomId: string): Promise<RtpCapabilitiesMessage['payload']> {
    const response = pendingSubscription<RtpCapabilitiesMessage>(TOPICS.room.rtpCapabilities)
        .then(msg => msg.payload);

    join({roomId});
    return response;
}

export function leaveRoom(roomId: string): Promise<ParticipantLeftMessage['payload']> {
    const response = pendingSubscription<ParticipantLeftMessage>(TOPICS.room.participantLeft)
        .then(msg => msg.payload);

    leave({roomId});
    return response;
}