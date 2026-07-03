import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  Plus,
  Trash2,
  GripVertical,
  SplitSquareHorizontal,
  CheckSquare,
  ChevronDown,
} from 'lucide-react';
import { MultiSelect } from '../../ui/MultiSelect';
import { SortableChecklistItem } from './SortableChecklistItem';

export function SortableChecklistSection({
  section,
  index,
  handleUpdateSection,
  handleRemoveSection,
  features,
}: any) {
  const [isEditingDesc, setIsEditingDesc] = React.useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleAddItem = () => {
    handleUpdateSection(index, {
      items: [...section.items, { id: `item_${Date.now()}`, taskName: '' }],
    });
  };
  const handleUpdateItem = (itemIndex: number, itemUpdates: any) => {
    const newItems = [...section.items];
    newItems[itemIndex] = { ...newItems[itemIndex], ...itemUpdates };
    handleUpdateSection(index, { items: newItems });
  };
  const handleRemoveItem = (itemIndex: number) => {
    const newItems = [...section.items];
    newItems.splice(itemIndex, 1);
    handleUpdateSection(index, { items: newItems });
  };

  // Nested DndContext for items
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const handleItemDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = section.items.findIndex((i: any) => i.id === active.id);
      const newIndex = section.items.findIndex((i: any) => i.id === over.id);
      handleUpdateSection(index, { items: arrayMove(section.items, oldIndex, newIndex) });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl shadow-sm border transition-all relative group/section ${isDragging ? 'border-primary ring-2 ring-primary/20 shadow-lg' : 'border-slate-200 hover:border-primary-300 hover:shadow-md'}`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-200 group-hover/section:bg-primary rounded-l-xl transition-colors" />

      <div className="p-0 flex flex-col relative">
        {/* Top Header Row */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors mr-1"
            >
              <GripVertical className="w-5 h-5" />
            </div>
            <CheckSquare className="w-5 h-5 text-primary opacity-80" />
            <span className="text-[14px] font-bold text-slate-800">Checklist Section</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Logic Toggle */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  className={`w-8 h-[18px] rounded-full relative transition-colors ${section.logicEnabled ? 'bg-primary' : 'bg-slate-200 group-hover:bg-slate-300'}`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-white rounded-full transition-transform shadow-sm ${section.logicEnabled ? 'translate-x-[14px]' : 'translate-x-0'}`}
                  />
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={section.logicEnabled || false}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      handleUpdateSection(index, {
                        logicEnabled: enabled,
                        dependsOnFeature: enabled ? [] : [],
                      });
                    }}
                  />
                </div>
                <span className="text-[13px] font-semibold text-slate-700">Feature logic</span>
              </label>
            </div>

            <div className="w-px h-4 bg-slate-200 mx-1" />

            <button
              onClick={() => handleRemoveSection(index)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Section"
            >
              <Trash2 className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Feature Logic Editor Row */}
        {section.logicEnabled && (
          <div className="bg-slate-50 border-b border-slate-200 p-5 shadow-inner">
            <div className="flex flex-col gap-3 max-w-3xl">
              <div className="flex items-center gap-2 text-slate-700">
                <SplitSquareHorizontal className="w-[18px] h-[18px]" />
                <span className="text-[13px] font-semibold">
                  Show this section if project uses any of:
                </span>
              </div>
              <div className="flex items-center gap-3 pl-6">
                <MultiSelect
                  values={section.dependsOnFeature || []}
                  onChange={(vals) => handleUpdateSection(index, { dependsOnFeature: vals })}
                  options={features?.map((f: string) => ({ label: f, value: f })) || []}
                  trigger={
                    <div className="flex items-center justify-between h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] font-medium text-slate-700 hover:border-slate-300 transition-colors shadow-sm min-w-[240px] max-w-[500px] flex-1">
                      <span className="truncate">
                        {section.dependsOnFeature?.length ? (
                          section.dependsOnFeature.join(', ')
                        ) : (
                          <span className="text-slate-400 font-normal">Select features...</span>
                        )}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        )}

        <div className="p-5 space-y-6">
          {/* Section Inputs */}
          <div className="space-y-4 max-w-2xl">
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-bold text-slate-500">
                Section Name *
              </label>
              <input
                type="text"
                value={section.name}
                onChange={(e) => handleUpdateSection(index, { name: e.target.value })}
                className="w-full text-[15px] font-semibold text-slate-900 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm bg-white"
                placeholder="e.g. Credit Card Setup"
              />
            </div>

            {!section.description && !isEditingDesc ? (
              <button
                onClick={() => setIsEditingDesc(true)}
                className="text-[12px] font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 mt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add description
              </button>
            ) : (
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-bold text-slate-500">
                  Description
                </label>
                <input
                  type="text"
                  value={section.description || ''}
                  onChange={(e) => handleUpdateSection(index, { description: e.target.value })}
                  onBlur={() => {
                    if (!section.description) setIsEditingDesc(false);
                  }}
                  className="w-full text-[14px] font-medium text-slate-700 rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm bg-white"
                  placeholder="Add some context about this section..."
                  autoFocus={isEditingDesc}
                />
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <h4 className="text-[14px] font-bold text-slate-800 mb-3">Deliverables</h4>
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-2 space-y-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleItemDragEnd}
              >
                <SortableContext
                  items={section.items.map((i: any) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {section.items.map((item: any, itemIdx: number) => (
                    <SortableChecklistItem
                      key={item.id}
                      item={item}
                      itemIdx={itemIdx}
                      handleUpdateItem={handleUpdateItem}
                      handleRemoveItem={handleRemoveItem}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <div className="pt-2 pb-1 px-1">
                <button
                  onClick={handleAddItem}
                  className="text-[13px] font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5 w-max"
                >
                  <Plus className="w-4 h-4" /> Add deliverable
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
