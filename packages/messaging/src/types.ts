// --- Common ---
export type MediaKind           = 'audio' | 'video';
export type RtpCapabilities     = object;
export type IceParameters       = any;
export type IceCandidates       = any;
export type DtlsParameters      = any;
export type RtpParameters       = any;

export interface  Participant   { id: string, name: string }
export interface  Producer      { producerId: string; participantId: string; kind: MediaKind }

// --- Room ---
export interface  JoinRoomRequest             { roomId: string, participantId: string }
export interface  JoinRoomResponse            { participants: Participant[] }
export interface  LeaveRoomRequest            { roomId: string, participantId: string }
export interface  ParticipantJoinedEvent      { participant: Participant }
export interface  ParticipantLeftEvent        { participantId: string }

// --- Router ---
export interface GetRtpCapabilitiesRequest   { roomId: string }
export interface RtpCapabilitiesResponse     { rtpCapabilities: RtpCapabilities }

// --- Transport ---
export interface CreateTransportRequest     { roomId: string }
export interface CreateTransportResponse    { transportId: string; iceParameters: IceParameters; iceCandidates: IceCandidates; dtlsParameters: DtlsParameters }
export interface ConnectTransportRequest    { roomId: string, transportId: string; dtlsParameters: DtlsParameters }
export interface ConnectTransportResponse   { transportId: string }

// --- Producer ---
export interface CreateProducerRequest      { roomId: string, transportId: string; participantId: string; kind: MediaKind; rtpParameters: RtpParameters }
export interface CreateProducerResponse     { producerId: string }
export interface NewProducerEvent           { producerId: string; participantId: string; kind: MediaKind }
export interface GetProducerListRequest     { roomId: string }
export interface ProducerListResponse       { producers: Producer[] }
export interface CloseProducersEvent        { producers: Producer[] }

// --- Consumer ---
export interface CreateConsumerRequest  { producerId: string; transportId: string; recvRtpCapabilities: RtpCapabilities }
export interface CreateConsumerResponse { consumerId: string; producerId: string; kind: MediaKind; rtpParameters: RtpParameters }
export interface ResumeConsumerRequest  { consumerId: string }