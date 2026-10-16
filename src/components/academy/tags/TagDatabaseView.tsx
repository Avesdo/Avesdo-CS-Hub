import React from 'react';
import { TagDictionaryTab } from './TagDictionaryTab';

export default function TagDatabaseView() {
  return (
    <div className="flex flex-col h-full bg-white w-full relative">
      <div className="flex-1 overflow-hidden relative">
        <TagDictionaryTab />
      </div>
    </div>
  );
}
