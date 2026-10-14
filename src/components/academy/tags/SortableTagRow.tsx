import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy, Check, Edit2, Trash2 } from 'lucide-react';
import { Tooltip } from '../../ui/Tooltip';
import { TagItem } from '../../../types';

export interface SortableTagRowProps {
  item: TagItem;
  displayTag: string;
  canEditTags: boolean;
  canDeleteTags: boolean;
  handleCopy: (tag: string, id: string) => void;
  copiedId: string | null;
  setEditingTag: (tag: TagItem) => void;
  setIsTagModalOpen: (open: boolean) => void;
  handleDeleteTag: (id: string) => void;
}

export function SortableTagRow({
  item,
  displayTag,
  canEditTags,
  canDeleteTags,
  handleCopy,
  copiedId,
  setEditingTag,
  setIsTagModalOpen,
  handleDeleteTag,
}: SortableTagRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: isDragging ? ('relative' as const) : ('static' as const),
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-slate-50 transition-colors group ${isDragging ? 'bg-slate-50 shadow-md' : ''}`}
    >
      <td className="py-2 pr-4 pl-2 align-top">
        <div className="flex items-center gap-1">
          {canEditTags && (
            <button
              {...attributes}
              {...listeners}
              className="p-0.5 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 rounded flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center justify-start gap-2 flex-1 min-w-0">
            <span className="font-mono text-primary font-medium bg-primary/5 px-2 py-0.5 rounded break-all border border-primary/10">
              {displayTag}
            </span>
            <Tooltip content={copiedId === item.id ? 'Copied!' : 'Copy tag'}>
              <button
                onClick={() => handleCopy(displayTag, item.id)}
                className="p-1 shrink-0 rounded text-slate-400 hover:text-primary hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
              >
                {copiedId === item.id ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </Tooltip>
          </div>
        </div>
      </td>
      <td className="px-4 py-2 align-top text-slate-700 pr-4 leading-relaxed break-words">
        {item.description}
      </td>
      <td className="px-4 py-2 align-top text-slate-500 italic flex justify-between items-start gap-4 break-words">
        <span className="min-w-0 break-words">{item.example}</span>
        {(canEditTags || canDeleteTags) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {canEditTags && (
              <button
                onClick={() => {
                  setEditingTag(item);
                  setIsTagModalOpen(true);
                }}
                className="p-1 text-slate-400 hover:text-primary rounded hover:bg-slate-100"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {canDeleteTags && (
              <button
                onClick={() => handleDeleteTag(item.id)}
                className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
