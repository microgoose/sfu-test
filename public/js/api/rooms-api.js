export async function getRoomList() {
    const response = await fetch("/api/v1/room");
    return response.json();
}