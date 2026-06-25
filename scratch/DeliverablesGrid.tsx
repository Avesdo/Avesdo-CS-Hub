import React, { useMemo, useState } from 'react';
import { ChecklistSection } from '../admin/TemplateDesigner';
import { Plus, Trash2, EyeOff, Eye, Calendar, User, Flag, Search, X, CheckSquare, MessageSquare, ListTodo, FileText, ChevronRight, ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import { Select } from './Select';
import { DatePicker } from './DatePicker';
import { RichTextEditor } from './RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';

interface DeliverablesGridProps {
  template: { sections?: ChecklistSection[] };
  project: any;
  values: Record<string, any>;
  onChange: (itemId: string, field: string, value: any) => void;
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
  'N/A'
];

const PRIORITY_OPTIONS = ['Low', 'Normal', 'High', 'Critical'];

export default function DeliverablesGrid({
  template,
  project,
  values,
  onChange,
  readOnly = false,
  isClientPortal = false
}: DeliverablesGridProps) {
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  const toggleCollapseSection = (sectionId: string) => {
    setCollapsedSections(prev => 
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    );
  };

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

  // Aggregate all items for easier mapping in the detail pane
  const allItems = useMemo(() => {
    const items: Record<string, any> = {};
    visibleSections.forEach(sec => {
      sec.items.forEach(item => {
        items[item.id] = { ...item, isCustom: false, sectionId: sec.id, sectionName: sec.name };
      });
    });
    (values._customItems || []).forEach((cItem: any, idx: number) => {
      items[cItem.id] = { ...cItem, isCustom: true, customIdx: idx, sectionId: 'custom', sectionName: 'Additional Items' };
    });
    return items;
  }, [visibleSections, values._customItems]);

  // Default select the first item on load
  React.useEffect(() => {
    if (!activeItemId) {
      const firstSection = visibleSections[0];
      if (firstSection && firstSection.items.length > 0) {
        setActiveItemId(firstSection.items[0].id);
      } else if ((values._customItems || []).length > 0) {
        setActiveItemId(values._customItems[0].id);
      }
    }
  }, [visibleSections, values._customItems, activeItemId]);

  if (visibleSections.length === 0 && !values._customItems?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center h-full">
        <p className="text-[13px] text-slate-500 font-medium">No deliverables are required for the features on this project.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Draft Complete': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Provided': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Received': return 'bg-amber-200 text-amber-800 border-amber-400';
      case 'Question': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Additional Pending': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'Delayed': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-200';
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
    const newItemId = `custom_${Date.now()}`;
    const newItem = { id: newItemId, taskName: 'New Custom Item', status: 'Pending', priority: 'Normal', resource: '', clientNote: '', internalNote: '', date: null };
    onChange('_customItems', 'replace', [...currentCustom, newItem]);
    setActiveItemId(newItemId);
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
    if (activeItemId === (values._customItems || [])[idx]?.id) {
      setActiveItemId(null);
    }
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

  const toggleSelectItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

    setSelectedItems([]);
  };

  // --------------------------------------------------------------------------------
  // Master List Render
  // --------------------------------------------------------------------------------
  const renderMasterListRow = (item: any, isCustom: boolean) => {
    const isHidden = !isCustom && hiddenItems.includes(item.id);
    const isSelected = selectedItems.includes(item.id);
    const isActive = activeItemId === item.id;
    const itemData = isCustom ? item : (values[item.id] || {});
    const status = itemData.status || 'Pending';
    
    // Determine status dot color
    let dotColor = 'bg-slate-300';
    if (['Completed', 'Setup Completed'].includes(status)) dotColor = 'bg-emerald-500';
    else if (['Provided/Uploaded to TW', 'Received'].includes(status)) dotColor = 'bg-indigo-500';
    else if (['Draft Complete', 'In Progress'].includes(status)) dotColor = 'bg-blue-400';
    else if (['Question', 'Delayed'].includes(status)) dotColor = 'bg-amber-500';

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!item.taskName.toLowerCase().includes(q)) return null;
    }

    return (
      <div 
        key={item.id} 
        onClick={() => setActiveItemId(item.id)}
        className={`group flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl cursor-pointer transition-all border ${
          isActive 
            ? 'bg-primary/5 border-primary/20 shadow-sm' 
            : 'border-transparent hover:bg-slate-100 hover:border-slate-200'
        } ${isHidden ? 'opacity-40 grayscale' : ''}`}
      >
        {!readOnly && !isClientPortal && !isHidden && (
          <div className="shrink-0" onClick={(e) => toggleSelectItem(item.id, e)}>
             <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white group-hover:border-primary/50'}`}>
                {isSelected && <CheckSquare className="w-3 h-3" />}
             </div>
          </div>
        )}
        <div className="shrink-0 w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: isActive ? 'transparent' : undefined }}>
           <div className={`w-full h-full rounded-full ${dotColor} ${isActive ? 'animate-pulse ring-2 ring-offset-1 ring-primary/50' : ''}`} />
        </div>
        <div className="flex-1 min-w-0">
           <h4 className={`text-[13px] font-semibold truncate ${isActive ? 'text-primary' : 'text-slate-700 group-hover:text-slate-900'}`}>
             {item.taskName || 'Unnamed Item'}
           </h4>
        </div>
        {!readOnly && !isClientPortal && !isCustom && (
           <button 
             onClick={(e) => { e.stopPropagation(); toggleHideItem(item.id); }}
             className={`p-1 shrink-0 rounded hover:bg-slate-200 transition-colors ${isHidden ? 'text-slate-500' : 'opacity-0 group-hover:opacity-100 text-slate-400'}`}
           >
             {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
           </button>
        )}
      </div>
    );
  };

  // --------------------------------------------------------------------------------
  // Detail Pane Render
  // --------------------------------------------------------------------------------
  const renderDetailPane = () => {
    if (!activeItemId || !allItems[activeItemId]) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
           <ListTodo className="w-12 h-12 mb-4 opacity-20" />
           <p className="text-sm font-medium">Select a deliverable to view details.</p>
        </div>
      );
    }

    const item = allItems[activeItemId];
    const isCustom = item.isCustom;
    const isHidden = !isCustom && hiddenItems.includes(item.id);
    const itemData = isCustom ? item : (values[item.id] || {});

    const handleChange = (field: string, val: any) => {
      if (isCustom) handleCustomItemUpdate(item.customIdx, field, val);
      else onChange(item.id, field, val);
    };

    const clientNoteVal = itemData.clientNote !== undefined ? itemData.clientNote : (itemData.note || '');
    const internalNoteVal = itemData.internalNote || '';
    const status = itemData.status || 'Pending';

    return (
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeItemId}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
          className={`flex flex-col h-full ${isHidden ? 'opacity-50 grayscale' : ''}`}
        >
          {/* Detail Header */}
          <div className="flex flex-col gap-3 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
               <span>{item.sectionName}</span>
               {isHidden && <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Excluded</span>}
            </div>
            
            <div className="flex items-start justify-between gap-4">
              {isCustom && !readOnly ? (
                 <input
                   type="text"
                   value={item.taskName}
                   onChange={(e) => handleChange('taskName', e.target.value)}
                   className="flex-1 text-[20px] font-bold text-slate-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded-md -ml-2 px-2 py-1"
                   placeholder="Enter item name..."
                 />
              ) : (
                 <h2 className="text-[20px] font-bold text-slate-900 leading-snug">{item.taskName}</h2>
              )}
              
              {isCustom && !readOnly && (
                 <button 
                   onClick={() => handleCustomItemRemove(item.customIdx)}
                   className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              )}
            </div>

            {item.defaultNote && !isCustom && (
              <p className="text-[13px] font-medium text-slate-500 leading-relaxed max-w-2xl">
                {item.defaultNote}
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-100">
            
            {/* Status */}
            <div className="flex flex-col gap-2">
               <span className="text-[12px] font-bold text-slate-500">Status</span>
               {isClientPortal ? (
                 <div className="flex items-center gap-3">
                   <div className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border ${getStatusColor(status)}`}>
                     {status}
                   </div>
                   {status === 'Pending' && !readOnly && (
                     <button 
                       onClick={() => handleChange('status', 'Provided/Uploaded to TW')}
                       className="px-4 py-1.5 bg-primary text-white text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                     >
                       Mark as Provided
                     </button>
                   )}
                 </div>
               ) : (
                 <Select
                    options={STATUS_OPTIONS.map(opt => ({
                      label: <span className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-semibold border ${getStatusColor(opt)}`}>{opt}</span>,
                      value: opt
                    }))}
                    value={status}
                    onChange={(val) => handleChange('status', val)}
                    trigger={
                       <button disabled={readOnly || isHidden} className={`w-full max-w-[240px] text-left inline-flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-semibold border shadow-sm transition-all focus:ring-2 ${getStatusColor(status)} ${(readOnly || isHidden) ? 'opacity-80 cursor-default' : 'hover:brightness-95'}`}>
                         {status}
                       </button>
                    }
                 />
               )}
            </div>

            {/* Priority (Internal Only) */}
            {!isClientPortal && (
              <div className="flex flex-col gap-2">
                 <span className="text-[12px] font-bold text-slate-500">Priority</span>
                 <Select
                    options={PRIORITY_OPTIONS.map(opt => ({
                      label: <span className={`text-[12px] font-semibold ${getPriorityColor(opt).split(' ')[0]}`}>{opt}</span>,
                      value: opt
                    }))}
                    value={itemData.priority || 'Normal'}
                    onChange={(val) => handleChange('priority', val)}
                    trigger={
                       <button disabled={readOnly || isHidden} className={`w-full max-w-[240px] inline-flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm text-[13px] font-semibold transition-colors ${getPriorityColor(itemData.priority || 'Normal')} ${(readOnly || isHidden) ? 'cursor-default' : 'hover:brightness-95 focus:border-primary'}`}>
                         <Flag className="w-4 h-4" />
                         {itemData.priority || 'Normal'}
                       </button>
                    }
                 />
              </div>
            )}

            {/* Target Date */}
            <div className="flex flex-col gap-2">
               <span className="text-[12px] font-bold text-slate-500">Target Date</span>
               <DatePicker
                 value={itemData.date}
                 onChange={(val) => handleChange('date', val)}
                 placeholder="Set Target Date"
                 trigger={
                   <button disabled={readOnly || isHidden} className={`w-full max-w-[240px] justify-start inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl shadow-sm text-[13px] font-semibold transition-colors bg-white ${itemData.date ? 'text-slate-700 border-slate-300 bg-slate-50' : 'text-slate-400'} ${(readOnly || isHidden) ? 'cursor-default' : 'hover:border-primary/50 hover:text-primary focus:border-primary'}`}>
                     <Calendar className="w-4 h-4 text-slate-400" />
                     {itemData.date ? new Date(itemData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unscheduled'}
                   </button>
                 }
               />
            </div>

            {/* Assignee (Internal Only) */}
            {!isClientPortal && (
              <div className="flex flex-col gap-2">
                 <span className="text-[12px] font-bold text-slate-500">Assignee</span>
                 <div className="relative w-full max-w-[240px]">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                       <User className="w-4 h-4" />
                     </div>
                     <input
                       type="text"
                       disabled={readOnly || isHidden}
                       value={itemData.resource || ''}
                       onChange={(e) => handleChange('resource', e.target.value)}
                       placeholder="Unassigned"
                       className="w-full text-[13px] font-semibold text-slate-700 outline-none bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-slate-300 rounded-xl shadow-sm pl-9 pr-3 py-2 transition-all placeholder:text-slate-400 placeholder:font-medium"
                     />
                 </div>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="flex flex-col gap-6 py-6 flex-1 min-h-0 overflow-y-auto custom-thin-scroll">
            
            {/* Client Notes */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
                <MessageSquare className="w-3.5 h-3.5" /> Client Notes & Feedback
              </div>
              <textarea
                 disabled={readOnly || isHidden}
                 value={clientNoteVal}
                 onChange={(e) => {
                   if (itemData.note !== undefined) handleChange('note', undefined);
                   handleChange('clientNote', e.target.value);
                 }}
                 placeholder="Enter any notes, questions, or context here..."
                 className={`w-full text-[13px] font-medium text-slate-700 outline-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-400 transition-all min-h-[100px] resize-y ${(readOnly || isHidden) ? '' : 'hover:border-slate-300 focus:bg-white focus:border-primary focus:shadow-sm focus:ring-2 focus:ring-primary/20'}`}
              />
            </div>

            {/* Internal Notes (Yellow Tinted) */}
            {!isClientPortal && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-amber-600">
                    <FileText className="w-3.5 h-3.5" /> Internal Notes (Hidden from Client)
                  </div>
                </div>
                <textarea
                   disabled={readOnly || isHidden}
                   value={internalNoteVal}
                   onChange={(e) => handleChange('internalNote', e.target.value)}
                   placeholder="Private notes for the team..."
                   className={`w-full text-[13px] font-medium text-amber-900 outline-none border border-amber-200/60 rounded-xl px-4 py-3 placeholder:text-amber-700/50 transition-all min-h-[100px] resize-y bg-amber-50/50 shadow-inner ${(readOnly || isHidden) ? '' : 'hover:border-amber-300/60 hover:bg-amber-50 focus:bg-amber-100/50 focus:border-amber-400 focus:shadow-sm focus:ring-2 focus:ring-amber-500/20'}`}
                 />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // --------------------------------------------------------------------------------
  // Main Layout
  // --------------------------------------------------------------------------------
  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-white overflow-hidden rounded-b-2xl">
      
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
            
            return (
              <div key={section.id} className="mb-4">
                <div className="flex items-center justify-between px-4 py-1.5 mb-1 group/secheader">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-[11px] font-bold tracking-wider uppercase text-slate-500 ${isSectionHidden ? 'opacity-50' : ''}`}>
                      {section.name}
                    </h3>
                    {!readOnly && !isClientPortal && (
                      <button 
                        onClick={() => toggleHideSection(section.id)}
                        className="p-1 opacity-0 group-hover/secheader:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity"
                        title={isSectionHidden ? "Unhide Section" : "Exclude Section from Project"}
                      >
                        {isSectionHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  {isSectionHidden && !isClientPortal && <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold">Excluded</span>}
                </div>
                
                {!isSectionHidden && (
                  <div className="flex flex-col gap-0.5">
                    {sectionItems.map((item) => renderMasterListRow(item, false))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom Items Section */}
          {(values._customItems || []).length > 0 && (
             <div className="mb-4">
                <div className="flex items-center px-4 py-1.5 mb-1">
                  <h3 className="text-[11px] font-bold tracking-wider uppercase text-amber-600">
                    Additional Items
                  </h3>
                </div>
                <div className="flex flex-col gap-0.5">
                  {(values._customItems || []).map((customItem: any) => renderMasterListRow(customItem, true))}
                </div>
             </div>
          )}

          {/* Add Custom Button */}
          {!readOnly && !isClientPortal && (
            <div className="px-4 mt-2 mb-6">
               <button
                 onClick={handleCustomItemAdd}
                 className="flex items-center justify-center gap-2 px-4 py-2 text-[12px] font-semibold text-slate-500 hover:text-primary hover:bg-primary/5 border border-dashed border-slate-300 hover:border-primary/40 rounded-xl transition-all w-full bg-transparent"
               >
                 <Plus className="w-3.5 h-3.5" /> Add custom deliverable
               </button>
            </div>
          )}
        </div>

        {/* Floating Bulk Action Bar for Left Pane */}
        {selectedItems.length > 0 && !readOnly && !isClientPortal && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/60 rounded-2xl p-3 flex flex-col gap-3 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
            <div className="flex items-center justify-between px-1">
              <span className="text-[13px] font-bold flex items-center gap-2 text-slate-800">
                <CheckSquare className="w-4 h-4 text-primary" /> {selectedItems.length} Selected
              </span>
              <button onClick={() => setSelectedItems([])} className="text-slate-400 hover:text-slate-600 transition-colors">
                 <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
               <Select
                 options={STATUS_OPTIONS.map(opt => ({ label: opt, value: opt }))}
                 value=""
                 onChange={(val) => handleBulkUpdate('status', val)}
                 position="top"
                 trigger={
                   <button className="flex items-center justify-center text-[12px] font-semibold py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors w-full">
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
                   <button className="flex items-center justify-center text-[12px] font-semibold py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors w-full">
                     Set Priority...
                   </button>
                 }
               />
               <div className="col-span-2 grid grid-cols-2 gap-2">
                 <DatePicker
                   value={null}
                   onChange={(val) => handleBulkUpdate('date', val)}
                   position="top"
                   placeholder="Set Date"
                   trigger={
                     <button className="flex items-center justify-center gap-1.5 text-[12px] font-semibold py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors w-full">
                       <Calendar className="w-3.5 h-3.5 text-slate-400" /> Set Date...
                     </button>
                   }
                 />
                 <div className="relative w-full">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input 
                      type="text"
                      placeholder="Set Owner..."
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                           handleBulkUpdate('resource', e.target.value.trim());
                           e.target.value = ''; // clear after update
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-full pl-8 pr-3 py-1.5 text-[12px] font-semibold rounded-lg bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-500"
                    />
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Pane: Detail View */}
      <div className="w-full md:w-[65%] flex flex-col bg-white overflow-hidden shrink-0">
         <div className="flex-1 p-6 sm:p-8 overflow-y-auto custom-thin-scroll min-h-0 relative">
            {renderDetailPane()}
       </div>
      
    </div>
  );
}