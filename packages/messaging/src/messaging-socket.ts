import {destinations} from "./destinations.js";
import {MessagingExchanger} from "./messaging-exchanger.js";
import {RouteHandler} from "./messaging-router.js";
import {
    CloseProducersEvent,
    ConnectTransportRequest,
    ConnectTransportResponse,
    CreateConsumerRequest,
    CreateConsumerResponse,
    CreateProducerRequest,
    CreateProducerResponse,
    CreateTransportRequest,
    CreateTransportResponse,
    GetProducerListRequest,
    GetRtpCapabilitiesRequest,
    JoinRoomRequest,
    LeaveRoomRequest,
    NewProducerEvent,
    ParticipantJoinedEvent,
    ParticipantLeftEvent,
    ProducerListResponse,
    ResumeConsumerRequest,
    RtpCapabilitiesResponse
} from "./types.js";

export class MessagingSocket {
    private exchanger: MessagingExchanger;

    constructor(exchanger: MessagingExchanger) {
        this.exchanger = exchanger;
    }

    joinRoom(payload: JoinRoomRequest) {
        return this.exchanger.send(destinations.room.join, payload);
    }

    onJoinRoom(handler: RouteHandler<JoinRoomRequest>) {
        this.exchanger.on(destinations.room.join, handler);
    }

    leaveRoom(payload: LeaveRoomRequest) {
        return this.exchanger.send(destinations.room.leave, payload);
    }

    onLeaveRoom(handler: RouteHandler<LeaveRoomRequest>) {
        this.exchanger.on(destinations.room.leave, handler);
    }

    publishParticipantJoined(payload: ParticipantJoinedEvent) {
        return this.exchanger.send(destinations.room.participantJoined, payload);
    }

    onParticipantJoined(handler: RouteHandler<ParticipantJoinedEvent>) {
        this.exchanger.on(destinations.room.participantJoined, handler);
    }

    publishParticipantLeft(payload: ParticipantLeftEvent) {
        return this.exchanger.send(destinations.room.participantLeft, payload);
    }

    onParticipantLeft(handler: RouteHandler<ParticipantLeftEvent>) {
        this.exchanger.on(destinations.room.participantLeft, handler);
    }

    getRouterRtpCapabilities(payload: GetRtpCapabilitiesRequest) {
        return this.exchanger.send(destinations.router.rtpCapabilities, payload);
    }

    onGetRouterRtpCapabilities(handler: RouteHandler<GetRtpCapabilitiesRequest, RtpCapabilitiesResponse>) {
        this.exchanger.on(destinations.router.rtpCapabilities, handler);
    }

    createTransport(payload: CreateTransportRequest) {
        return this.exchanger.send(destinations.transport.create, payload);
    }

    onCreateTransport(handler: RouteHandler<CreateTransportRequest, CreateTransportResponse>) {
        this.exchanger.on(destinations.transport.create, handler);
    }

    connectTransport(payload: ConnectTransportRequest) {
        return this.exchanger.send(destinations.transport.connect, payload);
    }

    onConnectTransport(handler: RouteHandler<ConnectTransportRequest, ConnectTransportResponse>) {
        this.exchanger.on(destinations.transport.connect, handler);
    }

    getProducersList(payload: GetProducerListRequest) {
        return this.exchanger.send(destinations.producer.list, payload);
    }

    onGetProducersList(handler: RouteHandler<GetProducerListRequest, ProducerListResponse>) {
        this.exchanger.on(destinations.producer.list, handler);
    }

    createProducer(payload: CreateProducerRequest) {
        return this.exchanger.send(destinations.producer.create, payload);
    }

    onCreateProducer(handler: RouteHandler<CreateProducerRequest, CreateProducerResponse>) {
        this.exchanger.on(destinations.producer.create, handler);
    }

    publishNewProducer(payload: NewProducerEvent) {
        return this.exchanger.send(destinations.producer.new, payload);
    }

    onNewProducer(handler: RouteHandler<NewProducerEvent>) {
        this.exchanger.on(destinations.producer.new, handler);
    }

    publishCloseProducers(payload: CloseProducersEvent) {
        return this.exchanger.send(destinations.producer.close, payload);
    }

    onCloseProducers(handler: RouteHandler<CloseProducersEvent>) {
        this.exchanger.on(destinations.producer.close, handler);
    }

    createConsumer(payload: CreateConsumerRequest) {
        return this.exchanger.send(destinations.consumer.create, payload);
    }

    onCreateConsumer(handler: RouteHandler<CreateConsumerRequest, CreateConsumerResponse>) {
        this.exchanger.on(destinations.consumer.create, handler);
    }

    resumeConsumer(payload: ResumeConsumerRequest) {
        return this.exchanger.send(destinations.consumer.resume, payload);
    }

    onResumeConsumer(handler: RouteHandler<ResumeConsumerRequest>) {
        this.exchanger.on(destinations.consumer.resume, handler);
    }
}