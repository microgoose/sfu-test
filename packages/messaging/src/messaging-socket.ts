import {destinations} from "./destinations.js";
import {MessagingExchanger} from "./messaging-exchanger.js";
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
    JoinRoomResponse,
    LeaveRoomRequest,
    NewProducerEvent,
    ParticipantJoinedEvent,
    ParticipantLeftEvent,
    ProducerListResponse,
    ResumeConsumerRequest,
    RtpCapabilitiesResponse
} from "./types.js";
import {RouteHandler} from "@/messaging-router.js";
import {ResponseMessage} from "@/model.js";

type BodyHandler<Req = unknown, Res = unknown> = (req: Req) => Res | Promise<Res>;

function toRouteHandler<Req, Res>(handler: BodyHandler<Req, Res>): RouteHandler {
    return async ({body}) => handler(body);
}

function extractBody<Res>(response: Promise<ResponseMessage>): Promise<Res> {
    return response.then(({body}) => body);
}

export class MessagingSocket {
    private exchanger: MessagingExchanger;

    constructor(exchanger: MessagingExchanger) {
        this.exchanger = exchanger;
    }

    joinRoom(payload: JoinRoomRequest): Promise<JoinRoomResponse> {
        return extractBody(this.exchanger.send(destinations.room.join, payload));
    }

    onJoinRoom(handler: BodyHandler<JoinRoomRequest, JoinRoomResponse>) {
        this.exchanger.on(destinations.room.join, toRouteHandler(handler));
    }

    leaveRoom(payload: LeaveRoomRequest): Promise<void> {
        return extractBody(this.exchanger.send(destinations.room.leave, payload));
    }

    onLeaveRoom(handler: BodyHandler<LeaveRoomRequest>) {
        this.exchanger.on(destinations.room.leave, toRouteHandler(handler));
    }

    publishParticipantJoined(payload: ParticipantJoinedEvent): Promise<void> {
        return extractBody(this.exchanger.send(destinations.room.participantJoined, payload));
    }

    onParticipantJoined(handler: BodyHandler<ParticipantJoinedEvent>) {
        this.exchanger.on(destinations.room.participantJoined, toRouteHandler(handler));
    }

    publishParticipantLeft(payload: ParticipantLeftEvent): Promise<void> {
        return extractBody(this.exchanger.send(destinations.room.participantLeft, payload));
    }

    onParticipantLeft(handler: BodyHandler<ParticipantLeftEvent>) {
        this.exchanger.on(destinations.room.participantLeft, toRouteHandler(handler));
    }

    getRouterRtpCapabilities(payload: GetRtpCapabilitiesRequest): Promise<RtpCapabilitiesResponse> {
        return extractBody(this.exchanger.send(destinations.router.rtpCapabilities, payload));
    }

    onGetRouterRtpCapabilities(handler: BodyHandler<GetRtpCapabilitiesRequest, RtpCapabilitiesResponse>) {
        this.exchanger.on(destinations.router.rtpCapabilities, toRouteHandler(handler));
    }

    createTransport(payload: CreateTransportRequest): Promise<CreateTransportResponse> {
        return extractBody(this.exchanger.send(destinations.transport.create, payload));
    }

    onCreateTransport(handler: BodyHandler<CreateTransportRequest, CreateTransportResponse>) {
        this.exchanger.on(destinations.transport.create, toRouteHandler(handler));
    }

    connectTransport(payload: ConnectTransportRequest): Promise<ConnectTransportResponse> {
        return extractBody(this.exchanger.send(destinations.transport.connect, payload));
    }

    onConnectTransport(handler: BodyHandler<ConnectTransportRequest, ConnectTransportResponse>) {
        this.exchanger.on(destinations.transport.connect, toRouteHandler(handler));
    }

    getProducersList(payload: GetProducerListRequest): Promise<ProducerListResponse> {
        return extractBody(this.exchanger.send(destinations.producer.list, payload));
    }

    onGetProducersList(handler: BodyHandler<GetProducerListRequest, ProducerListResponse>) {
        this.exchanger.on(destinations.producer.list, toRouteHandler(handler));
    }

    createProducer(payload: CreateProducerRequest): Promise<CreateProducerResponse> {
        return extractBody(this.exchanger.send(destinations.producer.create, payload));
    }

    onCreateProducer(handler: BodyHandler<CreateProducerRequest, CreateProducerResponse>) {
        this.exchanger.on(destinations.producer.create, toRouteHandler(handler));
    }

    publishNewProducer(payload: NewProducerEvent): Promise<void> {
        return extractBody(this.exchanger.send(destinations.producer.new, payload));
    }

    onNewProducer(handler: BodyHandler<NewProducerEvent>) {
        this.exchanger.on(destinations.producer.new, toRouteHandler(handler));
    }

    publishCloseProducers(payload: CloseProducersEvent): Promise<void> {
        return extractBody(this.exchanger.send(destinations.producer.close, payload));
    }

    onCloseProducers(handler: BodyHandler<CloseProducersEvent>) {
        this.exchanger.on(destinations.producer.close, toRouteHandler(handler));
    }

    createConsumer(payload: CreateConsumerRequest): Promise<CreateConsumerResponse> {
        return extractBody(this.exchanger.send(destinations.consumer.create, payload));
    }

    onCreateConsumer(handler: BodyHandler<CreateConsumerRequest, CreateConsumerResponse>) {
        this.exchanger.on(destinations.consumer.create, toRouteHandler(handler));
    }

    resumeConsumer(payload: ResumeConsumerRequest): Promise<void> {
        return extractBody(this.exchanger.send(destinations.consumer.resume, payload));
    }

    onResumeConsumer(handler: BodyHandler<ResumeConsumerRequest>) {
        this.exchanger.on(destinations.consumer.resume, toRouteHandler(handler));
    }
}