import {
    type CloseProducersEvent,
    MessagingSocket,
    type NewProducerEvent,
    type ParticipantJoinedEvent,
    type ParticipantLeftEvent
} from "@sfu-test/messaging";
import * as storage from '@/storage/storage.js';
import {sockets} from "@/infra/messaging/messaging-server.js";

export function publishParticipantJoined(roomId: string, event: ParticipantJoinedEvent) {
    broadcastToRoom(roomId, (s) => s.publishParticipantJoined(event));
}

export function publishParticipantLeft(roomId: string, event: ParticipantLeftEvent) {
    broadcastToRoom(roomId, (s) => s.publishParticipantLeft(event));
}

export function publishCloseProducer(roomId: string, event: CloseProducersEvent) {
    broadcastToRoom(roomId, (s) => s.publishCloseProducers(event));
}

export function publishNewProducer(roomId: string, event: NewProducerEvent) {
    broadcastToRoom(roomId, (s) => s.publishNewProducer(event));
}

function broadcastToRoom(roomId: string, callback: (socket: MessagingSocket) => void) {
    const participants = storage.findParticipantsByRoomId(roomId);
    for (let participant of participants) {
        const socket = sockets.get(participant.id);
        if (!socket) return console.warn(`Socket ${participant.id} not found`);
        callback(socket);
    }
}