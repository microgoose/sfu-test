export async function createRoom() {
    // todo
    const response = await fetch("http://localhost:8080/api/v1/room/create", {
        method: "POST"
    });
    return response.json();
}

export async function getRoomList() {
    // todo
    const response = await fetch("http://localhost:8080/api/v1/room");
    return response.json();
}