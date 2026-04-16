import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
        location.pathname === to
          ? 'bg-blue-100 text-blue-700'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {label}
    </Link>
  );

  const roleLinks = {
    ADMIN: [{ to: '/admin', label: 'Dashboard' }, { to: '/stores', label: 'Stores' }],
    USER: [{ to: '/stores', label: 'Browse Stores' }],
    STORE_OWNER: [{ to: '/owner', label: 'My Store' }]
  };

  const links = roleLinks[user?.role] || [];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <span className="font-bold text-slate-900 text-lg">RateStore</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {links.map(l => <span key={l.to}>{navLink(l.to, l.label)}</span>)}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {user?.name} <span className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">{user?.role}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* mobile menu button */}
          <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-3 pt-1 border-t border-slate-100 flex flex-col gap-1">
            {links.map(l => <span key={l.to}>{navLink(l.to, l.label)}</span>)}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-500">{user?.name} · {user?.role}</span>
              <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Logout</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
