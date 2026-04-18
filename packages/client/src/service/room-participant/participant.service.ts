import {UserService} from "@/service/user.service";
import {addParticipant, clearParticipants, removeParticipant} from "@/service/room-participant/participants.store";
import {MessagingSocket} from "@sfu-test/messaging";

export class ParticipantService {
    private readonly roomMessenger;
    private readonly userService;

    constructor(roomMessenger: MessagingSocket, userService: UserService) {
        this.roomMessenger = roomMessenger;
        this.userService = userService;
    }

    async join(roomId: string) {
        console.debug('Add user to room');

        this.roomMessenger.onParticipantJoined(({ body }) => {
            console.debug(`Participant joined ${body.participant.id}`);
            addParticipant(body.participant);
        });

        this.roomMessenger.onParticipantLeft(({ body }) => {
            console.debug(`Participant left ${body.participantId}`);
            removeParticipant(body.participantId);
        });

        const user = this.userService.getUser();
        await this.roomMessenger.joinRoom({ roomId, participantId: user.id });
    }

    leave(roomId: string) {
        console.debug('Remove user from room');

        clearParticipants();
        this.roomMessenger.onParticipantJoined(() => {});
        this.roomMessenger.onParticipantLeft(() => {});

        const user = this.userService.getUser();
        this.roomMessenger.leaveRoom({ roomId, participantId: user.id });
    }
}