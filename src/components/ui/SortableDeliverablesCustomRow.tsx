import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import DeliverablesMasterRow from './DeliverablesMasterRow';

interface SortableDeliverablesCustomRowProps {
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

export default function SortableDeliverablesCustomRow(props: SortableDeliverablesCustomRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group/sortable relative flex items-center w-full cursor-grab active:cursor-grabbing px-1"
    >
      {!props.readOnly && !props.isClientPortal && !props.searchQuery && (
        <div className="flex-shrink-0 text-slate-400 group-hover/sortable:text-slate-600 transition-colors px-1 z-10">
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      <div className="w-full flex-1 min-w-0">
        <DeliverablesMasterRow {...props} />
      </div>
    </div>
  );
}
