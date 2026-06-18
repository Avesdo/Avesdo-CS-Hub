import React, { useMemo, useState } from 'react';
import { ChecklistSection } from '../admin/TemplateDesigner';
import { Plus, Trash2, EyeOff, Eye, Calendar, User, Flag, MessageSquare, ChevronDown, ChevronRight, Filter, Search, CheckSquare, X } from 'lucide-react';
import { Select } from './Select';
import { DatePicker } from './DatePicker';

interface DeliverablesGridProps {
  template: { sections?: ChecklistSection[] };
  project: any;
  values: Record<string, any>;
  onChange: (itemId: string, field: string, value: any) => void;
  readOnly?: boolean;
}

const STATUS_OPTIONS = [
  'Pending',
  'Additional Pending',
  'Provided/Uploaded to TW',
  'Received',
  'Question',
  'Delayed',
  'In Progress',
  'Draft Complete',
  'Setup Completed',
  'Completed',
  'N/A'
];

const PRIORITY_OPTIONS = ['Low', 'Normal', 'High', 'Critical'];

export default function DeliverablesGrid({
  template,
  project,
  values,
  onChange,
  readOnly = false
}: DeliverablesGridProps) {
  
  // States for advanced features
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ownerFilter, setOwnerFilter] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const hiddenSections = useMemo(() => values._hiddenSections || [], [values._hiddenSections]);
  const hiddenItems = useMemo(() => values._hiddenItems || [], [values._hiddenItems]);

  const visibleSections = useMemo(() => {
    if (!template?.sections) return [];
    const activeFeatures = project?.features || [];
    
    return template.sections.filter(section => {
      if (!section.dependsOnFeature || section.dependsOnFeature.length === 0) return true;
      return section.dependsOnFeature.some(f => activeFeatures.includes(f));
    });
  }, [template, project]);

  if (visibleSections.length === 0 && !values._customItems?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-[13px] text-slate-500 font-medium">No deliverables are required for the features on this project.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Setup Completed': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Draft Complete': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Provided/Uploaded to TW': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Received': return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'Question': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Additional Pending': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Delayed': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Pending': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'N/A': return 'bg-slate-50 text-slate-400 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Low': return 'text-slate-400 bg-slate-50 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const handleCustomItemAdd = () => {
    const currentCustom = values._customItems || [];
    const newItem = { id: `custom_${Date.now()}`, taskName: '', status: 'Pending', priority: 'Normal', resource: '', clientNote: '', internalNote: '', date: null };
    onChange('_customItems', 'replace', [...currentCustom, newItem]);
  };

  const handleCustomItemUpdate = (idx: number, field: string, value: any) => {
    const currentCustom = [...(values._customItems || [])];
    currentCustom[idx] = { ...currentCustom[idx], [field]: value };
    onChange('_customItems', 'replace', currentCustom);
  };

  const handleCustomItemRemove = (idx: number) => {
    const currentCustom = [...(values._customItems || [])];
    currentCustom.splice(idx, 1);
    onChange('_customItems', 'replace', currentCustom);
  };

  const toggleHideSection = (sectionId: string) => {
    const current = [...hiddenSections];
    if (current.includes(sectionId)) current.splice(current.indexOf(sectionId), 1);
    else current.push(sectionId);
    onChange('_hiddenSections', 'replace', current);
  };

  const toggleHideItem = (itemId: string) => {
    const current = [...hiddenItems];
    if (current.includes(itemId)) current.splice(current.indexOf(itemId), 1);
    else current.push(itemId);
    onChange('_hiddenItems', 'replace', current);
  };

  const toggleCollapseSection = (sectionId: string) => {
    setCollapsedSections(prev => 
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    );
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleBulkUpdate = (field: string, value: any) => {
    const customItemsToUpdate = selectedItems.filter(id => id.startsWith('custom_'));
    const regularItemsToUpdate = selectedItems.filter(id => !id.startsWith('custom_'));

    regularItemsToUpdate.forEach(id => {
      onChange(id, field, value);
    });

    if (customItemsToUpdate.length > 0) {
      let updatedCustom = [...(values._customItems || [])];
      customItemsToUpdate.forEach(customId => {
        const idx = updatedCustom.findIndex((c: any) => c.id === customId);
        if (idx !== -1) {
          updatedCustom[idx] = { ...updatedCustom[idx], [field]: value };
        }
      });
      onChange('_customItems', 'replace', updatedCustom);
    }

    setSelectedItems([]); // Clear selection after bulk update
  };

  const renderRow = (
    itemId: string, 
    taskName: string, 
    defaultNote: string | undefined, 
    itemData: any, 
    isCustom: boolean = false, 
    customIdx: number = -1,
    isHidden: boolean = false
  ) => {
    const handleChange = (field: string, val: any) => {
      if (isCustom) handleCustomItemUpdate(customIdx, field, val);
      else onChange(itemId, field, val);
    };

    const isSelected = selectedItems.includes(itemId);

    // Ensure backward compatibility with existing `note`
    const clientNoteVal = itemData.clientNote !== undefined ? itemData.clientNote : (itemData.note || '');
    const internalNoteVal = itemData.internalNote || '';

    return (
      <div key={itemId} className={`group relative flex gap-3 px-4 py-3 bg-white border rounded-xl transition-all duration-200 ${isHidden ? 'opacity-40 grayscale border-slate-100' : 'border-slate-200 hover:border-primary/40 hover:shadow-sm'} ${isSelected ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.02]' : ''}`}>
        
        {!readOnly && !isHidden && (
           <div className="pt-1.5 shrink-0 flex flex-col gap-2">
             <input 
               type="checkbox" 
               checked={isSelected}
               onChange={() => toggleSelectItem(itemId)}
               className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer transition-colors"
             />
           </div>
        )}

        {!readOnly && !isCustom && (
          <button 
            onClick={() => toggleHideItem(itemId)}
            className="absolute -left-3 top-3 p-1.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity bg-white rounded-full shadow-sm border border-slate-100 z-10"
            title={isHidden ? "Unhide Item" : "Exclude Item from Project"}
          >
            {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        )}

        <div className="flex flex-col gap-2.5 w-full">
          {/* Top Row: Task Name & Primary Badges */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {isCustom ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    disabled={readOnly}
                    value={taskName}
                    onChange={(e) => handleChange('taskName', e.target.value)}
                    placeholder="Enter custom deliverable name..."
                    className="w-full rounded-md border border-transparent hover:border-slate-200 focus:border-primary bg-transparent focus:bg-white px-2 py-1 text-[13px] font-semibold text-slate-900 outline-none transition-colors"
                  />
                  {!readOnly && (
                    <button onClick={() => handleCustomItemRemove(customIdx)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-[13px] font-semibold text-slate-900 leading-snug break-words">
                      {taskName}
                    </h4>
                    {isHidden && <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ml-1">Excluded</span>}
                  </div>
                  {defaultNote && !isHidden && (
                    <p className="text-[11px] font-medium text-slate-500 mt-1 leading-relaxed max-w-2xl block w-full">
                      {defaultNote}
                    </p>
                  )}
                </div>
              )}
            </div>

            {!isHidden && (
              <div className="flex items-center gap-2 shrink-0">
                 {/* Status Badge */}
                 <Select
                    options={STATUS_OPTIONS.map(opt => ({
                      label: <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getStatusColor(opt)}`}>{opt}</span>,
                      value: opt
                    }))}
                    value={itemData.status || 'Pending'}
                    onChange={(val) => handleChange('status', val)}
                    trigger={
                       <button disabled={readOnly || isHidden} className={`w-[130px] text-left inline-flex items-center justify-between px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all focus:ring-2 ${getStatusColor(itemData.status || 'Pending')} ${(readOnly || isHidden) ? 'opacity-80 cursor-default' : 'hover:brightness-95'}`}>
                         {itemData.status || 'Pending'}
                       </button>
                    }
                 />

                 {/* Priority Badge */}
                 <Select
                    options={PRIORITY_OPTIONS.map(opt => ({
                      label: <span className={`text-[12px] font-semibold ${getPriorityColor(opt).split(' ')[0]}`}>{opt}</span>,
                      value: opt
                    }))}
                    value={itemData.priority || 'Normal'}
                    onChange={(val) => handleChange('priority', val)}
                    trigger={
                       <button disabled={readOnly || isHidden} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors ${getPriorityColor(itemData.priority || 'Normal')} ${(readOnly || isHidden) ? 'cursor-default' : 'hover:brightness-95 focus:border-primary'}`}>
                         <Flag className="w-3.5 h-3.5" />
                         {itemData.priority || 'Normal'}
                       </button>
                    }
                 />
              </div>
            )}
          </div>

          {/* Bottom Row: Date, Owner & Dual Notes (HIDDEN IF EXCLUDED) */}
          {!isHidden && (
            <div className="flex flex-col sm:flex-row items-start gap-2 pt-2 border-t border-slate-100">
               {/* Target Date Badge */}
               <div className="shrink-0 w-full sm:w-auto">
                 <DatePicker
                   value={itemData.date}
                   onChange={(val) => handleChange('date', val)}
                   placeholder="Target date"
                   trigger={
                     <button disabled={readOnly || isHidden} className={`w-full sm:w-auto justify-between sm:justify-start inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:py-1 border border-slate-200 rounded-md text-[11px] font-semibold transition-colors bg-white ${itemData.date ? 'text-slate-700 border-slate-300 bg-slate-50' : 'text-slate-400'} ${(readOnly || isHidden) ? 'cursor-default' : 'hover:border-primary/50 hover:text-primary focus:border-primary'}`}>
                       <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />
                       {itemData.date ? new Date(itemData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Set Date'}</div>
                     </button>
                   }
                 />
               </div>

               {/* Resource Badge */}
               <div className="relative flex items-center shrink-0 w-full sm:w-auto">
                   <div className="absolute left-2 top-1.5 pointer-events-none text-slate-400">
                     <User className="w-3.5 h-3.5" />
                   </div>
                   <input
                     type="text"
                     disabled={readOnly || isHidden}
                     value={itemData.resource || ''}
                     onChange={(e) => handleChange('resource', e.target.value)}
                     placeholder="Owner"
                     className="w-full sm:w-28 text-[11px] font-semibold text-slate-700 outline-none bg-white border border-slate-200 focus:border-primary hover:border-primary/50 rounded-md pl-7 pr-2 py-1.5 sm:py-1 transition-colors placeholder:text-slate-400 placeholder:font-medium h-[28px] sm:h-[26px]"
                   />
               </div>

               {/* Client Note Area */}
               <div className="relative flex-1 min-w-0 w-full ml-0 sm:ml-1">
                 <textarea
                    disabled={readOnly || isHidden}
                    value={clientNoteVal}
                    onChange={(e) => {
                      if (itemData.note !== undefined) handleChange('note', undefined);
                      handleChange('clientNote', e.target.value);
                    }}
                    placeholder="Client comments..."
                    rows={1}
                    className={`w-full text-[11px] font-medium text-slate-700 outline-none bg-transparent border border-transparent rounded-md px-3 py-1.5 sm:py-1.5 placeholder:text-slate-400 transition-all min-h-[30px] sm:min-h-[26px] ${(readOnly || isHidden) ? '' : 'hover:border-slate-200 hover:bg-slate-50 focus:bg-white focus:border-primary focus:shadow-sm focus:ring-1 focus:ring-primary/20'}`}
                    style={{ overflow: 'hidden', resize: 'none' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                  />
               </div>

               {/* Internal Note Area (Primary tint) */}
               <div className="relative flex-1 min-w-0 w-full">
                 <textarea
                    disabled={readOnly || isHidden}
                    value={internalNoteVal}
                    onChange={(e) => handleChange('internalNote', e.target.value)}
                    placeholder="Internal notes..."
                    rows={1}
                    className={`w-full text-[11px] font-medium text-primary outline-none border border-transparent rounded-md px-3 py-1.5 sm:py-1.5 placeholder:text-primary/50 transition-all min-h-[30px] sm:min-h-[26px] bg-primary/5 ${(readOnly || isHidden) ? '' : 'hover:border-primary/30 hover:bg-primary/10 focus:bg-primary/5 focus:border-primary focus:shadow-sm focus:ring-1 focus:ring-primary/20'}`}
                    style={{ overflow: 'hidden', resize: 'none' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                  />
               </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50/30 p-2 sm:p-6 pb-28">
      
      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-40 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 -mt-2 sm:-mt-6 mb-6 px-2 sm:px-6 py-3 flex flex-wrap items-center gap-4 shadow-sm -mx-2 sm:-mx-6">
         <div className="flex items-center gap-2 text-slate-500 font-semibold text-[13px] mr-2">
            <Filter className="w-4 h-4" /> Filters
         </div>
         
         <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-[12px] font-medium border border-slate-200 rounded-lg w-40 focus:border-primary outline-none focus:ring-1 focus:ring-primary/20"
            />
         </div>

         <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Filter owner..."
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-[12px] font-medium border border-slate-200 rounded-lg w-32 focus:border-primary outline-none focus:ring-1 focus:ring-primary/20"
            />
         </div>

         <Select
            options={['All', ...STATUS_OPTIONS].map(opt => ({ label: opt, value: opt }))}
            value={statusFilter}
            onChange={setStatusFilter}
            trigger={
               <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-700 hover:border-slate-300">
                  Status: <span className="text-primary">{statusFilter}</span>
               </button>
            }
         />

         <Select
            options={['All', ...PRIORITY_OPTIONS].map(opt => ({ label: opt, value: opt }))}
            value={priorityFilter}
            onChange={setPriorityFilter}
            trigger={
               <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-700 hover:border-slate-300">
                  Priority: <span className="text-primary">{priorityFilter}</span>
               </button>
            }
         />
      </div>

      <div className="max-w-5xl mx-auto w-full space-y-12">
        
        {visibleSections.map((section) => {
          const isSectionHidden = hiddenSections.includes(section.id);
          const isCollapsed = collapsedSections.includes(section.id);
          
          // Apply Filters
          const filteredItems = section.items.filter(item => {
            const data = values[item.id] || {};
            if (statusFilter !== 'All' && (data.status || 'Pending') !== statusFilter) return false;
            if (priorityFilter !== 'All' && (data.priority || 'Normal') !== priorityFilter) return false;
            if (searchQuery) {
              const q = searchQuery.toLowerCase();
              if (!item.taskName.toLowerCase().includes(q) && !(data.resource || '').toLowerCase().includes(q)) return false;
            }
            if (ownerFilter) {
              const q = ownerFilter.toLowerCase();
              if (!(data.resource || '').toLowerCase().includes(q)) return false;
            }
            return true;
          });

          if (filteredItems.length === 0 && !isSectionHidden && (statusFilter !== 'All' || priorityFilter !== 'All' || searchQuery !== '' || ownerFilter !== '')) {
            return null; // Hide empty sections when filtering
          }

          const completedCount = section.items.filter(item => 
            ['Completed', 'Setup Completed', 'Draft Complete', 'N/A'].includes(values[item.id]?.status)
          ).length;

          const progressPercent = section.items.length > 0 ? (completedCount / section.items.length) * 100 : 0;

          return (
            <div key={section.id} className="relative">
              {/* Section Header */}
              <div className="group/secheader flex flex-col mb-4">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2 relative">
                    <button 
                      onClick={() => toggleCollapseSection(section.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-md border border-slate-200 shadow-sm"
                    >
                      {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    <h3 className={`text-[17px] font-bold text-slate-900 tracking-tight ${isSectionHidden ? 'opacity-40' : ''}`}>
                      {section.name}
                    </h3>

                    {!readOnly && (
                      <button 
                        onClick={() => toggleHideSection(section.id)}
                        className="p-1 opacity-0 group-hover/secheader:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity"
                        title={isSectionHidden ? "Unhide Section" : "Exclude Section from Project"}
                      >
                        {isSectionHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    )}
                    {isSectionHidden && <span className="text-[11px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-semibold ml-2">Excluded</span>}
                    {section.description && !isSectionHidden && (
                      <span className="text-[12px] font-medium text-slate-500 hidden sm:inline-block ml-3 border-l border-slate-300 pl-3">
                        {section.description}
                      </span>
                    )}
                  </div>
                  {!isSectionHidden && (
                    <div className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {completedCount} / {section.items.length} Completed
                    </div>
                  )}
                </div>
                {/* Visual Progress Bar */}
                {!isSectionHidden && (
                  <div className="w-full h-0.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
              
              {/* Items List */}
              {!isSectionHidden && !isCollapsed && (
                <div className="flex flex-col gap-2">
                  {filteredItems.map((item) => {
                    const isItemHidden = hiddenItems.includes(item.id);
                    return renderRow(item.id, item.taskName, item.defaultNote, values[item.id] || {}, false, -1, isItemHidden);
                  })}
                  {filteredItems.length === 0 && (
                    <div className="text-[12px] text-slate-500 font-medium py-4 text-center border border-dashed border-slate-200 rounded-xl">
                      No items match the current filters.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Custom Items Section */}
        {(values._customItems || []).length > 0 && (
           <div className="relative">
             <div className="flex items-end justify-between border-b-2 border-amber-200 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-[17px] font-bold text-amber-700 tracking-tight">
                    Additional Items & Questions
                  </h3>
                </div>
             </div>
             <div className="flex flex-col gap-2">
               {(values._customItems || []).map((customItem: any, idx: number) => {
                  // Apply Filters to Custom Items
                  if (statusFilter !== 'All' && (customItem.status || 'Pending') !== statusFilter) return null;
                  if (priorityFilter !== 'All' && (customItem.priority || 'Normal') !== priorityFilter) return null;
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    if (!customItem.taskName.toLowerCase().includes(q) && !(customItem.resource || '').toLowerCase().includes(q)) return null;
                  }
                  if (ownerFilter) {
                    const q = ownerFilter.toLowerCase();
                    if (!(customItem.resource || '').toLowerCase().includes(q)) return null;
                  }
                  return renderRow(customItem.id, customItem.taskName, undefined, customItem, true, idx, false);
               })}
             </div>
           </div>
        )}

        {/* Add Custom Item Button */}
        {!readOnly && (
          <div className="pt-2">
             <button
               onClick={handleCustomItemAdd}
               className="flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 border border-dashed border-slate-300 hover:border-primary/40 rounded-xl transition-all w-full justify-center bg-white"
             >
               <Plus className="w-4 h-4" /> Add custom deliverable
             </button>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedItems.length > 0 && !readOnly && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-slate-800 border border-slate-200 rounded-xl shadow-2xl px-6 py-3 flex flex-wrap justify-center sm:flex-nowrap items-center gap-4 sm:gap-6 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300 pointer-events-auto">
          <div className="flex items-center gap-3 sm:pr-4 sm:border-r border-slate-200">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
              {selectedItems.length}
            </span>
            <span className="text-sm font-medium whitespace-nowrap text-slate-700">
              Tasks Selected
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
             <Select
               options={STATUS_OPTIONS.map(opt => ({ label: opt, value: opt }))}
               value=""
               onChange={(val) => handleBulkUpdate('status', val)}
               position="top"
               trigger={
                 <button className="flex items-center text-xs font-medium px-3 py-1.5 rounded-md border shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white hover:bg-slate-50 text-slate-700 border-slate-200">
                   Set Status...
                 </button>
               }
             />
             <Select
               options={PRIORITY_OPTIONS.map(opt => ({ label: opt, value: opt }))}
               value=""
               onChange={(val) => handleBulkUpdate('priority', val)}
               position="top"
               trigger={
                 <button className="flex items-center text-xs font-medium px-3 py-1.5 rounded-md border shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white hover:bg-slate-50 text-slate-700 border-slate-200">
                   Set Priority...
                 </button>
               }
             />
             
             {/* Bulk Owner Input */}
             <div className="flex items-center shadow-sm">
               <input
                 type="text"
                 id="bulk-owner-input"
                 placeholder="Set Owner..."
                 className="px-3 py-1.5 bg-white border border-slate-200 rounded-l-md text-xs font-medium w-28 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
               />
               <button
                 onClick={() => {
                   const input = document.getElementById('bulk-owner-input') as HTMLInputElement;
                   if (input && input.value) {
                     handleBulkUpdate('resource', input.value);
                     input.value = '';
                   }
                 }}
                 className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-l-0 border-slate-200 rounded-r-md text-xs font-semibold text-slate-700 transition-colors"
               >
                 Apply
               </button>
             </div>

             <button 
               onClick={() => setSelectedItems([])}
               className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors ml-1"
             >
               <X className="w-4 h-4" />
             </button>
          </div>
        </div>
      )}

    </div>
  );
}
