import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { LayoutDashboard, Activity, ListTodo, Briefcase, Settings, Shield } from 'lucide-react';

export default function Sidebar() {
  const { user, pendingAliasesCount } = useAppState();
  const navigate = useNavigate();

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
        aria-hidden="true"
      ></div>
      <aside
        id="mobile-sidebar"
        className="w-56 lg:w-64 bg-sidebar text-sidebar-foreground border-r border-border flex flex-col z-40 shrink-0 absolute md:relative h-full shadow-2xl md:shadow-none transition-all duration-200"
      >
        {/* Brand Logo */}
        <div className="flex flex-col gap-2 p-0 shrink-0">
          <div className="px-3 pt-4 flex items-center">
            <NavLink
              to="/"
              className="cursor-pointer hover:opacity-80 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md block w-full text-left"
            >
              <img
                alt="Avesdo"
                className="h-[64px] w-auto px-3 py-4 object-contain"
                src="https://lh3.googleusercontent.com/d/1HgOfOymPbhh2hjSxeqiZmbe20o6uDlVk"
              />
            </NavLink>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto mt-0">
          <ul className="space-y-1 flex flex-col w-full">
            {[
              { to: '/', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
              { to: '/clients', icon: <Activity className="w-4 h-4" />, label: 'Client Health' },
              { to: '/projects', icon: <ListTodo className="w-4 h-4" />, label: 'Project Tracker' },
              { to: '/services', icon: <Briefcase className="w-4 h-4" />, label: 'Service Hub' },
            ].map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all w-full h-9 active:scale-95 ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-slate-700 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'} focus:outline-none focus:ring-2 focus:ring-primary/20`
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-3 flex flex-col gap-1">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all w-full h-9 active:scale-95 ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-slate-700 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'} focus:outline-none focus:ring-2 focus:ring-primary/20`
            }
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4" />
              <span>Admin Hub</span>
            </div>
            {pendingAliasesCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full animate-in zoom-in">
                {pendingAliasesCount}
              </span>
            )}
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all w-full h-9 active:scale-95 ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-slate-700 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'} focus:outline-none focus:ring-2 focus:ring-primary/20`
            }
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </NavLink>
        </div>

        <div className="px-3 py-4 mt-auto shrink-0">
          <div className="flex items-center gap-3 p-2 w-full text-left">
            <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs shrink-0">
              {user?.initials || 'CH'}
            </span>
            <div className="flex-1 text-left min-w-0">
              <div className="font-medium text-sm truncate">{user?.name || 'Loading...'}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email || ''}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
