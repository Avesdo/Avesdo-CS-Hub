import React from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function RoleSimulatorBanner() {
  const { simulatedRoleId, setSimulatedRoleId, settings } = useAppStore();

  if (!simulatedRoleId) return null;

  const role = settings?.roles?.find((r: any) => r.id === simulatedRoleId);
  const roleName = role ? role.name : 'Unknown Role';

  return (
    <div className="w-full bg-amber-400 text-amber-950 px-4 py-2 flex items-center justify-between sticky top-0 z-[100] shadow-md animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-5 h-5" />
        <span className="font-bold text-sm">Preview Mode Active:</span>
        <span className="text-sm">
          Viewing as <strong>{roleName}</strong>
        </span>
      </div>
      <button
        onClick={() => setSimulatedRoleId(null)}
        className="flex items-center gap-1 bg-amber-900/10 hover:bg-amber-900/20 px-3 py-1.5 rounded-md text-sm font-bold transition-colors"
      >
        <X className="w-4 h-4" />
        Exit Preview
      </button>
    </div>
  );
}
