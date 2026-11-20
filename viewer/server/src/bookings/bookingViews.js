// Turns stored (or mock) bookings into what the My Bookings page shows: the time,
// plus where it is, looked up from the rooms and buildings collections.
//
// A booking points at its room by ObjectId (booking.room === room._id), and a room
// points at its building by name (room.inBuilding === building.buildName), the
// same name-based link the rest of the viewer uses.
//
// -> [{
//      _id, start, end, status, dataSource,
//      room:     { _id, roomName, roomNum, capacity } | null   (null: room no longer exists)
//      building: { name, address, classification } | null      (address null: building not found)
//    }]   soonest first
function toBookingViews(bookings, rooms, buildings) {
  const roomsById = new Map(rooms.map((r) => [String(r._id), r]));
  const buildingsByName = new Map(buildings.map((b) => [b.buildName, b]));

  return bookings
    .map((booking) => {
      const room = booking.room != null ? roomsById.get(String(booking.room)) : undefined;
      const building = room ? buildingsByName.get(room.inBuilding) : undefined;
      return {
        _id: String(booking._id),
        start: booking.start ?? null,
        end: booking.end ?? null,
        status: booking.status || 'active',
        dataSource: booking.dataSource,
        room: room
          ? { _id: String(room._id), roomName: room.roomName, roomNum: room.roomNum, capacity: room.capacity }
          : null,
        building: room
          ? { name: room.inBuilding, address: building?.address ?? null, classification: building?.classification ?? null }
          : null,
      };
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start) || 0);
}

module.exports = { toBookingViews };
