import {CreateRoom} from "@/view/components/create-room";

export const CreateRoomPage = () => {
    return (
        <main class="page">
            <section class="terminal-shell">
                <header class="terminal-header">
                    <h1 class="terminal-title">New Room</h1>
                </header>
                <div class="terminal-body">
                    <CreateRoom/>
                </div>
            </section>
        </main>
    );
};