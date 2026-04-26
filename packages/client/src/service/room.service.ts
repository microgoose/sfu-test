import {createUserService} from "@/service/user.service";
import {MediaExchangeService} from "@/service/media-exchange/media-exchange.service";
import {MediaSendService} from "@/service/media-exchange/media-send.service";
import {MediaReceiverService} from "@/service/media-exchange/media-receiver.service";
import {createParticipantService} from "@/service/room-participant/participant.service";
import {createMessagingSocket} from "@/infra/messaging/messaging-client";
import {ParticipantRepository} from "@/service/room-participant/participants.store";
import {createContext, useContext} from "solid-js";

export interface RoomService {
    join: () => void;
    leave: () => void;
}

export async function createRoomService(roomId: string): Promise<RoomService> {
    const userService = createUserService();
    const socket = await createMessagingSocket(userService);

    const participantRepository = new ParticipantRepository();
    const participantService = createParticipantService(socket, userService, participantRepository);

    const transmitterService = new MediaSendService(socket, userService);
    const receiverService = new MediaReceiverService(socket);
    const mediaBroker = new MediaExchangeService(
        socket, transmitterService,
        receiverService,
        participantRepository
    );

    async function join() {
        try {
            await participantService.join(roomId);
            await mediaBroker.open(roomId);
        } catch (ex) {
            console.error(ex);
        }
    }

    function leave() {
        participantService.leave(roomId);
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