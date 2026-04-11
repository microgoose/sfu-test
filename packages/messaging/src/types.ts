export type MessageHandler<T> = (payload: T) => void;
export type RpcMessageHandler<Req, Res> = (payload: Req) => Res | Promise<Res>;

// --- Room ---
export interface JoinRoomPayload        { userId: string }
export interface JoinRoomResponse       { rtpCapabilities: object }
export interface LeaveRoomPayload       { userId: string }
export interface ParticipantJoinedEvent { userId: string; }
export interface ParticipantLeftEvent   { userId: string; }

// --- Transport ---
export interface CreateTransportResponse    { transportId: string; iceParameters: any; iceCandidates: any[]; dtlsParameters: any }
export interface ConnectTransportPayload    { transportId: string; dtlsParameters: any }
export interface ConnectTransportResponse   { transportId: string }

// --- Producer ---
export interface CreateProducerPayload  { transportId: string; userId: string; kind: 'audio' | 'video'; rtpParameters: any }
export interface CreateProducerResponse { producerId: string }
export interface NewProducerEvent       { producerId: string; userId: string; kind: 'audio' | 'video' }
export interface ProducerListResponse   { producers: Array<{ producerId: string; userId: string; kind: 'audio' | 'video' }> }

// --- Consumer ---
export interface CreateConsumerPayload  { producerId: string; transportId: string; recvRtpCapabilities: object }
export interface CreateConsumerResponse { consumerId: string; producerId: string; kind: 'audio' | 'video'; rtpParameters: any }
export interface ResumeConsumerPayload  { consumerId: string }