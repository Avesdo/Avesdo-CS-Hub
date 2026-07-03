import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical, ChevronDown } from 'lucide-react';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/button';

export function SortableChecklistItem({ item, itemIdx, handleUpdateItem, handleRemoveItem }: any) {
  const [isEditingNote, setIsEditingNote] = React.useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start bg-white rounded-lg border transition-all group/item ${isDragging ? 'border-primary ring-2 ring-primary/20 shadow-lg opacity-80' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 hover:bg-slate-50 w-7 flex justify-center py-3 self-stretch rounded-l-lg transition-colors border-r border-slate-100 shrink-0"
      >
        <GripVertical className="w-[14px] h-[14px]" />
      </div>

      <div className="flex-1 p-3 flex gap-3">
        <div className="flex-1 space-y-2.5">
          <input
            type="text"
            value={item.taskName}
            onChange={(e) => handleUpdateItem(itemIdx, { taskName: e.target.value })}
            className="w-full text-[14px] font-semibold text-slate-800 outline-none bg-transparent placeholder:text-slate-400 placeholder:font-normal focus:ring-0"
            placeholder={`Deliverable ${itemIdx + 1}`}
          />
          {!item.defaultNote && !isEditingNote ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingNote(true)}
              className="text-[11px] h-auto p-0 hover:bg-transparent font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add note
            </Button>
          ) : (
            <input
              type="text"
              value={item.defaultNote || ''}
              onChange={(e) => handleUpdateItem(itemIdx, { defaultNote: e.target.value })}
              onBlur={() => {
                if (!item.defaultNote) setIsEditingNote(false);
              }}
              className="w-full text-[13px] text-slate-500 outline-none bg-transparent placeholder:text-slate-400 focus:ring-0"
              placeholder="Default note or instructions (optional)"
              autoFocus={isEditingNote}
            />
          )}
        </div>

        <div className="flex flex-col justify-between items-end shrink-0 pl-3 border-l border-slate-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveItem(itemIdx)}
            className="w-7 h-7 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/item:opacity-100"
            title="Delete deliverable"
          >
            <Trash2 className="w-[14px] h-[14px]" />
          </Button>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400">Priority</span>
            <Select
              value={item.defaultPriority || 'Normal'}
              onChange={(val) => handleUpdateItem(itemIdx, { defaultPriority: val })}
              options={['Low', 'Normal', 'High', 'Critical'].map((p) => ({ label: p, value: p }))}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[12px] bg-slate-50 flex items-center gap-1.5 shadow-sm font-semibold"
                >
                  {item.defaultPriority || 'Normal'}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
