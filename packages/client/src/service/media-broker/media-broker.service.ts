import {Device} from "mediasoup-client";
import {MediaTransmitterService} from "@/service/media-broker/media-transmitter.service";
import {MediaReceiverService} from "@/service/media-broker/media-receiver.service";
import {SignalingMessenger} from "@/infra/messaging/signaling-messenger";
import {getParticipantMedia, resetParticipantMedia, setParticipantMedia} from "@/service/participants.store";

export class MediaBrokerService {
    private readonly device = new Device();
    private readonly signalingMessenger;
    private readonly transmitterService;
    private readonly receiverService;

    private readonly producersTracks = new Map<string, MediaStreamTrack>();

    constructor(
        signalingMessenger: SignalingMessenger,
        transmitterService: MediaTransmitterService,
        receiverService: MediaReceiverService
    ) {
        this.signalingMessenger = signalingMessenger;
        this.receiverService = receiverService;
        this.transmitterService = transmitterService;
    }

    async open() {
        const routerRtpCapabilities = await this.signalingMessenger.getRtpCapabilities();
        await this.device.load({ routerRtpCapabilities });

        const sendTransportParams = await this.signalingMessenger.createTransport();
        const localTransportParams = await this.signalingMessenger.createTransport();

        this.transmitterService.create(this.device, {
            id: sendTransportParams.transportId,
            iceParameters: sendTransportParams.iceParameters,
            iceCandidates: sendTransportParams.iceCandidates,
            dtlsParameters: sendTransportParams.dtlsParameters,
        });

        this.receiverService.create(this.device, {
            id: localTransportParams.transportId,
            iceParameters: localTransportParams.iceParameters,
            iceCandidates: localTransportParams.iceCandidates,
            dtlsParameters: localTransportParams.dtlsParameters,
        });

        this.receiverService.onNewTrack((entry) => {
            console.log('New track', entry);
            let media = getParticipantMedia(entry.participantId);

            if (!media)
               media = new MediaStream([entry.track]);

            media.addTrack(entry.track);
            this.producersTracks.set(entry.producerId, entry.track);
            setParticipantMedia(entry.participantId, media);
        });

        this.receiverService.onRemoveTrack((entry) => {
            console.log('Remove track', entry.producerId);
            const media = getParticipantMedia(entry.participantId);

            if (media) {
                const track = this.producersTracks.get(entry.producerId);
                if (track)
                    media.removeTrack(track);

                if (media.getTracks().length === 0) {
                    resetParticipantMedia(entry.participantId);
                } else {
                    setParticipantMedia(entry.participantId, media);
                }
            }
        });
    }

    close(): void {
        this.transmitterService.close();
        this.receiverService.close();
    }
}