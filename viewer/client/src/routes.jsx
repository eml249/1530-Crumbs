import BuildingBrowser from './features/buildings/BuildingBrowser';
import DatabaseViewer from './features/database/DatabaseViewer';
import RoomsPage from './features/rooms/RoomsPage';

// Page registry: the router (main.jsx) and the nav bar both read this list.
// To add a page for a new feature, add one entry here.
export const pages = [
  { path: '/', label: 'Buildings', element: <BuildingBrowser /> },
  { path: '/database', label: 'Database', element: <DatabaseViewer /> },
  { path: '/rooms', label: 'Rooms', element: <RoomsPage /> },
];

// Inside client/src/routes.jsx
 // Match your naming convention inside features/rooms

// Add to your route array or <Routes> block:
