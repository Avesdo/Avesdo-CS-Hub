import React, { useState, useEffect } from 'react';
import { X, Undo2, CheckSquare, Square, Trash2 } from 'lucide-react';
import { db } from '../../api/firebase';
import { updateDoc, doc, writeBatch } from 'firebase/firestore';
import { toast } from '../../utils/toast';

interface AutoProcessedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  log: any | null;
  onUpdate: () => void;
}

export function AutoProcessedDrawer({ isOpen, onClose, log, onUpdate }: AutoProcessedDrawerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelected(new Set());
    }
  }, [isOpen, log]);

  if (!isOpen || !log) return null;

  const autoProcessed = log.autoProcessed || [];
  const allSelected = autoProcessed.length > 0 && selected.size === autoProcessed.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(autoProcessed.map((i: any) => i.id)));
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
      autoProcessed: updatedList
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
    <div className="fixed inset-0 z-[120] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-[500px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-[130]">
        
        {/* Two-tone aesthetic header with blurred gradient aura */}
        <div className="relative px-6 py-5 border-b border-slate-200 flex flex-col bg-slate-50 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800">Auto-Processed Corrections</h2>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors bg-white/50 border border-slate-200/50">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="relative z-10 text-sm text-slate-500 mt-3">Select items to undo or dismiss from this log.</p>
        </div>

        {/* Bulk Actions Bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
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
              className="px-3 py-1.5 flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Undo2 className="w-4 h-4" />
              Undo Selection
            </button>
            <button
              disabled={isProcessing || selected.size === 0}
              onClick={() => handleDismiss(Array.from(selected))}
              className="px-3 py-1.5 flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 text-sm font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Dismiss
            </button>
          </div>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-thin-scroll bg-slate-50/50">
          {autoProcessed.map((item: any) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 shadow-sm hover:border-primary/30 transition-all group">
              <button onClick={() => toggleSelect(item.id)} className="mt-1 flex-shrink-0 text-slate-400 hover:text-primary">
                {selected.has(item.id) ? (
                  <CheckSquare className="w-5 h-5 text-primary" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold capitalize tracking-wider text-slate-400">
                      {item.type} mapping
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 mt-0.5 break-words">
                      "{item.rawName}"
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                  Automatically mapped to <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">"{item.targetName}"</span>
                </p>
              </div>
            </div>
          ))}
          {autoProcessed.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              No more auto-processed corrections left to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
