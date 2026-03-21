export function renderRooms(roomsListEl, rooms) {
  if (!rooms.length) {
    roomsListEl.innerHTML = '<div class="terminal-empty">No rooms found.</div>';
    return;
  }

  roomsListEl.innerHTML = rooms
    .map(
      (room) => `
        <article class="terminal-card">
            <h3 class="terminal-card-title">Room ${room.id}</h3>
            <div class="terminal-card-actions">
                <a class="terminal-button" href="/preview?id=${room.id}">Join</a>
            </div>
        </article>
    `,
    )
    .join("");
}
