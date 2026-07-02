import React from 'react';
import { FolderOpen } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ChecklistSection } from '../TemplateDesigner';
import { SortableChecklistSection } from './SortableChecklistSection';

interface ChecklistBuilderProps {
  sections: ChecklistSection[];
  setSections: React.Dispatch<React.SetStateAction<ChecklistSection[]>>;
  features: string[];
}

export function ChecklistBuilder({ sections, setSections, features }: ChecklistBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddSection = () =>
    setSections([
      ...sections,
      {
        id: `sec_${Date.now()}`,
        name: 'New Section',
        description: '',
        dependsOnFeature: [],
        items: [],
      },
    ]);

  const handleUpdateSection = (index: number, updates: Partial<ChecklistSection>) => {
    const u = [...sections];
    u[index] = { ...u[index], ...updates };
    setSections(u);
  };

  const handleRemoveSection = (index: number) => {
    const u = [...sections];
    u.splice(index, 1);
    setSections(u);
  };

  const handleSectionDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSections((items) =>
        arrayMove(
          items,
          items.findIndex((i) => i.id === active.id),
          items.findIndex((i) => i.id === over.id)
        )
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 overflow-y-auto px-10 py-10 custom-thin-scroll">
        <div className="max-w-3xl space-y-6 mx-auto relative z-10">
          {sections.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-5">
                <FolderOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">No sections yet</h4>
              <p className="text-slate-500 mt-2 max-w-sm mb-6">
                Start building your deliverable checklist by adding a section.
              </p>
              <button
                onClick={handleAddSection}
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
              >
                Add First Section
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd}
            >
              <div className="space-y-6">
                <SortableContext
                  items={sections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map((section, index) => (
                    <SortableChecklistSection
                      key={section.id}
                      section={section}
                      index={index}
                      handleUpdateSection={handleUpdateSection}
                      handleRemoveSection={handleRemoveSection}
                      features={features}
                    />
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          )}

          {sections.length > 0 && (
            <div className="pt-4 pb-12">
              <button
                onClick={handleAddSection}
                className="flex items-center justify-center gap-2 text-slate-500 bg-white hover:text-primary hover:bg-slate-50 px-6 py-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/40 hover:shadow-sm transition-all font-semibold text-[14px] w-full group"
              >
                <FolderOpen className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />{' '}
                Add Another Section
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
