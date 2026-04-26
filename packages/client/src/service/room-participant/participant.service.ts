import {MessagingSocket} from "@sfu-test/messaging";
import {ParticipantRepository} from "@/service/room-participant/participants.store";
import {UserService} from "@/service/user.service";

export function createParticipantService(
    roomMessenger: MessagingSocket,
    userService: UserService,
    participantRepository: ParticipantRepository
) {
    async function join(roomId: string) {
        console.debug('Add user to room');

        roomMessenger.onParticipantJoined((event) => {
            console.debug(`Participant joined ${event.participant.id}`);
            participantRepository.addParticipant(event.participant);
        });

        roomMessenger.onParticipantLeft((event) => {
            console.debug(`Participant left ${event.participantId}`);
            participantRepository.removeParticipant(event.participantId);
        });

        const user = userService.getUser();
        const roomState = await roomMessenger.joinRoom({ roomId, participantId: user.id });
        participantRepository.setParticipants(roomState.participants);
    }

    function leave(roomId: string) {
        console.debug('Remove user from room');

        participantRepository.clearParticipants();
        roomMessenger.onParticipantJoined(async () => {});
        roomMessenger.onParticipantLeft(async () => {});

        const user = userService.getUser();
        roomMessenger.leaveRoom({ roomId, participantId: user.id });
    }

    return { join, leave };
}