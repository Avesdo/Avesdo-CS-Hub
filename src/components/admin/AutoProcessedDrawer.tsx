import React, { useState, useEffect } from 'react';
import { X, Undo2, CheckSquare, Square, Trash2, Search, ArrowRight, Building2, Home, Briefcase, User } from 'lucide-react';
import { db } from '../../api/firebase';
import { updateDoc, doc, writeBatch } from 'firebase/firestore';
import { toast } from '../../utils/toast';
import { TruncatedText } from '../ui/TruncatedText';
import { Tooltip } from '../ui/Tooltip';

interface AutoProcessedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  log: any | null;
  onUpdate: () => void;
}

export function AutoProcessedDrawer({ isOpen, onClose, log, onUpdate }: AutoProcessedDrawerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelected(new Set());
      setSearchQuery('');
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, log, onClose]);

  if (!isOpen || !log) return null;

  const autoProcessed = log.autoProcessed || [];
  const filteredAutoProcessed = autoProcessed.filter((item: any) =>
    (item.rawName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.targetName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const allSelected = filteredAutoProcessed.length > 0 && selected.size === filteredAutoProcessed.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredAutoProcessed.map((i: any) => i.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const removeItemsFromLog = async (idsToRemove: string[]) => {
    const updatedList = autoProcessed.filter((i: any) => !idsToRemove.includes(i.id));
    await updateDoc(doc(db, 'system_logs', log.id), {
      autoProcessed: updatedList,
    });
    onUpdate();
    if (updatedList.length === 0) {
      onClose();
    }
  };

  const handleUndo = async (idsToUndo: string[]) => {
    if (idsToUndo.length === 0) return;
    setIsProcessing(true);
    try {
      const batch = writeBatch(db);
      for (const id of idsToUndo) {
        batch.update(doc(db, 'aliases', id), { status: 'pending_approval' });
      }
      await batch.commit();

      await removeItemsFromLog(idsToUndo);
      toast.success(`Successfully undone ${idsToUndo.length} item(s)`);
      setSelected(new Set());
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to undo items');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = async (idsToDismiss: string[]) => {
    if (idsToDismiss.length === 0) return;
    setIsProcessing(true);
    try {
      await removeItemsFromLog(idsToDismiss);
      toast.success(`Dismissed ${idsToDismiss.length} item(s) from view`);
      setSelected(new Set());
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to dismiss items');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="w-[500px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-[130]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Two-tone aesthetic header with blurred gradient aura */}
        <div className="relative px-6 py-5 border-b border-slate-200 flex flex-col bg-slate-50 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800">Auto-Processed Corrections</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors bg-white/50 border border-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="relative z-10 text-sm text-slate-500 mt-3">
            Select items to undo or dismiss from this log.
          </p>
        </div>

        {/* Search & Bulk Actions Bar */}
        <div className="flex flex-col border-b border-slate-200 bg-white">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search processed items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm placeholder:text-slate-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="px-4 py-2 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                {allSelected ? (
                  <CheckSquare className="w-4 h-4 text-primary" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                Select All
              </button>
              {selected.size > 0 && (
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {selected.size} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={isProcessing || selected.size === 0}
                onClick={() => handleUndo(Array.from(selected))}
                className="px-3 py-1.5 flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[11px] font-bold rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Undo2 className="w-3 h-3" />
                Undo
              </button>
              <button
                disabled={isProcessing || selected.size === 0}
                onClick={() => handleDismiss(Array.from(selected))}
                className="px-3 py-1.5 flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 text-[11px] font-bold rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Trash2 className="w-3 h-3" />
                Dismiss
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-thin-scroll">
          {filteredAutoProcessed.map((item: any) => {
            const isUserMapping = 
              item.contextName === 'Satisfaction Report' || 
              (log?.entityName || '').includes('Satisfaction Report');

            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-2 border-b border-slate-100 hover:bg-slate-50 group transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => toggleSelect(item.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-primary transition-colors"
                  >
                    {selected.has(item.id) ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                  <div className="flex items-center gap-2 min-w-0">
                    <Tooltip
                      content={
                        isUserMapping
                          ? 'User to Client Mapping'
                          : item.type.charAt(0).toUpperCase() + item.type.slice(1)
                      }
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 
                          ${
                            isUserMapping
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : item.type === 'client'
                                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                : item.type === 'project'
                                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                  : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}
                      >
                        {isUserMapping ? (
                          <User className="w-3 h-3" />
                        ) : item.type === 'client' ? (
                          <Building2 className="w-3 h-3" />
                        ) : item.type === 'project' ? (
                          <Home className="w-3 h-3" />
                        ) : (
                          <Briefcase className="w-3 h-3" />
                        )}
                      </div>
                    </Tooltip>
                    <TruncatedText
                      text={item.rawName}
                      className="text-[13px] font-semibold text-slate-800"
                      containerClassName="max-w-[140px]"
                    />
                    <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                    <TruncatedText
                      text={item.targetName}
                      className="text-[13px] text-slate-600"
                      containerClassName="max-w-[140px]"
                    />
                  </div>
                </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                <button
                  onClick={() => handleUndo([item.id])}
                  className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                  title="Undo Individual"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDismiss([item.id])}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Dismiss Individual"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          })}
          {filteredAutoProcessed.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              {searchQuery ? 'No matching corrections found.' : 'No auto-processed corrections to review.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
