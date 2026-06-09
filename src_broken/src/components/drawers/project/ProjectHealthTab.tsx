"import React, { useState, useEffect, useRef } from 'react';\nimport { ChevronDown, Activity } from 'lucide-react';\nimport { updateProjectRecord, addAutoLog } from '../../../api/dbService';\nimport { calculateProjectHealth } from '../../../utils/scoringUtils';\nimport { useAppState } from '../../../context/AppStateContext';\n\ninterface ProjectHealthTabProps {\n  project: any;\n}\n\nconst pt_features = ['Contracts', 'Inventory', 'Pricing', 'Deposits', 'Payments', 'Allocations', 'Workflows', 'Reporting'];\n\nexport default function ProjectHealthTab({ project }: ProjectHealthTabProps) {\n  const [csatMenuOpen, setCsatMenuOpen] = useState(false);\n  const csatRef = useRef<HTMLDetailsElement>(null);\n  const popRef = useRef<HTMLDivElement>(null);\n  \n  const { settings, user } = useAppState();\n\n  const fLen = Array.isArray(project?.features) ? project.features.length : 0;\n  const fTotal = Array.isArray(settings?.features) && settings?.features.length > 0 ? settings.features.length : pt_features.length;\n  \n  const healthResult = calculateProjectHealth(project, settings);\n\n  const fPct = healthResult.featAdoption;\n  const opVal = healthResult.opActivity;\n  const usrVal = healthResult.userVol;\n  const csatVal = healthResult.csat;\n\n  const getScoreColor = (val: number | string) => {\n      if (typeof val !== 'number') return 'text-slate-400';\n      if (val >= 80) return 'text-lime-600';\n      if (val >= 50) return 'text-orange-500';\n      return 'text-red-500';\n  };\n\n  const getBarColor = (val: number | string) => {\n      if (typeof val !== 'number') return 'bg-slate-200';\n      if (val >= 80) return 'bg-lime-500';\n      if (val >= 50) return 'bg-orange-400';\n      return 'bg-red-500';\n  };\n\n  useEffect(() => {\n    const handleClickOutside = (event: MouseEvent) => {\n      if (popRef.current && !popRef.current.contains(event.target as Node)) {\n        setCsatMenuOpen(false);\n      }\n    };\n    const handleKeyDown = (event: KeyboardEvent) => {\n      if (event.key === 'Escape' && csatMenuOp
<truncated 8804 bytes>
import { updateProjectRecord, addAutoLog, addProjectAutoLog } from '../../../api/dbService';
        <Activity className="w-6 h-6 shrink-0 text-muted-foreground mb-1" />
        <span>No active data to score.</span>
        <span className="font-normal text-xs max-w-xs">Metrics will automatically calculate once the onboarding project is released.</span>
      </div>
  if (project?.projectStatus === 'Onboarding' || project?.status === 'Onboarding') {
    return (
      <div className="bg-muted/50 text-muted-foreground border border-border rounded-xl px-6 py-4 text-sm font-semibold flex flex-col items-center gap-2 text-center mt-4 mx-4">
        <Activity className="w-6 h-6 shrink-0 text-muted-foreground mb-1" />
        <span>No active data to score.</span>
        <span className="font-normal text-xs max-w-xs">Metrics will automatically calculate once the onboarding project is released.</span>
      </div>
    );
  }

  const isClosed = project?.projectStatus === 'Closed' || project?.projectStatus === 'Completed' || project?.projectStatus === 'Cancelled' || project?.projectStatus === 'Churned';
  if (isClosed) {
    return (
      <div className="bg-muted/50 text-muted-foreground border border-border rounded-xl px-6 py-4 text-sm font-semibold flex flex-col items-center gap-2 text-center mt-4 mx-4">
        <Activity className="w-6 h-6 shrink-0 text-muted-foreground mb-1" />
        <span>No active data to score.</span>
    return (
      <div className="bg-muted/50 text-muted-foreground border border-border rounded-xl px-6 py-4 text-sm font-semibold flex flex-col sm:flex-row items-center sm:items-start gap-3">
        <Activity className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p>No active data to score.</p>
          <p className="text-xs font-medium mt-0.5 opacity-80">Metrics will automatically calculate once the onboarding project is released.</p>
        </div>
      </div>
    );
      await updateProjectRecord({ ...project, csat: val }, {
        successMsg: `Onboarding CSAT successfully updated for '${project.name}'.`,
        errorMsg: `Failed to update Onboarding CSAT for '${project.name}'.`
      });
      await addProjectAutoLog(project.id, `CSAT changed from ${oldVal} to ${val || 'None'}`, user?.name || 'System');