import {RoomMessenger} from "@/infra/messaging/room-messenger";
import {SignalingMessenger} from "@/infra/messaging/signaling-messenger";
import {UserService} from "@/service/user.service";
import {setupMessagingClient} from "@/infra/messaging/messaging-client";
import {MediaExchangeService} from "@/service/media-exchange/media-exchange.service";
import {UserMediaService} from "@/service/user-media/user-media.service";
import {MediaTransmitterService} from "@/service/media-exchange/media-transmitter.service";
import {MediaReceiverService} from "@/service/media-exchange/media-receiver.service";
import {ParticipantService} from "@/service/room-participant/participant.service";

export interface RoomService {
    join: () => Promise<void>;
    leave: () => Promise<void>;
}

export async function createRoomService(roomId: string): Promise<RoomService> {
    const client = await setupMessagingClient();
    const roomMessenger = new RoomMessenger(client, roomId);
    const signalingMessenger = new SignalingMessenger(client, roomId);

    const userService = new UserService();
    const roomService = new ParticipantService(roomMessenger, userService);

    const userMediaService = new UserMediaService();
    const transmitterService = new MediaTransmitterService(signalingMessenger, userService);
    const receiverService = new MediaReceiverService(signalingMessenger);
    const mediaBroker = new MediaExchangeService(
        signalingMessenger, transmitterService, receiverService, userMediaService
    );

    async function join() {
        await Promise.all([
            roomService.join(),
            mediaBroker.open(),
        ]);
    }

    async function leave() {
        roomService?.leave();
        mediaBroker?.close();
    }

    return {join, leave};
}