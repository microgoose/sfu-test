/* @refresh reload */
import '@/view/assets/css/terminal.css';
import {render} from 'solid-js/web';
import {Route, Router} from "@solidjs/router";
import {RoomPage} from "@/view/pages/room-page";
import {NotFoundPage} from "@/view/pages/not-found-page";
import {CreateRoomPage} from "@/view/pages/create-room-page";

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
    );
}

render(() => (
    <Router>
        <Route path="/room/:roomId" component={RoomPage}/>
        <Route path="/create-room" component={CreateRoomPage}/>
        <Route path="/" component={CreateRoomPage}/>
        <Route path="*" component={NotFoundPage}/>
    </Router>
), root!);
