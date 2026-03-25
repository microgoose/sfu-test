const map = new Map();

export function save(room) {
    map.set(room.id, room);
    return room;
}

export function findById(id) {
    return map.get(id);
}

export function findByParticipantId(participantId) {
    const rooms = Array.from(map.values());

    return rooms.find(room => {
        if (room.hasParticipant(participantId))
            return room;
        return null;
    });
}

export function findAll() {
    return Array.from(map.values());
}
