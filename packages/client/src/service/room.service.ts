import {UserService} from "@/service/user.service";
import {MediaExchangeService} from "@/service/media-exchange/media-exchange.service";
import {UserMediaService} from "@/service/user-media/user-media.service";
import {MediaTransmitterService} from "@/service/media-exchange/media-transmitter.service";
import {MediaReceiverService} from "@/service/media-exchange/media-receiver.service";
import {ParticipantService} from "@/service/room-participant/participant.service";
import {createMessagingSocket} from "@/infra/messaging/messaging-client";
import {ParticipantRepository} from "@/service/room-participant/participants.store";
import {createContext, useContext} from "solid-js";

export interface RoomService {
    join: () => void;
    leave: () => void;
}

export async function createRoomService(roomId: string): Promise<RoomService> {
    const socket = await createMessagingSocket();
    const participantRepository = new ParticipantRepository();

    const userService = new UserService();
    const roomService = new ParticipantService(socket, userService, participantRepository);

    const userMediaService = new UserMediaService();
    const transmitterService = new MediaTransmitterService(socket, userService);
    const receiverService = new MediaReceiverService(socket);
    const mediaBroker = new MediaExchangeService(
        socket, transmitterService,
        receiverService, userMediaService,
        participantRepository
    );

    function join() {
        roomService
            .join(roomId)
            .then(() => mediaBroker.open(roomId))
            .catch(console.error);
    }

    function leave() {
        roomService.leave(roomId);
        mediaBroker.close();
    }

    return {
        join,
        leave
    };
}

export const RoomContext = createContext<RoomService>();

export function useRoomService() {
    const ctx = useContext(RoomContext);
    if (!ctx) throw new Error("Room context not found");
    return ctx;
}