import React from 'react';
import { TagDictionaryTab } from './TagDictionaryTab';

export default function TagDatabaseView() {
  return (
    <div className="flex flex-col h-full bg-white w-full relative">
      <div className="flex items-start justify-between mb-2 pb-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-1">
            Tag Database
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Explore standard tags, build dynamic tags, and reference helpful imports.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <TagDictionaryTab />
      </div>
    </div>
  );
}
