import * as roomStorage from "../storage/room-storage.js";
import {Room} from "../model/room.js";

export function findById(id) {
  console.debug(`Find by id ${id}`);
  return roomStorage.findById(id);
}

export function findAll() {
  console.debug("Find all rooms");
  return roomStorage.findAll();
}

export function createRoom() {
  const room = roomStorage.save(new Room());
  console.debug(`Room created ${room.id}`);
}