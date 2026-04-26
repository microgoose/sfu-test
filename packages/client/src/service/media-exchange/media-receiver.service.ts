import {Consumer, MediaKind, RtpCapabilities, Transport, TransportOptions} from "mediasoup-client/types";
import {Device} from "mediasoup-client";
import {CloseProducersEvent, MessagingSocket, NewProducerEvent, ProducerListResponse} from "@sfu-test/messaging";
import {ParticipantMediaTrack} from "@/service/room-participant/participants.store";

export type NewTrackEvent = {participantId: string; producerId: string; kind: MediaKind; track: MediaStreamTrack};
export type NewTrackHandler = (event: NewTrackEvent) => void;
export type RemoveTrackEvent = {participantId: string; producerId: string; kind: MediaKind;};
export type RemoveTrackHandler = (event: RemoveTrackEvent) => void;

export class MediaReceiverService {
    private readonly signalingMessenger;
    private recvTransport: Transport | null = null;
    private recvRtpCapabilities: RtpCapabilities | null = null;

    private readonly consumersByProducerId = new Map<string, Consumer>();

    private newTrackHandler: NewTrackHandler = () => {};
    private removeTrackHandler: RemoveTrackHandler = () => {};

    constructor(signalingMessenger: MessagingSocket) {
        this.signalingMessenger = signalingMessenger;
    }

    create(roomId: string, device: Device, options: TransportOptions) {
        console.debug("Create recv transport");
        this.recvRtpCapabilities = device.recvRtpCapabilities;
        this.recvTransport = device.createRecvTransport(options);

        this.recvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
            const transport = this.getTransport();
            console.debug(`Connect recv transport ${transport.id}`);
            this.signalingMessenger
                .connectTransport({ roomId, transportId: transport.id, dtlsParameters })
                .then(callback)
                .catch(errback);
        });

        this.signalingMessenger
            .getProducersList({ roomId })
            .then(({body}) => this.handleNewProducers(body));
        this.signalingMessenger
            .onNewProducer(({body}) => this.handleNewProducer(body));
        this.signalingMessenger
            .onCloseProducers(async ({body}) => this.handleRemoveProducers(body));
    }

    close() {
        console.debug("Close recv transport");

        for (const consumer of this.consumersByProducerId.values()) {
            consumer.close();
        }

        this.consumersByProducerId.clear();
        this.recvTransport?.close();
        this.recvTransport = null;
    }

    onNewTrack(handler: NewTrackHandler) {
        this.newTrackHandler = handler;
    }

    onRemoveTrack(handler: RemoveTrackHandler) {
        this.removeTrackHandler = handler;
    }

    private getTransport() {
        if (this.recvTransport)
            return this.recvTransport;
        throw new Error("Transport is not installed");
    }

    private getRecvRtpCapabilities() {
        if (this.recvRtpCapabilities)
            return this.recvRtpCapabilities;
        throw new Error("RTP capabilities is not initialized");
    }

    private async handleNewProducers(response: ProducerListResponse) {
        console.debug(`Consuming a new producers`);
        response.producers.forEach((p) => {
            this.handleNewProducer(p).catch(console.error);
        });
    }

    private async handleNewProducer({participantId, producerId, kind}: NewProducerEvent) {
        console.debug(`Consuming ${kind}, producer ${producerId}`);
        if (this.consumersByProducerId.has(producerId)) return;
        const transport = this.getTransport();
        const recvRtpCapabilities = this.getRecvRtpCapabilities();

        const {body: consumerParams} = await this.signalingMessenger.createConsumer({
            transportId: transport.id,
            producerId,
            recvRtpCapabilities,
        });

        const consumer = await transport.consume({
            id: consumerParams.consumerId,
            producerId,
            kind,
            rtpParameters: consumerParams.rtpParameters,
        });

        this.consumersByProducerId.set(producerId, consumer);
        const entry: ParticipantMediaTrack = { participantId, producerId, kind, track: consumer.track };
        this.newTrackHandler(entry);
        this.signalingMessenger.resumeConsumer({ consumerId: consumer.id });
    }

    private handleRemoveProducers(event: CloseProducersEvent) {
        for (const producer of event.producers) {
            const consumer = this.consumersByProducerId.get(producer.producerId);
            if (!consumer) continue;

            console.debug(`Remove producer, producer ${producer.producerId}`);

            consumer.close();
            this.consumersByProducerId.delete(producer.producerId);
            this.removeTrackHandler({
                producerId: producer.producerId,
                kind: producer.kind,
                participantId: producer.participantId,
            });
        }
    }
}