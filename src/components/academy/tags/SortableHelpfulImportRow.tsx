import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { HelpfulImportItem } from '../../../types';

export interface SortableHelpfulImportRowProps {
  item: HelpfulImportItem;
  canEditImports: boolean;
  canDeleteImports: boolean;
  setEditingImport: (item: HelpfulImportItem) => void;
  setIsImportModalOpen: (open: boolean) => void;
  handleDeleteImport: (id: string) => void;
}

export function SortableHelpfulImportRow({
  item,
  canEditImports,
  canDeleteImports,
  setEditingImport,
  setIsImportModalOpen,
  handleDeleteImport,
}: SortableHelpfulImportRowProps) {
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
        <div className="flex items-start gap-1">
          {canEditImports && (
            <button
              {...attributes}
              {...listeners}
              className="p-0.5 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 rounded flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1 text-slate-800 font-medium leading-relaxed px-1">
            {item.action}
          </div>
        </div>
      </td>
      <td className="px-4 py-2 align-top">
        {item.project ? (
          <span className="text-slate-700 font-medium">{item.project}</span>
        ) : (
          <span className="text-slate-400 italic text-sm">General</span>
        )}
      </td>
      <td className="px-4 py-2 align-top flex justify-between items-start gap-4">
        <div className="text-slate-700 w-full overflow-hidden">
          {item.solution ? (
            item.solution.startsWith('http') ? (
              <a
                href={item.solution}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline group break-all"
              >
                <span className="group-hover:underline">{item.solution}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ) : (
              <span className="whitespace-pre-wrap leading-relaxed">{item.solution}</span>
            )
          ) : (
            <span className="text-slate-400 italic">No solution recorded</span>
          )}
        </div>

        {(canEditImports || canDeleteImports) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {canEditImports && (
              <button
                onClick={() => {
                  setEditingImport(item);
                  setIsImportModalOpen(true);
                }}
                className="p-1 text-slate-400 hover:text-primary rounded hover:bg-slate-100"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {canDeleteImports && (
              <button
                onClick={() => handleDeleteImport(item.id)}
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
