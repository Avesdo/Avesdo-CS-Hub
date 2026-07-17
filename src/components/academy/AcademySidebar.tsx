import React from 'react';
import { GraduationCap } from 'lucide-react';
import { useAcademyStore } from '../../store/useAcademyStore';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

export interface AcademySidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AcademySidebar({ activeTab, setActiveTab }: AcademySidebarProps) {
  const activeQuizzes = useAcademyStore((state) => state.activeQuizzes);
  const quizAttempts = useAcademyStore((state) => state.quizAttempts);
  const { user: authUser } = useAuth();
  const { hasPermission } = usePermissions();
  const isAcademyAdmin = hasPermission('manage_academy');

  const hasNotificationDot = activeQuizzes.some((q) => {
    if (isAcademyAdmin && q.status === 'draft') return true;
    if (q.status === 'published') {
      const isEnrolled =
        !q.enrolledUserIds ||
        q.enrolledUserIds.length === 0 ||
        (authUser && q.enrolledUserIds.includes(authUser.uid));
      const hasCompleted =
        authUser && quizAttempts.some((a) => a.quizId === q.id && a.userId === authUser.uid);
      return isEnrolled && !hasCompleted;
    }
    return false;
  });

  const MENU_ITEMS: {
    id: string;
    label: string;
    icon: React.ElementType;
    disabled?: boolean;
    badge?: string;
  }[] = [{ id: 'knowledge-checks', label: 'Knowledge Checks', icon: GraduationCap }];

  return (
    <div className="w-full md:w-56 bg-white shrink-0 p-4 flex flex-col gap-6 overflow-y-auto custom-thin-scroll border-r border-slate-100">
      <div className="mt-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-5 px-2">Academy</h2>

        <div className="flex flex-col gap-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveTab(item.id)}
                disabled={item.disabled}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-50 text-primary shadow-sm border border-slate-200'
                    : item.disabled
                      ? 'text-slate-400 cursor-not-allowed opacity-70 border border-transparent'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent active:scale-95'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`}
                />
                <span className="truncate">{item.label}</span>
                {item.badge ? (
                  <span className="ml-auto bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    {item.badge}
                  </span>
                ) : (
                  item.id === 'knowledge-checks' &&
                  hasNotificationDot && (
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-sm ml-auto" />
                  )
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
