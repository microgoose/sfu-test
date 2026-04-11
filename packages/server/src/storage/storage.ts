import type {Consumer, Producer, Router, WebRtcTransport} from 'mediasoup/types';

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface Room {
    id: string;
    createdBy: string;       // participantId
    routerId: string;
}

export interface Participant {
    id: string;
}

export interface RoomParticipant {
    roomId: string;
    participantId: string;
    joinedAt: Date;
}

export interface ProducerEntry {
    producer: Producer;
    userId: string;
    transportId: string;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const rooms         = new Map<string, Room>();
const participants  = new Map<string, Participant>();
const roomParts     = new Map<string, RoomParticipant>();   // key: `${roomId}:${participantId}`
const routers       = new Map<string, Router>();            // key: mediasoup router id
const transports    = new Map<string, WebRtcTransport>();   // key: transport id
const producers     = new Map<string, ProducerEntry>();          // key: producer id
const consumers     = new Map<string, Consumer>();          // key: consumer id

// secondary indexes
const transportsByRouter  = new Map<string, Set<string>>(); // routerId    -> transportId[]
const routerByTransport   = new Map<string, string>();      // transportId -> routerId
const routerByRoom        = new Map<string, string>();      // roomId      -> routerId
const producersByTransport = new Map<string, Set<string>>(); // transportId -> producerId[]
const consumersByTransport = new Map<string, Set<string>>(); // transportId -> consumerId[]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rpKey(roomId: string, participantId: string): string {
    return `${roomId}:${participantId}`;
}

function idsFor<T>(index: Map<string, Set<string>>, key: string): string[] {
    return [...(index.get(key) ?? [])];
}

function indexAdd(index: Map<string, Set<string>>, key: string, value: string): void {
    if (!index.has(key)) index.set(key, new Set());
    index.get(key)!.add(value);
}

function indexRemove(index: Map<string, Set<string>>, key: string, value: string): void {
    index.get(key)?.delete(value);
}

// ---------------------------------------------------------------------------
// Room
// ---------------------------------------------------------------------------

export function saveRoom(room: Room): void {
    rooms.set(room.id, room);
}

export function findRoomById(id: string): Room | undefined {
    return rooms.get(id);
}

export function findAllRooms(): Room[] {
    return [...rooms.values()];
}

export function deleteRoom(id: string): void {
    rooms.delete(id);
}

// ---------------------------------------------------------------------------
// Participant
// ---------------------------------------------------------------------------

export function saveParticipant(participant: Participant): void {
    participants.set(participant.id, participant);
}

export function findParticipantById(id: string): Participant | undefined {
    return participants.get(id);
}

export function deleteParticipant(id: string): void {
    participants.delete(id);
}

// ---------------------------------------------------------------------------
// RoomParticipant (junction)
// ---------------------------------------------------------------------------

export function joinRoom(roomId: string, participantId: string): RoomParticipant {
    const rp: RoomParticipant = { roomId, participantId, joinedAt: new Date() };
    roomParts.set(rpKey(roomId, participantId), rp);
    return rp;
}

export function leaveRoom(roomId: string, participantId: string): void {
    roomParts.delete(rpKey(roomId, participantId));
}

export function isInRoom(roomId: string, participantId: string): boolean {
    return roomParts.has(rpKey(roomId, participantId));
}

export function findRoomsByParticipant(participantId: string): Room[] {
    const result: Room[] = [];
    for (const rp of roomParts.values()) {
        if (rp.participantId !== participantId) continue;
        const room = rooms.get(rp.roomId);
        if (room) result.push(room);
    }
    return result;
}

export function findParticipantsByRoom(roomId: string): Participant[] {
    const result: Participant[] = [];
    for (const rp of roomParts.values()) {
        if (rp.roomId !== roomId) continue;
        const p = participants.get(rp.participantId);
        if (p) result.push(p);
    }
    return result;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export function saveRouter(router: Router, roomId: string): void {
    routers.set(router.id, router);
    routerByRoom.set(roomId, router.id);
}

export function findRouterById(id: string): Router | undefined {
    return routers.get(id);
}

export function findRouterByRoomId(roomId: string): Router | undefined {
    const routerId = routerByRoom.get(roomId);
    if (!routerId) return undefined;
    return routers.get(routerId);
}

export function deleteRouter(id: string, roomId: string): void {
    routers.delete(id);
    routerByRoom.delete(roomId);
}

// Resolve room from a routerId (room → router is 1:1 per your schema)
export function findRoomByRouterId(routerId: string): Room | undefined {
    for (const room of rooms.values()) {
        if (room.routerId === routerId) return room;
    }
}

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

export function saveTransport(transport: WebRtcTransport, routerId: string): void {
    transports.set(transport.id, transport);
    indexAdd(transportsByRouter, routerId, transport.id);
    routerByTransport.set(transport.id, routerId);
}

export function findTransportById(id: string): WebRtcTransport | undefined {
    return transports.get(id);
}

export function findTransportsByRouter(routerId: string): WebRtcTransport[] {
    return idsFor(transportsByRouter, routerId)
        .map(id => transports.get(id))
        .filter(Boolean) as WebRtcTransport[];
}

export function findRouterByTransportId(transportId: string): Router | undefined {
    const routerId = routerByTransport.get(transportId);
    if (!routerId) return undefined;
    return routers.get(routerId);
}

export function deleteTransport(id: string, routerId: string): void {
    transports.delete(id);
    indexRemove(transportsByRouter, routerId, id);
    routerByTransport.delete(id);
}

// ---------------------------------------------------------------------------
// Producer
// ---------------------------------------------------------------------------

export function saveProducer(producer: Producer, transportId: string, userId: string): void {
    producers.set(producer.id, {
        producer,
        transportId,
        userId
    });
    indexAdd(producersByTransport, transportId, producer.id);
}

export function findProducerById(id: string): ProducerEntry | undefined {
    return producers.get(id);
}

export function findProducersByTransport(transportId: string): ProducerEntry[] {
    return idsFor(producersByTransport, transportId)
        .map(id => producers.get(id))
        .filter(Boolean) as ProducerEntry[];
}

// Producers per room: room → router → transports → producers
export function findProducersByRoom(roomId: string): ProducerEntry[] {
    const room = rooms.get(roomId);
    if (!room) return [];

    return findTransportsByRouter(room.routerId)
        .flatMap(t => findProducersByTransport(t.id));
}

export function deleteProducer(id: string, transportId: string): void {
    producers.delete(id);
    indexRemove(producersByTransport, transportId, id);
}

// ---------------------------------------------------------------------------
// Consumer
// ---------------------------------------------------------------------------

export function saveConsumer(consumer: Consumer, transportId: string): void {
    consumers.set(consumer.id, consumer);
    indexAdd(consumersByTransport, transportId, consumer.id);
}

export function findConsumerById(id: string): Consumer | undefined {
    return consumers.get(id);
}

export function findConsumersByTransport(transportId: string): Consumer[] {
    return idsFor(consumersByTransport, transportId)
        .map(id => consumers.get(id))
        .filter(Boolean) as Consumer[];
}

export function deleteConsumer(id: string, transportId: string): void {
    consumers.delete(id);
    indexRemove(consumersByTransport, transportId, id);
}