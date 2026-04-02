import {A} from "@solidjs/router";

interface RoomCardProps {
    id: string | number;
}

export const RoomCard = (props: RoomCardProps) => {
    return (
        <article class="terminal-card">
            <h3 class="terminal-card-title">Room {props.id}</h3>
            <div class="terminal-card-actions">
                <A class="terminal-button" href={`/preview/${props.id}`}>
                    Join
                </A>
            </div>
        </article>
    );
};