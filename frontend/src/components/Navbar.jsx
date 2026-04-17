import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  Store,
  LayoutDashboard,
  User,
  Layers,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // ─── Read initial theme from localStorage (App.js already applied the class) ─
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") !== "light",
  );

  // ─── Keep <html> class and localStorage in sync whenever isDark changes ───────
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleLinks = {
    ADMIN: [
      { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
      { to: "/stores", label: "Stores", icon: <Store size={16} /> },
    ],
    USER: [
      { to: "/stores", label: "Browse Stores", icon: <Layers size={16} /> },
    ],
    STORE_OWNER: [
      { to: "/owner", label: "My Store", icon: <Store size={16} /> },
    ],
  };

  const links = roleLinks[user?.role] || [];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <span className="text-white font-black italic">R</span>
              </div>
              <span className="font-black text-slate-900 dark:text-white text-xl tracking-tighter italic uppercase">
                Rate<span className="text-blue-500">Store</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    location.pathname === link.to
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:scale-110 active:scale-95 transition-all"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10 mx-2" />

            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  {user?.name}
                </p>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest opacity-80">
                  {user?.role}
                </span>
              </div>
              <div className="w-9 h-9 bg-slate-200 dark:bg-white/10 rounded-full flex items-center justify-center border border-slate-300 dark:border-white/10">
                <User size={18} className="text-slate-600 dark:text-gray-400" />
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all group"
              title="Logout"
            >
              <LogOut
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed inset-y-0 right-0 w-72 bg-white dark:bg-[#0d0d0d] shadow-2xl z-50 p-6 md:hidden border-l border-slate-200 dark:border-white/5"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-10">
                <span className="font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                  Menu
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 text-slate-400 dark:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                      location.pathname === link.to
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                    <User
                      size={20}
                      className="text-slate-400 dark:text-gray-500"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-blue-500 font-bold tracking-widest uppercase">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/10 text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  <LogOut size={16} />
                  Terminate Session
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 bottom-0 h-[1px] w-24 overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
      </div>
    </nav>
  );
};

export default Navbar;
