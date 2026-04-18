import {UserService} from "@/service/user.service";
import {MediaExchangeService} from "@/service/media-exchange/media-exchange.service";
import {UserMediaService} from "@/service/user-media/user-media.service";
import {MediaTransmitterService} from "@/service/media-exchange/media-transmitter.service";
import {MediaReceiverService} from "@/service/media-exchange/media-receiver.service";
import {ParticipantService} from "@/service/room-participant/participant.service";
import {createMessagingSocket} from "@/infra/messaging/messaging-client";

export interface RoomService {
    join: () => Promise<void>;
    leave: () => Promise<void>;
}

export async function createRoomService(roomId: string): Promise<RoomService> {
    const socket = await createMessagingSocket();

    const userService = new UserService();
    const roomService = new ParticipantService(socket, userService);

    const userMediaService = new UserMediaService();
    const transmitterService = new MediaTransmitterService(socket, userService);
    const receiverService = new MediaReceiverService(socket);
    const mediaBroker = new MediaExchangeService(
        socket, transmitterService, receiverService, userMediaService
    );

    async function join() {
        await roomService.join(roomId);
        // await mediaBroker.open();
    }

    async function leave() {
        roomService.leave(roomId);
        mediaBroker.close();
    }

    return {join, leave};
}