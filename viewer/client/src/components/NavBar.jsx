import { NavLink } from 'react-router-dom';
import { pages } from '../routes';
import './NavBar.css';

export default function NavBar() {
  return (
    <nav className="nav">
      {pages.map((p) => (
        <NavLink key={p.path} to={p.path} end={p.path === '/'}>
          {p.label}
        </NavLink>
      ))}
    </nav>
  );
}
