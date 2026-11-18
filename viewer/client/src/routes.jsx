import BuildingBrowser from './features/buildings/BuildingBrowser';
import RoomBrowser from './features/rooms/RoomBrowser';
import BuildingRooms from './features/assignments/BuildingRooms';
import DatabaseViewer from './features/database/DatabaseViewer';

// Page registry: the router (main.jsx) and the nav bar both read this list.
// To add a page for a new feature, add one entry here.
export const pages = [
  { path: '/', label: 'Buildings', element: <BuildingBrowser /> },
  { path: '/rooms', label: 'Rooms', element: <RoomBrowser /> },
  { path: '/by-building', label: 'Rooms by Building', element: <BuildingRooms /> },
  { path: '/database', label: 'Database', element: <DatabaseViewer /> },
];
