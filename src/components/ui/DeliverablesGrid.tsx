import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  X,
  Download,
  ExternalLink,
  ListTodo,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Select } from './Select';
import { DatePicker } from './DatePicker';
import { ChecklistSection } from '../admin/TemplateDesigner';
import DeliverablesMasterRow from './DeliverablesMasterRow';
import DeliverablesDetailPane from './DeliverablesDetailPane';
import { useFormContext, useWatch } from 'react-hook-form';

interface DeliverablesGridProps {
  template: { sections?: ChecklistSection[] };
  project: any;
  readOnly?: boolean;
  isClientPortal?: boolean;
}

const STATUS_OPTIONS = [
  'Pending',
  'Additional Pending',
  'Provided',
  'Received',
  'Question',
  'Delayed',
  'In Progress',
  'Draft Complete',
  'Completed',
  'N/A',
];

const PRIORITY_OPTIONS = ['Low', 'Normal', 'High', 'Critical'];

export default function DeliverablesGrid({
  template,
  project,
  readOnly = false,
  isClientPortal = false,
}: DeliverablesGridProps) {
  const { control, getValues, setValue } = useFormContext();

  // Watch top-level UI states from form
  const hiddenSections = useWatch({ control, name: '_hiddenSections' }) || [];
  const hiddenItems = useWatch({ control, name: '_hiddenItems' }) || [];
  const customItems = useWatch({ control, name: '_customItems' }) || [];

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  const toggleCollapseSection = (sectionId: string) => {
    setCollapsedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const visibleSections = useMemo(() => {
    if (!template?.sections) return [];
    const activeFeatures = project?.features || [];
    return template.sections.filter((section) => {
      if (!section.dependsOnFeature || section.dependsOnFeature.length === 0) return true;
      return section.dependsOnFeature.some((f) => activeFeatures.includes(f));
    });
  }, [template, project]);

  // Aggregate all items for easier mapping in the detail pane
  const allItems = useMemo(() => {
    const items: Record<string, any> = {};
    visibleSections.forEach((sec) => {
      sec.items.forEach((item) => {
        items[item.id] = { ...item, isCustom: false, sectionId: sec.id, sectionName: sec.name };
      });
    });
    customItems.forEach((cItem: any, idx: number) => {
      items[cItem.id] = {
        ...cItem,
        isCustom: true,
        customIdx: idx,
        sectionId: 'custom',
        sectionName: 'Additional Items',
      };
    });
    return items;
  }, [visibleSections, customItems]);

  // Default select the first item on load
  React.useEffect(() => {
    if (!activeItemId) {
      const firstSection = visibleSections[0];
      if (firstSection && firstSection.items.length > 0) {
        setActiveItemId(firstSection.items[0].id);
      } else if (customItems.length > 0) {
        setActiveItemId(customItems[0].id);
      }
    }
  }, [visibleSections, customItems, activeItemId]);

  if (visibleSections.length === 0 && !customItems.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full bg-slate-50/50 rounded-2xl m-4 border border-dashed border-slate-200">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
          <ListTodo className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-[15px] font-bold text-slate-700 mb-2">No Deliverables Required</h3>
        <p className="text-[13px] text-slate-500 font-medium max-w-[280px]">
          Based on the selected features, there are no deliverables required for this project.
        </p>
      </div>
    );
  }

  const handleCustomItemAdd = () => {
    const currentCustom = [...customItems];
    const newItemId = `custom_${Date.now()}`;
    const newItem = {
      id: newItemId,
      taskName: 'New Custom Item',
      status: 'Pending',
      priority: 'Normal',
      resource: '',
      clientNote: '',
      internalNote: '',
      date: null,
    };
    setValue('_customItems', [...currentCustom, newItem], { shouldDirty: true });
    setActiveItemId(newItemId);
  };

  const toggleHideSection = (sectionId: string) => {
    const current = [...hiddenSections];
    if (current.includes(sectionId)) current.splice(current.indexOf(sectionId), 1);
    else current.push(sectionId);
    setValue('_hiddenSections', current, { shouldDirty: true });
  };

  const toggleHideItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = [...hiddenItems];
    if (current.includes(itemId)) current.splice(current.indexOf(itemId), 1);
    else current.push(itemId);
    setValue('_hiddenItems', current, { shouldDirty: true });
  };

  const toggleSelectItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleBulkUpdate = (field: string, value: any) => {
    const customItemsToUpdate = selectedItems.filter((id) => id.startsWith('custom_'));
    const regularItemsToUpdate = selectedItems.filter((id) => !id.startsWith('custom_'));

    regularItemsToUpdate.forEach((id) => {
      setValue(`${id}.${field}`, value, { shouldDirty: true });
    });

    if (customItemsToUpdate.length > 0) {
      const updatedCustom = [...customItems];
      customItemsToUpdate.forEach((customId) => {
        const idx = updatedCustom.findIndex((c: any) => c.id === customId);
        if (idx !== -1) {
          updatedCustom[idx] = { ...updatedCustom[idx], [field]: value };
        }
      });
      setValue('_customItems', updatedCustom, { shouldDirty: true });
    }

    setSelectedItems([]);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden rounded-b-2xl relative">
      {/* Global Client Portal Header */}
      {isClientPortal && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-5 border-b border-slate-100 bg-white/95 backdrop-blur-md shrink-0 z-20 shadow-sm relative">
          <div className="flex items-center gap-3 w-full md:w-auto ml-auto">
            <a
              href={project?.teamworkLink || '#'}
              target={project?.teamworkLink ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className={`group inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all duration-300 px-5 py-2 h-9 focus:ring-2 focus:ring-primary/20 focus:outline-none ${project?.teamworkLink ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] shadow-sm' : 'bg-slate-100 text-slate-400 pointer-events-none'}`}
            >
              <ExternalLink className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span>Open Teamwork</span>
            </a>
            <button className="group inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200 border border-transparent bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 hover:-translate-y-0.5 px-5 py-2 h-9 focus:ring-2 focus:ring-slate-400/20 focus:outline-none">
              <Download className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        {/* Left Pane: Master List */}
        <div className="w-full md:w-[35%] flex flex-col border-r border-slate-200 bg-slate-50/50 shrink-0">
          {/* Left Pane Header & Search */}
          <div className="p-4 border-b border-slate-200 bg-white z-10 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search deliverables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-[13px] font-medium border border-slate-200 rounded-xl focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 hover:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-thin-scroll py-2 relative">
            {visibleSections.map((section) => {
              const isSectionHidden = hiddenSections.includes(section.id);
              if (isSectionHidden && isClientPortal) return null; // completely hide excluded sections for clients

              const sectionItems = section.items;
              const isCollapsed = collapsedSections.includes(section.id);

              return (
                <div key={section.id} className="mb-4">
                  <div className="flex items-center justify-between px-4 py-1.5 mb-1 group/secheader">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCollapseSection(section.id)}
                        className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors bg-white hover:bg-slate-100 rounded-md border border-transparent hover:border-slate-200"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      <h3
                        className={`text-[13px] font-bold capitalize text-slate-700 ${isSectionHidden ? 'opacity-50' : ''}`}
                      >
                        {section.name}
                      </h3>
                      {!readOnly && !isClientPortal && (
                        <button
                          onClick={() => toggleHideSection(section.id)}
                          className="p-1 opacity-0 group-hover/secheader:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity"
                          title={
                            isSectionHidden ? 'Unhide Section' : 'Exclude Section from Project'
                          }
                        >
                          {isSectionHidden ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                    {isSectionHidden && !isClientPortal && (
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold capitalize">
                        Excluded
                      </span>
                    )}
                  </div>

                  {!isSectionHidden && !isCollapsed && (
                    <div className="flex flex-col gap-0.5">
                      {sectionItems.map((item) => (
                        <DeliverablesMasterRow
                          key={item.id}
                          item={item}
                          isCustom={false}
                          isHidden={hiddenItems.includes(item.id)}
                          isSelected={selectedItems.includes(item.id)}
                          isActive={activeItemId === item.id}
                          readOnly={readOnly}
                          isClientPortal={isClientPortal}
                          searchQuery={searchQuery}
                          onSelect={toggleSelectItem}
                          onActivate={setActiveItemId}
                          onToggleHide={toggleHideItem}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom Items Section */}
            {customItems.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center px-4 py-1.5 mb-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCollapseSection('custom')}
                      className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors bg-white hover:bg-slate-100 rounded-md border border-transparent hover:border-slate-200"
                    >
                      {collapsedSections.includes('custom') ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <h3 className="text-[13px] font-bold capitalize text-amber-600">
                      Additional Items
                    </h3>
                  </div>
                </div>
                {!collapsedSections.includes('custom') && (
                  <div className="flex flex-col gap-0.5">
                    {customItems.map((customItem: any) => (
                      <DeliverablesMasterRow
                        key={customItem.id}
                        item={customItem}
                        isCustom={true}
                        isHidden={false}
                        isSelected={selectedItems.includes(customItem.id)}
                        isActive={activeItemId === customItem.id}
                        readOnly={readOnly}
                        isClientPortal={isClientPortal}
                        searchQuery={searchQuery}
                        onSelect={toggleSelectItem}
                        onActivate={setActiveItemId}
                        onToggleHide={toggleHideItem}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Add Custom Button */}
            {!readOnly && (
              <div className="px-4 mt-2 mb-6">
                <button
                  onClick={handleCustomItemAdd}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-[12px] font-semibold text-slate-500 hover:text-primary hover:bg-primary/5 border border-dashed border-slate-300 hover:border-primary/40 rounded-xl transition-all w-full bg-transparent"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Additional Item
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Detail View */}
        <div className="w-full md:w-[65%] flex flex-col bg-white overflow-hidden shrink-0">
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto custom-thin-scroll min-h-0 relative pb-24">
            <DeliverablesDetailPane
              activeItemId={activeItemId}
              allItems={allItems}
              readOnly={readOnly}
              isClientPortal={isClientPortal}
              hiddenItems={hiddenItems}
            />
          </div>
        </div>

        {/* Floating Bulk Action Bar (Modal Level) */}
        {selectedItems.length > 0 && !readOnly && !isClientPortal && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-4 py-2.5 flex items-center gap-4 z-[var(--z-popover)] animate-in slide-in-from-bottom-10 fade-in zoom-in-95 duration-300 ease-out border border-slate-200/60 whitespace-nowrap">
            <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold shrink-0">
                {selectedItems.length}
              </span>
              <span className="text-[13px] font-bold text-slate-700">Items Selected</span>
            </div>

            <div className="flex items-center gap-1">
              <Select
                options={STATUS_OPTIONS.map((opt) => ({ label: opt, value: opt }))}
                value=""
                onChange={(val) => handleBulkUpdate('status', val)}
                position="top"
                trigger={
                  <button className="px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none">
                    Status...
                  </button>
                }
              />

              <Select
                options={PRIORITY_OPTIONS.map((opt) => ({ label: opt, value: opt }))}
                value=""
                onChange={(val) => handleBulkUpdate('priority', val)}
                position="top"
                trigger={
                  <button className="px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none">
                    Priority...
                  </button>
                }
              />

              <DatePicker
                value={undefined}
                onChange={(val) => handleBulkUpdate('date', val)}
                placeholder="Target Date"
                trigger={
                  <button className="px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none">
                    Target Date...
                  </button>
                }
              />

              <input
                className="w-[90px] focus:w-[180px] px-3 py-1.5 text-[13px] font-medium text-slate-600 bg-transparent border-none outline-none placeholder:text-slate-600 hover:bg-slate-50 focus:bg-slate-100 rounded-lg transition-all"
                placeholder="Owner..."
                onBlur={(e) => {
                  if (e.target.value) {
                    handleBulkUpdate('resource', e.target.value);
                    e.target.value = '';
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                }}
              />
            </div>

            <button
              onClick={() => setSelectedItems([])}
              className="ml-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
