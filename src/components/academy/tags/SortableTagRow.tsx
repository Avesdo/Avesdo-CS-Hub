import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy, Check, Edit2, Trash2, Ban, AlertTriangle } from 'lucide-react';
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
  handleToggleUnavailable?: (item: TagItem) => void;
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
  handleToggleUnavailable,
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

  const isUnavailable = Boolean(item.isUnavailable);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`transition-colors group ${
        isUnavailable ? 'bg-red-50/20 hover:bg-red-50/40' : 'hover:bg-slate-50'
      } ${isDragging ? 'bg-slate-50 shadow-md' : ''}`}
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
          <div className="flex items-center justify-start gap-2 flex-1 min-w-0 flex-wrap">
            <span
              className={`font-mono font-medium px-2 py-0.5 rounded break-all border ${
                isUnavailable
                  ? 'line-through text-slate-400 bg-slate-100 border-slate-200 select-none'
                  : 'text-primary bg-primary/5 border-primary/10'
              }`}
            >
              {displayTag}
            </span>
            {isUnavailable ? (
              <Tooltip
                content={
                  item.unavailableReason
                    ? `Does not work: ${item.unavailableReason}`
                    : 'Does not work'
                }
              >
                <span className="inline-flex items-center justify-center p-1 rounded-full bg-red-100 text-red-600 border border-red-200 shrink-0 cursor-not-allowed">
                  <Ban className="w-3.5 h-3.5" />
                </span>
              </Tooltip>
            ) : (
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
            )}
          </div>
        </div>
      </td>
      <td
        className={`px-4 py-2 align-top pr-4 leading-relaxed break-words ${
          isUnavailable ? 'text-slate-400' : 'text-slate-700'
        }`}
      >
        <div>{item.description}</div>
        {isUnavailable && item.unavailableReason && (
          <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{item.unavailableReason}</span>
          </div>
        )}
      </td>
      <td
        className={`px-4 py-2 align-top italic flex justify-between items-start gap-4 break-words ${
          isUnavailable ? 'text-slate-400 line-through' : 'text-slate-500'
        }`}
      >
        <span className="min-w-0 break-words">{item.example}</span>
        {(canEditTags || canDeleteTags) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 not-italic">
            {canEditTags && handleToggleUnavailable && (
              <Tooltip content={isUnavailable ? 'Mark as Available' : 'Mark as Unavailable'}>
                <button
                  onClick={() => handleToggleUnavailable(item)}
                  className={`p-1 rounded transition-colors ${
                    isUnavailable
                      ? 'text-red-500 hover:text-emerald-600 hover:bg-emerald-50'
                      : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  <Ban className="w-4 h-4" />
                </button>
              </Tooltip>
            )}
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
