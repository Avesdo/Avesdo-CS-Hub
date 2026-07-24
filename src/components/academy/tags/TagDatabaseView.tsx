import React, { useState } from 'react';
import TagDictionaryTab from './TagDictionaryTab';
import InteractiveBuilderModal from './InteractiveBuilderModal';
import { Wand2 } from 'lucide-react';

export default function TagDatabaseView() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white w-full relative">
      <div className="flex items-start justify-between mb-2 pb-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Tag Database
          </h2>
          <p className="text-slate-500 text-sm">
            Explore standard tags, build dynamic tags, and reference helpful imports.
          </p>
        </div>
        
        <button
          onClick={() => setIsBuilderOpen(true)}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
        >
          <Wand2 className="w-4 h-4" />
          Tag Builder <span className="opacity-70 text-xs font-normal ml-1">(Coming Soon)</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <TagDictionaryTab />
      </div>

      <InteractiveBuilderModal 
        isOpen={isBuilderOpen} 
        onClose={() => setIsBuilderOpen(false)} 
      />
    </div>
  );
}
