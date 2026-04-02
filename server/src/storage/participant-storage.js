const map = new Map();

export function save(participant) {
    map.set(participant.id, participant);
    return participant;
}

export function remove(participant) {
    map.delete(participant.id);
}

export function findById(id) {
    return map.get(id);
}

export function findAll() {
    return Array.from(map.values());
}
