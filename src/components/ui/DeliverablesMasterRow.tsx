import React from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import { TruncatedText } from '../../components/ui/TruncatedText';

interface DeliverablesMasterRowProps {
  item: any;
  isCustom: boolean;
  isHidden: boolean;
  isSelected: boolean;
  isActive: boolean;
  readOnly: boolean;
  isClientPortal: boolean;
  searchQuery: string;
  onSelect: (itemId: string, e: React.MouseEvent) => void;
  onActivate: (itemId: string) => void;
  onToggleHide: (itemId: string, e: React.MouseEvent) => void;
}

export default function DeliverablesMasterRow({
  item,
  isCustom,
  isHidden,
  isSelected,
  isActive,
  readOnly,
  isClientPortal,
  searchQuery,
  onSelect,
  onActivate,
  onToggleHide,
}: DeliverablesMasterRowProps) {
  const itemData = useWatch({ name: item.id }) || {};

  const status = itemData.status || item.status || 'Pending';
  const priority = itemData.priority || item.priority || 'Normal';
  const taskName = itemData.taskName || item.taskName || 'Unnamed Item';

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    if (!taskName.toLowerCase().includes(q)) return null;
  }

  // Determine status dot color
  let dotColor = 'bg-slate-300';
  if (['Completed'].includes(status)) dotColor = 'bg-emerald-500';
  else if (['Draft Complete'].includes(status)) dotColor = 'bg-teal-500';
  else if (['In Progress'].includes(status)) dotColor = 'bg-blue-500';
  else if (['Provided', 'Received'].includes(status)) dotColor = 'bg-indigo-500';
  else if (['Question', 'Additional Pending', 'Pending'].includes(status))
    dotColor = 'bg-amber-500';
  else if (['Delayed'].includes(status)) dotColor = 'bg-rose-500';

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case 'Critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'High':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Low':
        return 'text-slate-400 bg-slate-50 border-slate-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div
      onClick={() => onActivate(item.id)}
      className={`group flex items-center gap-2.5 px-3 py-1.5 mx-1.5 rounded-lg cursor-pointer transition-all border outline-none ${
        isActive
          ? 'bg-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/10'
          : 'border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20'
      } ${isHidden ? 'opacity-40 grayscale' : ''}`}
    >
      {!readOnly && !isClientPortal && !isHidden && (
        <div className="relative group/cb flex items-center justify-center shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(item.id, e as any)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div
            className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-primary border-primary shadow-sm shadow-primary/20' : 'bg-white border-slate-300 group-hover/cb:border-primary/50'}`}
          >
            <Check
              className={`w-3 h-3 text-white transition-transform duration-200 ${isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
              strokeWidth={3}
            />
          </div>
        </div>
      )}
      <div
        className="shrink-0 w-2.5 h-2.5 rounded-full shadow-sm"
        style={{ backgroundColor: isActive ? 'transparent' : undefined }}
      >
        <div
          className={`w-full h-full rounded-full ${dotColor} ${isActive ? 'animate-pulse ring-2 ring-offset-1 ring-primary/50' : ''}`}
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <TruncatedText
          text={String('' + taskName + '')}
          containerClassName={`text-[13px] font-semibold ${isActive ? 'text-primary' : 'text-slate-700 group-hover:text-slate-900'}`}
        >
          {taskName}
        </TruncatedText>
        {!isHidden && status !== 'Completed' && (
          <div className="flex items-center">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(priority)}`}
            >
              {priority}
            </span>
          </div>
        )}
      </div>
      {!readOnly && !isClientPortal && !isCustom && (
        <button
          onClick={(e) => onToggleHide(item.id, e)}
          className={`p-1 shrink-0 rounded hover:bg-slate-200 transition-colors ${isHidden ? 'text-slate-500' : 'opacity-0 group-hover:opacity-100 text-slate-400'}`}
        >
          {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}
