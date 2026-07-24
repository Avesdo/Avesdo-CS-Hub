import React from 'react';
import TagDatabaseView from '../components/academy/tags/TagDatabaseView';

export default function TagDatabase() {
  return (
    <div className="flex flex-1 h-full w-full overflow-hidden bg-white">
      <div className="flex w-full h-full">
        {/* MAIN CONTENT AREA */}
        <div className="flex-1 bg-white relative flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="px-10 pt-8 pb-8 h-full overflow-hidden flex flex-col">
              <TagDatabaseView />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
