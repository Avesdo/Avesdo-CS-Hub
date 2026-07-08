import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { ArrowLeft } from 'lucide-react';
import KnowledgeCheckGenerator from './KnowledgeCheckGenerator';
import KnowledgeCheckResults from './KnowledgeCheckResults';
import QuizListDashboard from './QuizListDashboard';
import { useAcademyStore } from '../../store/useAcademyStore';

export default function KnowledgeCheckAdminHub() {
  const { selectedQuizId, setSelectedQuizId } = useAcademyStore();

  if (!selectedQuizId) {
    return <QuizListDashboard />;
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="mb-6 flex flex-col gap-4">
        <button
          onClick={() => setSelectedQuizId(null)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Knowledge Check Details
          </h2>
          <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">
            Create and edit knowledge checks or review team results.
          </p>
        </div>
      </div>

      <Tabs.Root defaultValue="manage" className="flex flex-col flex-1 min-h-0">
        <Tabs.List className="flex items-center gap-6 border-b border-slate-200 mb-6 shrink-0">
          <Tabs.Trigger
            value="manage"
            className="px-1 py-3 text-sm font-medium text-slate-500 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary hover:text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            Manage
          </Tabs.Trigger>
          <Tabs.Trigger
            value="results"
            className="px-1 py-3 text-sm font-medium text-slate-500 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary hover:text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            Results
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content
          value="manage"
          className="flex-1 min-h-0 focus:outline-none bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden flex flex-col"
        >
          <KnowledgeCheckGenerator />
        </Tabs.Content>

        <Tabs.Content
          value="results"
          className="flex-1 min-h-0 focus:outline-none bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden flex flex-col"
        >
          <KnowledgeCheckResults />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
} // Trigger HMR
