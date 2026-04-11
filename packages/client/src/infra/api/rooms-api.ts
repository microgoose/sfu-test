export async function getRoomList() {
    // todo
    const response = await fetch("http://localhost:8080/api/v1/room");
    return response.json();
}