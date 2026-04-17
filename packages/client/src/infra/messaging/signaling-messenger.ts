import {
    CloseProducerEvent,
    ConnectTransportPayload,
    CreateConsumerPayload,
    CreateProducerPayload,
    MessageHandler,
    MessagingApi,
    NewProducerEvent,
    ResumeConsumerPayload
} from "@sfu-test/messaging";

export class SignalingMessenger {
    private readonly roomId;
    private readonly client;

    constructor(client: MessagingApi, roomId: string) {
        this.roomId = roomId;
        this.client = client;
    }

    getRtpCapabilities() {
        return this.client.router.getRtpCapabilities(this.roomId);
    }

    createTransport() {
        return this.client.transport.create(this.roomId);
    }

    connectTransport(payload: ConnectTransportPayload) {
        return this.client.transport.connect(this.roomId, payload);
    }

    createProducer(payload: CreateProducerPayload) {
        return this.client.producer.create(this.roomId, payload);
    }

    getProducersList() {
        return this.client.producer.getList(this.roomId);
    }

    onNewProducer(handler: MessageHandler<NewProducerEvent>) {
        return this.client.producer.onNew(this.roomId, handler);
    }

    onProducersClose(handler: MessageHandler<CloseProducerEvent>) {
        return this.client.producer.onClose(this.roomId, handler);
    }

    createConsumer(payload: CreateConsumerPayload) {
        return this.client.consumer.create(this.roomId, payload);
    }

    resumeConsumer(payload: ResumeConsumerPayload) {
        return this.client.consumer.resume(this.roomId, payload);
    }
}