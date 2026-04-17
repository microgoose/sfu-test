import {createRoom} from "@/infra/api/room.api";

export function CreateRoom() {
    async function onClick() {
        const room = await createRoom();
        window.location.href = `/room/${room.roomId}`;
    }

    return (
        <button class="terminal-button" onClick={onClick}>
            Create Room
        </button>
    );
}