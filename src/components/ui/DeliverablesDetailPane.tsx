import React from 'react';
import {
  Trash2,
  CheckCircle2,
  Flag,
  Calendar,
  User,
  MessageSquare,
  ListTodo,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormContext, useWatch } from 'react-hook-form';
import { Select } from './Select';
import { DatePicker } from './DatePicker';
import { RichTextEditor } from './RichTextEditor';

interface DeliverablesDetailPaneProps {
  activeItemId: string | null;
  allItems: Record<string, any>;
  readOnly: boolean;
  isClientPortal: boolean;
  hiddenItems: string[];
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Draft Complete':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'In Progress':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Received':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'Provided':
      return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    case 'Question':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'Additional Pending':
      return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'Pending':
      return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    case 'Delayed':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'N/A':
      return 'bg-slate-50 text-slate-400 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'High':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'Low':
      return 'text-slate-400 bg-slate-50 border-slate-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

export default function DeliverablesDetailPane({
  activeItemId,
  allItems,
  readOnly,
  isClientPortal,
  hiddenItems,
}: DeliverablesDetailPaneProps) {
  const { setValue, getValues } = useFormContext();

  // Only watch the currently active item
  const itemData = useWatch({ name: activeItemId || 'none' }) || {};

  if (!activeItemId || !allItems[activeItemId]) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 max-w-[300px] mx-auto text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center mb-6 shadow-sm transition-transform">
          <ListTodo className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-[15px] font-bold text-slate-700 mb-2">No Item Selected</h3>
        <p className="text-[13px] text-slate-500 font-medium">
          Select a deliverable from the master list to view and edit its details.
        </p>
      </div>
    );
  }

  const item = allItems[activeItemId];
  const isCustom = item.isCustom;
  const isHidden = !isCustom && hiddenItems.includes(item.id);

  const handleChange = (field: string, val: any) => {
    if (isCustom) {
      const currentCustom = [...(getValues('_customItems') || [])];
      currentCustom[item.customIdx] = { ...currentCustom[item.customIdx], [field]: val };
      setValue('_customItems', currentCustom, { shouldDirty: true });
    } else {
      // If setting undefined, we should delete the key or set it to undefined. RHF supports undefined.
      setValue(`${item.id}.${field}`, val, { shouldDirty: true });
    }
  };

  const handleCustomItemRemove = () => {
    const currentCustom = [...(getValues('_customItems') || [])];
    currentCustom.splice(item.customIdx, 1);
    setValue('_customItems', currentCustom, { shouldDirty: true });
  };

  const clientNoteVal =
    itemData.clientNote !== undefined ? itemData.clientNote : itemData.note || '';
  const internalNoteVal = itemData.internalNote || '';
  const status = itemData.status || 'Pending';
  const taskName = itemData.taskName || item.taskName || '';
  const priority = itemData.priority || 'Normal';

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
            {isHidden && (
              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Excluded</span>
            )}
          </div>

          <div className="flex items-start justify-between gap-4">
            {isCustom && !readOnly ? (
              <input
                type="text"
                value={taskName}
                onChange={(e) => handleChange('taskName', e.target.value)}
                className="flex-1 text-[20px] font-bold text-slate-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded-md -ml-2 px-2 py-1"
                placeholder="Enter item name..."
              />
            ) : (
              <h2 className="text-[20px] font-bold text-slate-900 leading-snug">{taskName}</h2>
            )}

            {isCustom && !readOnly && (
              <button
                onClick={handleCustomItemRemove}
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
                <div
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border ${getStatusColor(status)}`}
                >
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
                  options={STATUS_OPTIONS.map((opt) => ({
                    label: (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-semibold border ${getStatusColor(opt)}`}
                      >
                        {opt}
                      </span>
                    ),
                    value: opt,
                  }))}
                  value={status}
                  onChange={(val) => handleChange('status', val)}
                  trigger={
                    <button
                      disabled={readOnly || isHidden}
                      className={`w-fit text-left inline-flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] font-bold border shadow-sm transition-all focus:ring-2 focus:ring-primary/20 focus:outline-none ${getStatusColor(status)} ${readOnly || isHidden ? 'opacity-80 cursor-default' : 'hover:brightness-95'}`}
                    >
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
              {readOnly || isHidden || isClientPortal ? (
                <div
                  className={`w-fit inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm text-[13px] font-bold cursor-default opacity-80 ${getPriorityColor(priority)}`}
                >
                  <Flag className="w-4 h-4" />
                  {priority}
                </div>
              ) : (
                <div className="w-fit">
                  <Select
                    options={PRIORITY_OPTIONS.map((opt) => ({
                      label: (
                        <span
                          className={`text-[12px] font-semibold ${getPriorityColor(opt).split(' ')[0]}`}
                        >
                          {opt}
                        </span>
                      ),
                      value: opt,
                    }))}
                    value={priority}
                    onChange={(val) => handleChange('priority', val)}
                    trigger={
                      <button
                        className={`w-fit inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm text-[13px] font-bold transition-all focus:ring-2 focus:ring-primary/20 focus:outline-none hover:brightness-95 active:scale-95 ${getPriorityColor(priority)}`}
                      >
                        <Flag className="w-4 h-4" />
                        {priority}
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
                  <button
                    disabled={readOnly || isHidden || isClientPortal}
                    className={`w-fit justify-start inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg shadow-sm text-[13px] font-bold transition-all focus:ring-2 focus:ring-primary/20 focus:outline-none ${itemData.date ? 'text-slate-700 border-slate-300 bg-slate-50' : 'text-slate-400 border-slate-200 bg-white'} ${readOnly || isHidden || isClientPortal ? 'cursor-default' : 'hover:border-primary/50 hover:text-primary active:scale-95'}`}
                  >
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {itemData.date
                      ? new Date(itemData.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Unscheduled'}
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
                className={`w-full text-[13px] font-semibold text-slate-700 outline-none bg-white border border-slate-200 rounded-xl shadow-sm pl-9 pr-3 py-2 transition-all placeholder:text-slate-400 placeholder:font-medium ${readOnly || isHidden || isClientPortal ? 'opacity-80 cursor-default' : 'focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-slate-300'}`}
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
            <div
              className={`w-full text-[13px] font-medium text-slate-700 outline-none bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition-all min-h-[100px] ${readOnly || isHidden ? '' : 'hover:border-slate-300 focus-within:bg-white focus-within:border-primary focus-within:shadow-sm focus-within:ring-2 focus-within:ring-primary/20'}`}
            >
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
              <div
                className={`w-full text-[13px] font-medium text-slate-800 outline-none border border-primary/30 rounded-xl overflow-hidden transition-all min-h-[100px] bg-primary/5 shadow-inner ${readOnly || isHidden ? '' : 'hover:border-primary/50 hover:bg-primary/10 focus-within:bg-white focus-within:border-primary focus-within:shadow-sm focus-within:ring-2 focus-within:ring-primary/20'}`}
              >
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
}
