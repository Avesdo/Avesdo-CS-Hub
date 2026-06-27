import React, { useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Network, Trash2 } from 'lucide-react';
import { DataIntakePipeline } from './DataIntakePipeline';

interface DataIntakePipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPendingCountChange?: (count: number) => void;
  pendingCount?: number;
}

export const DataIntakePipelineModal: React.FC<DataIntakePipelineModalProps> = ({
  isOpen,
  onClose,
  onPendingCountChange,
  pendingCount = 0,
}) => {
  const [clearAllFn, setClearAllFn] = useState<(() => Promise<void>) | null>(null);

  const handleBindClearAll = useCallback((fn: () => Promise<void>) => {
    setClearAllFn(() => fn);
  }, []);
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[101] w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-sm border border-amber-200">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Action Required: Map Data
                  {pendingCount > 0 && (
                    <span className="flex h-5 items-center justify-center rounded-full bg-amber-500 px-2 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                      {pendingCount}
                    </span>
                  )}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500 mt-0.5 font-medium">
                  Review and manually map unrecognized incoming data
                </Dialog.Description>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {clearAllFn && pendingCount > 0 && (
                <button
                  onClick={() => clearAllFn()}
                  className="group flex items-center justify-center h-8 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all focus:outline-none focus:ring-2 focus:ring-red-200 px-2 hover:px-3"
                  aria-label="Clear All Pending"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold overflow-hidden w-0 opacity-0 group-hover:w-[100px] group-hover:opacity-100 transition-all whitespace-nowrap text-left pl-0 group-hover:pl-1.5">
                    Clear All
                  </span>
                </button>
              )}
              <div className="w-px h-5 bg-slate-200 mx-1"></div>
              <Dialog.Close asChild>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 bg-slate-50/50 overflow-y-auto flex-1 custom-thin-scroll">
            <DataIntakePipeline
              onPendingCountChange={onPendingCountChange}
              onBindClearAll={handleBindClearAll}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
