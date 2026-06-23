import React, { useMemo, useState } from 'react';
import { ChecklistSection } from '../admin/TemplateDesigner';
import { Plus, Trash2, EyeOff, Eye, Calendar, User, Flag, Search, X, CheckSquare, MessageSquare, ListTodo, FileText, ChevronRight, ChevronDown, CheckCircle2, Circle, Check, Download, ExternalLink } from 'lucide-react';
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

  const progressData = useMemo(() => {
    let total = 0;
    let completed = 0;
    
    visibleSections.forEach(section => {
      if (isClientPortal && hiddenSections.includes(section.id)) return;
      section.items.forEach(item => {
        if (isClientPortal && hiddenItems.includes(item.id)) return;
        total++;
        const itemData = values[item.id] || {};
        const status = itemData.status || (item as any).status || 'Pending';
        if (['Completed', 'Setup Completed', 'Draft Complete', 'N/A'].includes(status)) completed++;
      });
    });

    const customItems = values._customItems || [];
    customItems.forEach((item: any) => {
      if (isClientPortal && hiddenItems.includes(item.id)) return;
      total++;
      if (['Completed', 'Setup Completed', 'Draft Complete', 'N/A'].includes(item.status)) completed++;
    });

    return {
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [visibleSections, values, isClientPortal, hiddenSections, hiddenItems]);

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
      <div className="flex flex-col items-center justify-center p-12 text-center h-full bg-slate-50/50 rounded-2xl m-4 border border-dashed border-slate-200">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
          <ListTodo className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-[15px] font-bold text-slate-700 mb-2">No Deliverables Required</h3>
        <p className="text-[13px] text-slate-500 font-medium max-w-[280px]">Based on the selected features, there are no deliverables required for this project.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Draft Complete': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Received': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Provided': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'Question': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'Additional Pending': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Pending': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'Delayed': return 'bg-rose-50 text-rose-700 border-rose-200';
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
    const priority = itemData.priority || 'Normal';
    
    // Determine status dot color
    let dotColor = 'bg-slate-300';
    if (['Completed'].includes(status)) dotColor = 'bg-emerald-500';
    else if (['Draft Complete'].includes(status)) dotColor = 'bg-teal-500';
    else if (['In Progress'].includes(status)) dotColor = 'bg-blue-500';
    else if (['Provided', 'Received'].includes(status)) dotColor = 'bg-indigo-500';
    else if (['Question', 'Additional Pending', 'Pending'].includes(status)) dotColor = 'bg-amber-500';
    else if (['Delayed'].includes(status)) dotColor = 'bg-rose-500';

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!item.taskName.toLowerCase().includes(q)) return null;
    }

    return (
      <div 
        key={item.id} 
        onClick={() => setActiveItemId(item.id)}
        className={`group flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl cursor-pointer transition-all border outline-none ${
          isActive 
            ? 'bg-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/10' 
            : 'border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20'
        } ${isHidden ? 'opacity-40 grayscale' : ''}`}
      >
        {!readOnly && !isClientPortal && !isHidden && (
          <div className="relative group/cb flex items-center justify-center shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                toggleSelectItem(item.id, e as any);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-primary border-primary shadow-sm shadow-primary/20' : 'bg-white border-slate-300 group-hover/cb:border-primary/50'}`}>
              <Check className={`w-3 h-3 text-white transition-transform duration-200 ${isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} strokeWidth={3} />
            </div>
          </div>
        )}
        <div className="shrink-0 w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: isActive ? 'transparent' : undefined }}>
           <div className={`w-full h-full rounded-full ${dotColor} ${isActive ? 'animate-pulse ring-2 ring-offset-1 ring-primary/50' : ''}`} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
           <h4 className={`text-[13px] font-semibold truncate ${isActive ? 'text-primary' : 'text-slate-700 group-hover:text-slate-900'}`}>
             {item.taskName || 'Unnamed Item'}
           </h4>
           {!isHidden && status !== 'Completed' && (
             <div className="flex items-center">
               <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(priority)}`}>
                 {priority}
               </span>
             </div>
           )}
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
        <div className="flex flex-col items-center justify-center h-full text-slate-400 max-w-[300px] mx-auto text-center">
           <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
             <ListTodo className="w-8 h-8 text-slate-300" />
           </div>
           <h3 className="text-[15px] font-bold text-slate-700 mb-2">No Item Selected</h3>
           <p className="text-[13px] text-slate-500 font-medium">Select a deliverable from the master list to view and edit its details.</p>
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
            <div className="flex items-center gap-2 text-[12px] font-bold tracking-wide text-slate-400">
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
                       onClick={() => handleChange('status', 'Provided')}
                       className="group inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-primary bg-white hover:bg-primary/5 text-[12px] font-bold rounded-lg transition-all duration-300 border border-slate-200 hover:border-primary/30 shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
                     >
                       <CheckCircle2 className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" />
                       Mark Provided
                     </button>
                   )}
                 </div>
               ) : (
                 <div className="w-fit">
                   <Select
                      options={STATUS_OPTIONS.map(opt => ({
                        label: <span className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-semibold border ${getStatusColor(opt)}`}>{opt}</span>,
                        value: opt
                      }))}
                      value={status}
                      onChange={(val) => handleChange('status', val)}
                      trigger={
                         <button disabled={readOnly || isHidden} className={`w-fit text-left inline-flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] font-bold border shadow-sm transition-all focus:ring-2 focus:ring-primary/20 focus:outline-none ${getStatusColor(status)} ${(readOnly || isHidden) ? 'opacity-80 cursor-default' : 'hover:brightness-95'}`}>
                           {status}
                         </button>
                      }
                   />
                 </div>
               )}
            </div>

            {/* Priority */}
            {status !== 'Completed' && (
              <div className="flex flex-col gap-2">
                 <span className="text-[12px] font-bold text-slate-500">Priority</span>
                 {(readOnly || isHidden || isClientPortal) ? (
                   <div className={`w-fit inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm text-[13px] font-bold cursor-default opacity-80 ${getPriorityColor(itemData.priority || 'Normal')}`}>
                     <Flag className="w-4 h-4" />
                     {itemData.priority || 'Normal'}
                   </div>
                 ) : (
                   <div className="w-fit">
                     <Select
                        options={PRIORITY_OPTIONS.map(opt => ({
                          label: <span className={`text-[12px] font-semibold ${getPriorityColor(opt).split(' ')[0]}`}>{opt}</span>,
                          value: opt
                        }))}
                        value={itemData.priority || 'Normal'}
                        onChange={(val) => handleChange('priority', val)}
                        trigger={
                           <button className={`w-fit inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm text-[13px] font-bold transition-all focus:ring-2 focus:ring-primary/20 focus:outline-none hover:brightness-95 active:scale-95 ${getPriorityColor(itemData.priority || 'Normal')}`}>
                             <Flag className="w-4 h-4" />
                             {itemData.priority || 'Normal'}
                           </button>
                        }
                     />
                   </div>
                 )}
              </div>
            )}

            {/* Target Date */}
            <div className="flex flex-col gap-2">
               <span className="text-[12px] font-bold text-slate-500">Target / Updated Date</span>
               <div className="w-fit">
                 <DatePicker
                   value={itemData.date}
                   onChange={(val) => handleChange('date', val)}
                   placeholder="Set Date"
                   trigger={
                     <button disabled={readOnly || isHidden || isClientPortal} className={`w-fit justify-start inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg shadow-sm text-[13px] font-bold transition-all focus:ring-2 focus:ring-primary/20 focus:outline-none ${itemData.date ? 'text-slate-700 border-slate-300 bg-slate-50' : 'text-slate-400 border-slate-200 bg-white'} ${(readOnly || isHidden || isClientPortal) ? 'cursor-default' : 'hover:border-primary/50 hover:text-primary active:scale-95'}`}>
                       <Calendar className="w-4 h-4 text-slate-400" />
                       {itemData.date ? new Date(itemData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unscheduled'}
                     </button>
                   }
                 />
               </div>
            </div>

            {/* Owner */}
            <div className="flex flex-col gap-2">
               <span className="text-[12px] font-bold text-slate-500">Owner</span>
               <div className="relative w-full max-w-[240px]">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                     <User className="w-4 h-4" />
                   </div>
                   <input
                     type="text"
                     disabled={readOnly || isHidden || isClientPortal}
                     value={itemData.resource || ''}
                     onChange={(e) => handleChange('resource', e.target.value)}
                     placeholder="Unassigned"
                     className={`w-full text-[13px] font-semibold text-slate-700 outline-none bg-white border border-slate-200 rounded-xl shadow-sm pl-9 pr-3 py-2 transition-all placeholder:text-slate-400 placeholder:font-medium ${(readOnly || isHidden || isClientPortal) ? 'opacity-80 cursor-default' : 'focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-slate-300'}`}
                   />
               </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="flex flex-col gap-6 py-6 flex-1 min-h-0 overflow-y-auto custom-thin-scroll">
            
            {/* Client Notes */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
                <MessageSquare className="w-3.5 h-3.5" /> Notes, Comments, or Questions
              </div>
              <div className={`w-full text-[13px] font-medium text-slate-700 outline-none bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition-all min-h-[100px] ${(readOnly || isHidden) ? '' : 'hover:border-slate-300 focus-within:bg-white focus-within:border-primary focus-within:shadow-sm focus-within:ring-2 focus-within:ring-primary/20'}`}>
                <RichTextEditor
                   disabled={readOnly || isHidden}
                   content={clientNoteVal}
                   onChange={(val) => {
                     if (itemData.note !== undefined) handleChange('note', undefined);
                     handleChange('clientNote', val);
                   }}
                   placeholder="Enter any notes, questions, or context here..."
                />
              </div>
            </div>

            {/* Internal Notes (Primary Tinted) */}
            {!isClientPortal && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-primary">
                    <FileText className="w-3.5 h-3.5" /> Internal Notes (Hidden from Client)
                  </div>
                </div>
                <div className={`w-full text-[13px] font-medium text-slate-800 outline-none border border-primary/30 rounded-xl overflow-hidden transition-all min-h-[100px] bg-primary/5 shadow-inner ${(readOnly || isHidden) ? '' : 'hover:border-primary/50 hover:bg-primary/10 focus-within:bg-white focus-within:border-primary focus-within:shadow-sm focus-within:ring-2 focus-within:ring-primary/20'}`}>
                  <RichTextEditor
                     disabled={readOnly || isHidden}
                     content={internalNoteVal}
                     onChange={(val) => handleChange('internalNote', val)}
                     placeholder="Private notes for the team..."
                   />
                </div>
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
    <div className="flex flex-col h-full w-full bg-white overflow-hidden rounded-b-2xl relative">
      
      {/* Global Client Portal Header */}
      {isClientPortal && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-5 border-b border-slate-100 bg-white/95 backdrop-blur-md shrink-0 z-20 shadow-sm relative">
          {/* Progress Section */}
          <div className="w-full md:w-[45%]">
            <div className="flex justify-between items-center text-[13px] font-bold text-slate-600 mb-2">
              <span>Deliverables Progress</span>
              <span className="text-primary">{progressData.completed} of {progressData.total} Completed</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 shadow-inner">
              <div 
                className="h-full bg-primary transition-all duration-700 ease-out rounded-full" 
                style={{ width: `${progressData.percent}%` }} 
              />
            </div>
          </div>
          
          {/* Actions Section */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <a 
              href={project?.teamworkLink || '#'} 
              target={project?.teamworkLink ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className={`group inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all duration-300 px-5 py-2 h-9 focus:ring-2 focus:ring-primary/20 focus:outline-none ${project?.teamworkLink ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] shadow-sm' : 'bg-slate-100 text-slate-400 pointer-events-none'}`}
            >
              <ExternalLink className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span>Open Teamwork</span>
            </a>
            <button 
              className="group inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200 border border-transparent bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 hover:-translate-y-0.5 px-5 py-2 h-9 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
            >
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
                      {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <h3 className={`text-[13px] font-bold capitalize text-slate-700 ${isSectionHidden ? 'opacity-50' : ''}`}>
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
                  {isSectionHidden && !isClientPortal && <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold capitalize">Excluded</span>}
                </div>
                
                {!isSectionHidden && !isCollapsed && (
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
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleCollapseSection('custom')}
                      className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors bg-white hover:bg-slate-100 rounded-md border border-transparent hover:border-slate-200"
                    >
                      {collapsedSections.includes('custom') ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <h3 className="text-[13px] font-bold capitalize text-amber-600">
                      Additional Items
                    </h3>
                  </div>
                </div>
                {!collapsedSections.includes('custom') && (
                  <div className="flex flex-col gap-0.5">
                    {(values._customItems || []).map((customItem: any) => renderMasterListRow(customItem, true))}
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
            {renderDetailPane()}
         </div>
      </div>

      {/* Floating Bulk Action Bar (Modal Level) */}
      {selectedItems.length > 0 && !readOnly && !isClientPortal && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-4 py-2.5 flex items-center gap-4 z-[60] animate-in slide-in-from-bottom-10 fade-in zoom-in-95 duration-300 ease-out border border-slate-200/60 whitespace-nowrap">
          <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold shrink-0">
              {selectedItems.length}
            </span>
            <span className="text-[13px] font-bold text-slate-700">
              Items Selected
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Select
              options={STATUS_OPTIONS.map(opt => ({ label: opt, value: opt }))}
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
              options={PRIORITY_OPTIONS.map(opt => ({ label: opt, value: opt }))}
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
