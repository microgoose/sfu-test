import {getRoomList} from "../../js/api/rooms-api.js";
import {renderRooms} from "../../js/render/rooms-renderers.js";

const roomsListEl = document.getElementById("rooms-list");

function updateRoomList() {
    getRoomList()
        .then((rooms) => renderRooms(roomsListEl, rooms));
}

async function start() {
    updateRoomList();
}

start();