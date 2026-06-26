import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Undo2, CheckSquare, Square, Trash2, Search, ArrowRight, Building2, Home, Briefcase, User, CheckCircle2 } from 'lucide-react';
import { db } from '../../api/firebase';
import { updateDoc, doc, writeBatch } from 'firebase/firestore';
import { toast } from '../../utils/toast';
import { TruncatedText } from '../ui/TruncatedText';
import { Tooltip } from '../ui/Tooltip';

interface AutoProcessedModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: any | null;
  onUpdate: () => void;
}

export function AutoProcessedModal({ isOpen, onClose, log, onUpdate }: AutoProcessedModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelected(new Set());
      setSearchQuery('');
    }
  }, [isOpen, log]);

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
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-2xl max-h-[85vh] bg-white flex flex-col rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-[130] overflow-hidden outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-300">
          
          {/* Standard Grey Header */}
          <div className="bg-slate-50 border-b border-slate-100 px-6 pt-5 pb-5 flex flex-col gap-4 sticky top-0 z-40 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Auto-Processed Log
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Review system-mapped aliases for {log?.entityName || 'this upload'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search raw values or targets..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {selected.size > 0 && (
                <div className="flex items-center gap-3 bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                  <span className="text-xs font-bold text-primary">
                    {selected.size} selected
                  </span>
                  <div className="flex items-center gap-2 border-l border-primary/10 pl-3">
                    <button
                      disabled={isProcessing}
                      onClick={() => handleUndo(Array.from(selected))}
                      className="px-3 py-1.5 flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[11px] font-bold rounded-lg shadow-sm disabled:opacity-50 transition-all active:scale-95"
                    >
                      <Undo2 className="w-3 h-3" /> Undo
                    </button>
                    <button
                      disabled={isProcessing}
                      onClick={() => handleDismiss(Array.from(selected))}
                      className="px-3 py-1.5 flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 text-[11px] font-bold rounded-lg shadow-sm disabled:opacity-50 transition-all active:scale-95"
                    >
                      <Trash2 className="w-3 h-3" /> Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-thin-scroll bg-slate-50/30">
            <div className="p-6">
              {/* Select All Row */}
              {filteredAutoProcessed.length > 0 && (
                <div className="flex items-center px-4 mb-3">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    Select All
                  </button>
                </div>
              )}

              <div className="grid gap-3">
                {filteredAutoProcessed.map((item: any) => {
                  const isUserMapping = 
                    item.contextName === 'Satisfaction Report' || 
                    item.contextName === 'Happyfox Support CSAT' ||
                    (log?.entityName || '').includes('Satisfaction Report') ||
                    (log?.entityName || '').includes('Support CSAT');

                  const isSelected = selected.has(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white border rounded-xl shadow-sm transition-all duration-200 group relative ${isSelected ? 'border-primary shadow-md' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}
                    >
                      {/* Left: Checkbox and Details */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => toggleSelect(item.id)}
                          className="flex-shrink-0 text-slate-300 hover:text-primary transition-colors focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                        
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Raw Value */}
                          <div className="flex items-center flex-1 min-w-0">
                            <TruncatedText
                              text={item.rawName}
                              className="text-[13px] font-bold text-slate-800"
                            />
                          </div>

                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                          {/* Target Value */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Tooltip
                              content={
                                isUserMapping
                                  ? 'User to Client Mapping'
                                  : item.type.charAt(0).toUpperCase() + item.type.slice(1)
                              }
                            >
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 
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
                              text={item.targetName}
                              className="text-[13px] font-medium text-slate-600"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Individual Actions */}
                      <div className="flex items-center gap-1.5 mt-2 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 sm:ml-3">
                        <button
                          onClick={() => handleUndo([item.id])}
                          className="flex items-center justify-center w-8 h-8 bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg transition-all shadow-sm active:scale-95"
                          title="Undo"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDismiss([item.id])}
                          className="flex items-center justify-center w-8 h-8 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 rounded-lg transition-all shadow-sm active:scale-95"
                          title="Dismiss"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAutoProcessed.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-lg font-bold text-slate-700">All Caught Up</p>
                  <p className="text-sm font-medium text-slate-400 mt-1 max-w-sm text-center">
                    {searchQuery ? 'No matching corrections found.' : 'No auto-processed corrections to review.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
