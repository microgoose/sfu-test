import {RoomMessenger} from "@/infra/messaging/room-messenger";
import {UserService} from "@/service/user.service";
import {addParticipant, clearParticipants, removeParticipant} from "@/service/room-participant/participants.store";

export class ParticipantService {
    private readonly roomMessenger: RoomMessenger;
    private readonly userService: UserService;

    constructor(roomMessenger: RoomMessenger, userService: UserService) {
        this.roomMessenger = roomMessenger;
        this.userService = userService;
    }

    async join() {
        console.debug('Add user to room');

        this.roomMessenger.onParticipantJoined((participant) => {
            console.debug(`Participant joined ${participant.id}`);
            addParticipant(participant);
        });

        this.roomMessenger.onParticipantLeft((participant) => {
            console.debug(`Participant left ${participant.participantId}`);
            removeParticipant(participant.participantId);
        });

        const user = this.userService.getUser();
        this.roomMessenger.join({ participantId: user.id });
    }

    leave() {
        console.debug('Remove user from room');

        clearParticipants();
        this.roomMessenger.onParticipantJoined(() => {});
        this.roomMessenger.onParticipantLeft(() => {});

        const user = this.userService.getUser();
        this.roomMessenger.leave({ participantId: user.id });
    }
}