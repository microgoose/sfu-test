import {Transport, TransportOptions} from "mediasoup-client/types";
import {Device} from "mediasoup-client";
import {SignalingMessenger} from "@/infra/messaging/signaling-messenger";
import {UserService} from "@/service/user.service";

export class MediaTransmitterService {
    private readonly signalingMessenger;
    private readonly userService;
    private sendTransport: Transport | null = null;

    constructor(signalingMessenger: SignalingMessenger, userService: UserService) {
        console.debug("Create send transport");
        this.signalingMessenger = signalingMessenger;
        this.userService = userService;
    }

    getTransport() {
        if (this.sendTransport)
            return this.sendTransport;
        throw new Error("Transport is not installed");
    }

    create(device: Device, options: TransportOptions) {
        const transport = (this.sendTransport = device.createSendTransport(options));

        this.sendTransport.on("connect", ({dtlsParameters}, callback, errback) => {
            console.debug(`Connect send transport ${transport.id}`);
            this.signalingMessenger
                .connectTransport({transportId: transport.id, dtlsParameters})
                .then(callback)
                .catch(errback);
        });

        this.sendTransport.on("produce", ({kind, rtpParameters}, callback, errback) => {
            const user = this.userService.getUser();
            const request = {participantId: user.id, transportId: transport.id, kind, rtpParameters};
            this.signalingMessenger
                .createProducer(request)
                .then((response) => {
                    console.debug(`Produce ${kind}, producer ${response.producerId}, transport ${transport.id}`);
                    callback({id: response.producerId})
                })
                .catch(errback);
        });
    }

    send(track: MediaStreamTrack) {
        const transport = this.getTransport();
        console.debug(`Starting send ${track.kind}. Transport ${transport.id}`);
        return transport.produce({track});
    }

    close(): void {
        console.debug("Close send transport");
        this.sendTransport?.close();
        this.sendTransport = null;
    }
}