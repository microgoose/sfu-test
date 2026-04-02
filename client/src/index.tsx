/* @refresh reload */
import './assets/css/terminal.css';
import {render} from 'solid-js/web';
import {Route, Router} from "@solidjs/router";
import {NotFound} from "./pages/not-found";
import {Room} from "./pages/room";
import {Preview} from "./pages/preview";
import {Rooms} from "./pages/rooms";

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
    );
}

render(() => (
    <Router>
        <Route path="/" component={Rooms}/>
        <Route path="/rooms" component={Rooms}/>
        <Route path="/preview/:roomId" component={Preview}/>
        <Route path="/room/:roomId" component={Room}/>
        <Route path="*" component={NotFound}/>
    </Router>
), root!);
