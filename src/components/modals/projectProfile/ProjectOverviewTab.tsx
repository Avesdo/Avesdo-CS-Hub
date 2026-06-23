import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, CheckSquare } from 'lucide-react';
import { updateProjectRecord } from '../../../api/dbService';
import { useAppStore } from '../../../store/useAppStore';
import ProjectFeaturesTab from './ProjectFeaturesTab';

interface ProjectOverviewTabProps {
  project: any;
}

export default React.memo(function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  const user = useAppStore(state => state.user);

  const handleUpdate = async (field: string, value: any) => {
    if (!project || project[field] === value) return;
    try {
      const updates: any = { [field]: value };
      const actionLog = `Avesdo ID updated to ${value}`;
      await updateProjectRecord(
        { ...project, ...updates },
        { successMsg: `Updates to '${project.name}' saved successfully.`, errorMsg: `Failed to save updates.` },
        actionLog,
        user?.name
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-gradient-to-br from-white to-slate-50/80 border border-slate-200/80 rounded-3xl shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all duration-500 hover:border-emerald-200/60">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all duration-500 group-hover:bg-emerald-500/10 group-hover:scale-110"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Features</h3>
          </div>
          <ProjectFeaturesTab project={project} />
        </div>
      </div>
    </div>
  );
});
