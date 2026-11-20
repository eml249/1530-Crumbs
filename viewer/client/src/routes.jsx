import BuildingBrowser from './features/buildings/BuildingBrowser';
import RoomBrowser from './features/rooms/RoomBrowser';
import BuildingRooms from './features/assignments/BuildingRooms';
import DatabaseViewer from './features/database/DatabaseViewer';
//import RoomsPage from './features/rooms/RoomsPage';
import MyBookings from './features/bookings/MyBookings';
import SignInPage from './features/auth/SignInPage';
import RequireAuth from './features/auth/RequireAuth';

// Page registry: the router (main.jsx) and the nav bar both read this list.
// To add a page for a new feature, add one entry here. Wrap the element in
// <RequireAuth> to make the page sign-in only; `hideInNav: true` leaves it out of the nav bar.
export const pages = [
  { path: '/', label: 'Buildings', element: <BuildingBrowser /> },
  { path: '/rooms', label: 'Rooms', element: <RoomBrowser /> },
  { path: '/by-building', label: 'Rooms by Building', element: <BuildingRooms /> },
  { path: '/database', label: 'Database', element: <DatabaseViewer /> },
  {
    path: '/bookings',
    label: 'My Bookings',
    element: (
      <RequireAuth>
        <MyBookings />
      </RequireAuth>
    ),
  },
  { path: '/sign-in', label: 'Sign in', element: <SignInPage />, hideInNav: true },
];

// Inside client/src/routes.jsx
 // Match your naming convention inside features/rooms

// Add to your route array or <Routes> block:
