import {Transport, TransportOptions} from "mediasoup-client/types";
import {Device} from "mediasoup-client";
import {UserService} from "@/service/user.service";
import {MessagingSocket} from "@sfu-test/messaging";

export class MediaTransmitterService {
    private readonly signalingMessenger;
    private readonly userService;
    private sendTransport: Transport | null = null;

    constructor(signalingMessenger: MessagingSocket, userService: UserService) {
        this.signalingMessenger = signalingMessenger;
        this.userService = userService;
    }

    getTransport() {
        if (this.sendTransport)
            return this.sendTransport;
        throw new Error("Transport is not installed");
    }

    create(roomId: string, device: Device, options: TransportOptions) {
        console.debug("Create send transport");
        const transport = (this.sendTransport = device.createSendTransport(options));

        this.sendTransport.on("connect", ({dtlsParameters}, callback, errback) => {
            console.debug(`Connect send transport ${transport.id}`);
            this.signalingMessenger
                .connectTransport({roomId, transportId: transport.id, dtlsParameters})
                .then(callback)
                .catch(errback);
        });

        this.sendTransport.on("produce", ({kind, rtpParameters}, callback, errback) => {
            const user = this.userService.getUser();
            const request = {roomId, participantId: user.id, transportId: transport.id, kind, rtpParameters};
            this.signalingMessenger
                .createProducer(request)
                .then(({ body }) => {
                    console.debug(`Produce ${kind}, producer ${body.producerId}, transport ${transport.id}`);
                    callback({id: body.producerId})
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