import React, { useState, useEffect } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { AcademySidebar } from '../components/academy/AcademySidebar';
import KnowledgeCheckRouter from '../components/academy/KnowledgeCheckRouter';
import { useAcademyStore } from '../store/useAcademyStore';
import { useAppStore } from '../store/useAppStore';

export default function Academy() {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('manage_academy');
  const [activeTab, setActiveTab] = useState('knowledge-checks');
  const { fetchQuizzes } = useAcademyStore();
  const { user } = useAppStore();

  useEffect(() => {
    fetchQuizzes(canManage, user?.uid);
  }, [fetchQuizzes, canManage, user?.uid]);

  return (
    <div className="flex flex-1 h-full w-full overflow-hidden bg-white">
      <div className="flex w-full h-full">
        <AcademySidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 bg-white relative flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden px-10 pt-8 pb-0 min-h-0">
            {activeTab === 'knowledge-checks' && <KnowledgeCheckRouter />}
          </div>
        </div>
      </div>
    </div>
  );
}
