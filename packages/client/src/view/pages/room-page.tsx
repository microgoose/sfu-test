import '../assets/css/room.css';
import {useParams} from "@solidjs/router";
import {RoomCardList} from "@/view/components/room-card-list";
import {RoomService} from "@/service/room.service";
import {RoomMessenger} from "@/infra/messaging/room-messenger";
import {UserService} from "@/service/user.service";
import {setupMessagingClient} from "@/infra/messaging/messaging-client";
import {addParticipant, participantStore, removeParticipant} from "@/service/participants.store";
import {MediaBrokerService} from "@/service/media-broker/media-broker.service";
import {SignalingMessenger} from "@/infra/messaging/signaling-messenger";
import {MediaReceiverService} from "@/service/media-broker/media-receiver.service";
import {MediaTransmitterService} from "@/service/media-broker/media-transmitter.service";
import {UserMediaService} from "@/service/media-stream/user-media.service";

export const RoomPage = () => {
    const params = useParams<{ roomId: string }>();

    // TODO
    async function context() {
        const messagingClient = await setupMessagingClient('ws://localhost:15674/ws');
        const roomMessenger = new RoomMessenger(messagingClient, params.roomId);
        const signalingMessenger = new SignalingMessenger(messagingClient, params.roomId);

        const userService = new UserService();
        const roomService = new RoomService(roomMessenger, userService);

        const userMediaService = new UserMediaService();
        const transmitterService = new MediaTransmitterService(signalingMessenger, userService);
        const receiverService = new MediaReceiverService(signalingMessenger);
        const mediaBroker = new MediaBrokerService(signalingMessenger, transmitterService, receiverService);

        roomMessenger.onParticipantJoined((participant) => {
            console.debug(`Participant joined ${participant.id}`);
            addParticipant(participant);
        });

        roomMessenger.onParticipantLeft((participant) => {
            console.debug(`Participant left ${participant.participantId}`);
            removeParticipant(participant.participantId);
        });

        window.addEventListener('pagehide', () => {
            roomService.leave();
            mediaBroker.close();
        });

        const [audioTrack, videoTrack] = await Promise.all([
            userMediaService.requestAudio(),
            userMediaService.requestVideo(),
            roomService.join(),
            mediaBroker.open(),
        ]);

        await transmitterService.send(audioTrack);
        await transmitterService.send(videoTrack);
    }

    context();

    return (
        <main class="page">
            <section class="terminal-shell">
                <header class="terminal-header">
                    <h1 class="terminal-title">Room</h1>
                    <span class="terminal-subtitle">id={params.roomId}</span>
                </header>
                <div class="terminal-body">
                    <RoomCardList participants={participantStore.participants}/>
                </div>
            </section>
        </main>
    );
};
