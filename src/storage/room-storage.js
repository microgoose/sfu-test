import {randomUUID} from "node:crypto";

const map = new Map();

export function save(room) {
    const id = room.id ?? randomUUID();
    const saved = {
        ...room,
        id
    };

    map.set(id, saved);
    return saved;
}

export function findById(id) {
    return map.get(id);
}

export function findAll() {
    return Array.from(map.values());
}
