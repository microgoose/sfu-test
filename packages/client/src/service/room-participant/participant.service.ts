import {UserService} from "@/service/user.service";
import {MessagingSocket} from "@sfu-test/messaging";
import {ParticipantRepository} from "@/service/room-participant/participants.store";

export class ParticipantService {
    private readonly roomMessenger;
    private readonly userService;
    private readonly participantStore;

    constructor(roomMessenger: MessagingSocket, userService: UserService, participantStore: ParticipantRepository) {
        this.roomMessenger = roomMessenger;
        this.userService = userService;
        this.participantStore = participantStore;
    }

    async join(roomId: string) {
        console.debug('Add user to room');

        this.roomMessenger.onParticipantJoined(async ({ body }) => {
            console.debug(`Participant joined ${body.participant.id}`);
            this.participantStore.addParticipant(body.participant);
        });

        this.roomMessenger.onParticipantLeft(async ({ body }) => {
            console.debug(`Participant left ${body.participantId}`);
            this.participantStore.removeParticipant(body.participantId);
        });

        const user = this.userService.getUser();
        await this.roomMessenger.joinRoom({ roomId, participantId: user.id });
    }

    leave(roomId: string) {
        console.debug('Remove user from room');

        this.participantStore.clearParticipants();
        this.roomMessenger.onParticipantJoined(async () => {});
        this.roomMessenger.onParticipantLeft(async () => {});

        const user = this.userService.getUser();
        this.roomMessenger.leaveRoom({ roomId, participantId: user.id });
    }
}