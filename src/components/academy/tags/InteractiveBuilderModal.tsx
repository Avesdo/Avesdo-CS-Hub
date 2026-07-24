import React from 'react';
import { Wand2, X } from 'lucide-react';

interface InteractiveBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InteractiveBuilderModal({ isOpen, onClose }: InteractiveBuilderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wand2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Interactive Tag Builder</h2>
              <p className="text-sm text-slate-500">Coming soon</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
            <Wand2 className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Under Construction</h3>
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
            We are completely redesigning the Interactive Builder to provide a seamless, step-by-step wizard for constructing complex logic and arithmetic tags. Stay tuned!
          </p>
          <button
            onClick={onClose}
            className="mt-8 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            Return to Dictionary
          </button>
        </div>
      </div>
    </div>
  );
}
