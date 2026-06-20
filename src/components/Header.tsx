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

function NotificationBell() {
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
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 flex h-4 w-4 p-0 items-center justify-center text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
          <h3 className="font-semibold text-foreground">Notifications</h3>
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
        
        <div className="max-h-[350px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-muted-foreground text-sm">
              No notifications yet
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3 ${!n.read ? 'bg-primary/5' : ''}`}
                  onClick={() => markNotificationAsRead(n.id)}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{n.projectName}</span>{' '}
                      {n.type === 'submission' ? 'submitted' : 'updated'}{' '}
                      <span className="font-medium">{n.formName}</span>.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(n.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
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
