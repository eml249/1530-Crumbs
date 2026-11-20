import { NavLink } from 'react-router-dom';
import { pages } from '../routes';
import AccountStatus from '../features/auth/AccountStatus';
import './NavBar.css';

export default function NavBar() {
  return (
    <nav className="nav">
      {pages
        .filter((p) => !p.hideInNav)
        .map((p) => (
          <NavLink key={p.path} to={p.path} end={p.path === '/'}>
            {p.label}
          </NavLink>
        ))}
      <AccountStatus />
    </nav>
  );
}