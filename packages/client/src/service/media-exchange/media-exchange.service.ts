import {Device} from "mediasoup-client";
import {MediaTransmitterService} from "@/service/media-exchange/media-transmitter.service";
import {MediaReceiverService, NewTrackEvent, RemoveTrackEvent} from "@/service/media-exchange/media-receiver.service";
import {UserMediaService} from "@/service/user-media/user-media.service";
import {MessagingSocket} from "@sfu-test/messaging";
import {ParticipantRepository} from "@/service/room-participant/participants.store";

export class MediaExchangeService {
    private readonly device = new Device();
    private readonly signalingMessenger;
    private readonly transmitterService;
    private readonly receiverService;
    private readonly userMediaService;
    private readonly participantStore;

    constructor(
        signalingMessenger: MessagingSocket,
        transmitterService: MediaTransmitterService,
        receiverService: MediaReceiverService,
        userMediaService: UserMediaService,
        participantStore: ParticipantRepository,
    ) {
        this.signalingMessenger = signalingMessenger;
        this.receiverService = receiverService;
        this.transmitterService = transmitterService;
        this.userMediaService = userMediaService;
        this.participantStore = participantStore;
    }

    async open(roomId: string) {
        console.debug("Open media exchange");
        const {body} = await this.signalingMessenger.getRouterRtpCapabilities({ roomId });
        await this.device.load({routerRtpCapabilities: body.rtpCapabilities});

        const {body: sendTransportParams} = await this.signalingMessenger.createTransport({ roomId });
        const {body: localTransportParams} = await this.signalingMessenger.createTransport({ roomId });

        this.transmitterService.create(roomId, this.device, {
            id: sendTransportParams.transportId,
            iceParameters: sendTransportParams.iceParameters,
            iceCandidates: sendTransportParams.iceCandidates,
            dtlsParameters: sendTransportParams.dtlsParameters,
        });

        this.receiverService.create(roomId, this.device, {
            id: localTransportParams.transportId,
            iceParameters: localTransportParams.iceParameters,
            iceCandidates: localTransportParams.iceCandidates,
            dtlsParameters: localTransportParams.dtlsParameters,
        });

        this.receiverService.onNewTrack((event) => this.handleNewTrack(event));
        this.receiverService.onRemoveTrack((event) => this.handleRemoveTrack(event));

        const [audioTrack, videoTrack] = await Promise.all([
            this.userMediaService.requestAudio(),
            this.userMediaService.requestVideo(),
        ]);

        // TODO video optional
        await this.transmitterService.send(audioTrack);
        await this.transmitterService.send(videoTrack);
    }

    close(): void {
        console.debug("Close media exchange");
        this.receiverService.onNewTrack(() => {});
        this.receiverService.onRemoveTrack(() => {});
        this.transmitterService.close();
        this.receiverService.close();
    }

    private handleNewTrack(event: NewTrackEvent) {
        console.log('New track', event);
        this.participantStore.setTrack(event.participantId, event.track);
    }

    private handleRemoveTrack(event: RemoveTrackEvent) {
        console.log('Remove track', event.producerId);
        this.participantStore.resetTrack(event.participantId, event.kind);
    }
}