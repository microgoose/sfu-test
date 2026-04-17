export type MessageHandler<T> = (payload: T) => void;
export type RpcMessageHandler<Req, Res> = (payload: Req) => Res | Promise<Res>;

export type Participant = { id: string, name: string }
export type MediaKind = 'audio' | 'video';
export type Producer = { producerId: string; participantId: string; kind: MediaKind }
export type RtpCapabilities = object;

// --- Room ---
export type JoinRoomPayload         = { participantId: string };
export type LeaveRoomPayload        = { participantId: string };
export type ParticipantJoinedEvent  = Participant;
export type ParticipantLeftEvent    = { participantId: string };

// --- Router ---
export type RtpCapabilitiesResponse = RtpCapabilities;

// --- Transport ---
export interface CreateTransportResponse    { transportId: string; iceParameters: any; iceCandidates: any[]; dtlsParameters: any }
export interface ConnectTransportPayload    { transportId: string; dtlsParameters: any }
export interface ConnectTransportResponse   { transportId: string }

// --- Producer ---
export interface CreateProducerPayload  { transportId: string; participantId: string; kind: MediaKind; rtpParameters: any }
export interface CreateProducerResponse { producerId: string }
export interface NewProducerEvent       { producerId: string; participantId: string; kind: MediaKind }
export interface ProducerListResponse   { producers: Producer[] }
export interface CloseProducerEvent     { producers: Producer[] }

// --- Consumer ---
export interface CreateConsumerPayload  { producerId: string; transportId: string; recvRtpCapabilities: RtpCapabilities }
export interface CreateConsumerResponse { consumerId: string; producerId: string; kind: MediaKind; rtpParameters: any }
export interface ResumeConsumerPayload  { consumerId: string }