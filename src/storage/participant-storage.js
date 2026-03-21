import {randomUUID} from "node:crypto";

const map = new Map();

export function save(participant) {
    const id = participant.id ?? randomUUID();
    const saved = {
        ...participant,
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
