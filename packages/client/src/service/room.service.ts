import {RoomMessenger} from "@/infra/messaging/room-messenger";
import {UserService} from "@/service/user.service";

export class RoomService {
    private readonly roomMessenger: RoomMessenger;
    private readonly userService: UserService;

    constructor(roomMessenger: RoomMessenger, userService: UserService) {
        this.roomMessenger = roomMessenger;
        this.userService = userService;
    }

    async join() {
        console.debug('Add user to room');
        const user = this.userService.getUser();
        this.roomMessenger.join({ participantId: user.id });
    }

    leave() {
        console.debug('Remove user from room');
        const user = this.userService.getUser();
        this.roomMessenger.leave({ participantId: user.id });
    }
}