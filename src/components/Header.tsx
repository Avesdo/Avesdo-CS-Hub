import React, { useState, useEffect } from 'react';
import GlobalSearch from './GlobalSearch';
import { Bell, Check, X } from 'lucide-react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../api/firebase';
import { AppNotification, markNotificationAsRead, markAllNotificationsAsRead } from '../utils/notificationUtils';

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
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllNotificationsAsRead(notifications)}
                  className="text-xs font-medium text-[#00bdd9] hover:text-[#009bc2] flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>
            
            <div className="max-h-[350px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-slate-500 text-sm">
                  No notifications yet
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!n.read ? 'bg-blue-50/30' : ''}`}
                      onClick={() => markNotificationAsRead(n.id)}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-[#00bdd9]' : 'bg-transparent'}`} />
                      <div>
                        <p className="text-sm text-slate-800">
                          <span className="font-semibold">{n.projectName}</span>{' '}
                          {n.type === 'submission' ? 'submitted' : 'updated'}{' '}
                          <span className="font-medium">{n.formName}</span>.
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Header() {
  return (
    <header
      className="w-full bg-white/90 backdrop-blur-md shrink-0 relative z-50"
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
