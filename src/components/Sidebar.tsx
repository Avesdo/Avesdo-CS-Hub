import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Activity,
  ListTodo,
  Briefcase,
  Settings,
  Shield,
  LogOut,
  LifeBuoy,
  X,
} from 'lucide-react';
import { Tooltip } from './ui/Tooltip';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { usePermissions } from '../hooks/usePermissions';
import { TruncatedText } from '../components/ui/TruncatedText';
import * as Popover from '@radix-ui/react-popover';
import { Button } from './ui/button';

export default function Sidebar() {
  const pendingAliasesCount = useAppStore((state) => state.pendingAliasesCount);
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const { hasAnySettingsPermission } = usePermissions();

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[var(--z-drawer-overlay)] md:hidden"
        aria-hidden="true"
      ></div>
      <aside
        id="mobile-sidebar"
        className="w-56 bg-white/70 backdrop-blur-xl text-sidebar-foreground flex flex-col z-[var(--z-drawer)] shrink-0 absolute md:relative h-full transition-all duration-200"
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
              { to: '/clients', icon: <Activity className="w-4 h-4" />, label: 'Clients' },
              { to: '/projects', icon: <ListTodo className="w-4 h-4" />, label: 'Projects' },
              { to: '/services', icon: <Briefcase className="w-4 h-4" />, label: 'Services' },
              { to: '/support', icon: <LifeBuoy className="w-4 h-4" />, label: 'Support' },
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

        {hasAnySettingsPermission() && (
          <div className="px-3 flex flex-col gap-1">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all w-full h-9 active:scale-95 ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-slate-700 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'} focus:outline-none focus:ring-2 focus:ring-primary/20`
              }
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
              {pendingAliasesCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full animate-in zoom-in">
                  {pendingAliasesCount}
                </span>
              )}
            </NavLink>
          </div>
        )}

        <div className="px-3 py-4 mt-auto shrink-0">
          <div className="flex items-center gap-3 p-2 w-full text-left rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={authUser?.photoURL || ''} alt={authUser?.displayName || 'User'} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                {getInitials(authUser?.displayName, authUser?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <TruncatedText
                text={authUser?.displayName || 'User'}
                containerClassName="font-medium text-sm"
              >
                {authUser?.displayName || 'User'}
              </TruncatedText>
            </div>
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-md shrink-0 md:opacity-0 group-hover:opacity-100">
                  <LogOut className="w-4 h-4" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  sideOffset={10}
                  side="top"
                  align="end"
                  className="z-[200] bg-white rounded-lg shadow-xl border border-slate-200/60 p-2 animate-in fade-in zoom-in-95 duration-200 relative flex items-center gap-3"
                >
                  <span className="text-sm font-medium text-slate-700 pl-1">Confirm Logout?</span>
                  <div className="flex items-center gap-1">
                    <Popover.Close asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </Button>
                    </Popover.Close>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={logout}
                      className="h-7 w-7 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border-none shadow-none"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Popover.Arrow className="fill-white" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        </div>
      </aside>
    </>
  );
}
