import React, { useState, useEffect } from 'react';
import GlobalSearch from './GlobalSearch';
import { Bell, Check, X, Trash2 } from 'lucide-react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../api/firebase';
import { AppNotification, markNotificationAsRead, markAllNotificationsAsRead, clearAllNotifications } from '../utils/notificationUtils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { useUI } from '../context/UIContext';

function NotificationBell() {
  const { openDrawer } = useUI();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[];
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative group bg-white hover:bg-slate-50 border-slate-200/60 text-slate-500 hover:text-primary hover:border-primary/20 shadow-sm transition-all duration-300 rounded-full h-10 w-10"
        >
          <Bell className="w-[1.15rem] h-[1.15rem] transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1.5 -right-1.5 flex h-[22px] min-w-[22px] px-1.5 items-center justify-center text-xs font-black animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.85)] border-2 border-white rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[324px] p-0 bg-white/95 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 bg-slate-50/50">
          <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button 
                variant="link" 
                className="h-auto p-0 text-xs text-primary"
                onClick={() => markAllNotificationsAsRead(notifications)}
              >
                <Check className="w-3 h-3 mr-1" /> Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="link" 
                className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => clearAllNotifications(notifications)}
              >
                <Trash2 className="w-3 h-3 mr-1" /> Clear all
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-[350px] overflow-y-auto custom-thin-scroll">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">You're all caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No new notifications at this time.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`group relative px-4 py-3 hover:bg-primary/5 transition-colors cursor-pointer flex items-start gap-3 ${!n.read ? 'bg-primary/[0.03]' : ''}`}
                  onClick={() => {
                    markNotificationAsRead(n.id);
                    if (n.projectId) {
                      openDrawer('project', n.projectId);
                      setIsOpen(false);
                    }
                  }}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 shadow-sm ${!n.read ? 'bg-primary shadow-primary/40' : 'bg-transparent shadow-none'}`} />
                  <div className="flex-1 pr-6">
                    <p className="text-sm text-foreground leading-tight">
                      <span className="font-semibold">{n.projectName}</span>{' '}
                      {n.type === 'submission' ? 'submitted' : 'updated'}{' '}
                      <span className="font-medium">{n.formName}</span>.
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">
                      {format(new Date(n.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {!n.read && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); markNotificationAsRead(n.id); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-primary/10 text-primary transition-all"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function Header() {
  return (
    <header
      className="w-full bg-background/90 backdrop-blur-md shrink-0 relative z-50"
      id="global-header-bar"
    >
      <div className="h-[60px] flex items-center px-4 md:px-6 gap-2 md:gap-4">
        <GlobalSearch />
        <div className="flex-1"></div>
        <NotificationBell />
      </div>
    </header>
  );
}
