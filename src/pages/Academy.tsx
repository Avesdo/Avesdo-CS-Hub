import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

import KnowledgeCheckRouter from '../components/academy/KnowledgeCheckRouter';
import { useAcademyStore } from '../store/useAcademyStore';
import { useAppStore } from '../store/useAppStore';
import TagDatabaseView from '../components/academy/tags/TagDatabaseView';

export default function Academy() {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('manage_academy');
  const [searchParams] = useSearchParams();

  // Derive active tab directly from URL to support external navigation
  const activeTab = searchParams.get('tab') || 'tag-database';

  const { fetchQuizzes } = useAcademyStore();
  const { user, settings } = useAppStore();

  useEffect(() => {
    if (!user || !settings) return;
    fetchQuizzes(canManage, user?.uid);
  }, [fetchQuizzes, canManage, user?.uid, settings]);

  return (
    <div className="flex flex-1 h-full w-full overflow-hidden bg-white">
      <div className="flex w-full h-full">
        {/* MAIN CONTENT AREA */}
        <div className="flex-1 bg-white relative flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {activeTab === 'knowledge-checks' && (
              <div className="px-10 pt-8 pb-0 h-full overflow-y-auto">
                <KnowledgeCheckRouter />
              </div>
            )}
            {activeTab === 'tag-database' && (
              <div className="px-10 pt-8 pb-8 h-full overflow-hidden flex flex-col">
                <TagDatabaseView />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
