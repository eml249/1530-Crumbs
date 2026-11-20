import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import NavBar from './components/NavBar.jsx'
import AuthProvider from './features/auth/AuthProvider.jsx'
import { pages } from './routes.jsx'

// The viewer is read-only. Pages are listed in routes.jsx.
// AuthProvider tracks the (mock) Pitt sign-in used by pages like My Bookings.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <Routes>
          {pages.map((p) => (
            <Route key={p.path} path={p.path} element={p.element} />
          ))}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
