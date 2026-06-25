import { Settings } from '../types';

export interface ProjectHealthResult {
totalScore: number | 'N/A';
opActivity: number;
featAdoption: number;
userVol: number;
csat: number | 'N/A';
}

export interface ClientHealthResult {
totalScore: number | 'N/A';
financial: number;
engagement: number;
utilization: number;
experience: number;
hasSuspended: boolean;
details: {
invoiceStatus: string;
avgOpActivity: number;
avgUserVol: number;
avgProjectCsat: number | 'N/A';
supportCsat: number | 'N/A';
};
}

export function calculateProjectHealth(
project: any,
settings: Settings | null
): ProjectHealthResult {
const defaultResult: ProjectHealthResult = {
totalScore: 'N/A',
opActivity: 0,
featAdoption: 0,
userVol: 0,
csat: 'N/A',
};

if (!project || !settings) return defaultResult;

// Calculate raw sub-pillars (clamped to 100 max)
const rawOp =
typeof project.opActivity === 'number'
? project.opActivity
: typeof project.score_op === 'number'
? project.score_op
: 0;
const rawUsr =
typeof project.userVol === 'number'
? project.userVol
: typeof project.score_usr === 'number'
? project.score_usr
: 0;

const opActivity = Math.min(rawOp, 100);
const userVol = Math.min(rawUsr, 100);

// Feature Adoption
const activeFeatures = Array.isArray(project.features) ? project.features.length : 0;
const totalFeatures =
Array.isArray(settings.features) && settings.features.length > 0 ? settings.features.length : 1;
const featAdoption = Math.round((activeFeatures / totalFeatures) * 100);

// CSAT
let csat: number | 'N/A' = 'N/A';
if (project.csat === 'Satisfied') csat = 100;
else if (project.csat === 'Neutral') csat = 50;
else if (project.csat === 'Dissatisfied') csat = 0;

// Math - Weights
const weights = settings.scoring?.weights || {
opActivity: 40,
featAdoption: 30,
userVol: 20,
csat: 10,
};

let totalScore: number | 'N/A' = 0;
let totalWeight = 0;

totalScore += opActivity * (weights.opActivity / 100);
totalWeight += weights.opActivity;

totalScore += featAdoption * (weights.featAdoption / 100);
totalWeight += weights.featAdoption;

totalScore += userVol * (weights.userVol / 100);
totalWeight += weights.userVol;

if (csat !== 'N/A') {
totalScore += csat * (weights.csat / 100);
totalWeight += weights.csat;
}

// Dynamic Re-weighting
if (totalWeight > 0) {
totalScore = Math.round(((totalScore as number) / totalWeight) * 100);
} else {
totalScore = 'N/A';
}

if (
project.projectStatus === 'Onboarding' ||
project.projectStatus === 'Closed' ||
project.projectStatus === 'Completed' ||
project.projectStatus === 'Cancelled' ||
project.projectStatus === 'Churned'
) {
totalScore = 'N/A';
}

return {
totalScore,
opActivity,
featAdoption,
userVol,
csat,
};
}

export function calculateClientHealth(
client: any,
projects: any[],
settings: Settings | null
): ClientHealthResult {
const defaultResult: ClientHealthResult = {
totalScore: 'N/A',
financial: 0,
engagement: 0,
utilization: 0,
experience: 0,
hasSuspended: false,
details: {
invoiceStatus: 'Current',
avgOpActivity: 0,
avgUserVol: 0,
avgProjectCsat: 'N/A',
supportCsat: 'N/A',
},
};

if (!client || !settings) return defaultResult;

const clientProjects = projects.filter(
(p) =>
p.clientIds?.includes(client.clientId || client.id) ||
p.clients?.includes(client.companyName || client.name)
);
const activeProjects = clientProjects.filter(
(p) =>
p.projectStatus !== 'Onboarding' &&
p.projectStatus !== 'Closed' &&
p.projectStatus !== 'Completed' &&
p.projectStatus !== 'Cancelled' &&
p.projectStatus !== 'Churned'
);
const hasSuspended = clientProjects.some((p) => p.projectStatus === 'Suspended');

// Financial Standing
let financial = 100; // Default to Current
const invoiceStatus = client.invoiceStatus || '';
if (hasSuspended || invoiceStatus === 'Suspended') {
financial = 0;
} else if (invoiceStatus === 'Overdue 60+ Days' || invoiceStatus === 'Overdue 60+') {
financial = 0;
} else if (invoiceStatus === 'Overdue 30 Days' || invoiceStatus === 'Overdue 30') {
financial = 50;
}

if (activeProjects.length === 0 && !hasSuspended) {
return { ...defaultResult, financial, hasSuspended };
}

// Gather project scores
let totalOpActivity = 0;
let totalUserVol = 0;
let totalFeatAdoption = 0;
let totalProjectCsat = 0;
let projectCsatCount = 0;

activeProjects.forEach((p) => {
const pHealth = calculateProjectHealth(p, settings);
totalOpActivity += pHealth.opActivity;
totalUserVol += pHealth.userVol;
totalFeatAdoption += pHealth.featAdoption;
if (typeof pHealth.csat === 'number') {
totalProjectCsat += pHealth.csat;
projectCsatCount++;
}
});

const activeCount = activeProjects.length > 0 ? activeProjects.length : 1; // Prevent div by 0

const avgOpActivity = totalOpActivity / activeCount;
const avgUserVol = totalUserVol / activeCount;

// Engagement
const engagement = Math.round((avgOpActivity + avgUserVol) / 2);

// Utilization
const utilization = Math.round(totalFeatAdoption / activeCount);

// Client Experience
const avgProjectCsat = projectCsatCount > 0 ? totalProjectCsat / projectCsatCount : 'N/A';
const supportCsat = typeof client.supportCsat === 'number' ? client.supportCsat : 'N/A';

let experience = 0;
let hasExperience = false;

if (avgProjectCsat !== 'N/A' && supportCsat !== 'N/A') {
experience = Math.round(((avgProjectCsat as number) + (supportCsat as number)) / 2);
hasExperience = true;
} else if (avgProjectCsat !== 'N/A') {
experience = Math.round(avgProjectCsat as number);
hasExperience = true;
} else if (supportCsat !== 'N/A') {
experience = Math.round(supportCsat as number);
hasExperience = true;
}

// Total Score Calculation
const weights = settings.scoring?.clientWeights || {
billing: 15,
engagement: 50,
utilization: 25,
experience: 10,
};

let totalScore: number | 'N/A' = 0;
let totalWeight = 0;

totalScore += financial * (weights.billing / 100);
totalWeight += weights.billing;

totalScore += engagement * (weights.engagement / 100);
totalWeight += weights.engagement;

totalScore += utilization * (weights.utilization / 100);
totalWeight += weights.utilization;

if (hasExperience) {
totalScore += experience * (weights.experience / 100);
totalWeight += weights.experience;
}

if (totalWeight > 0) {
totalScore = Math.round(((totalScore as number) / totalWeight) * 100);
} else {
totalScore = 'N/A';
}

return {
totalScore,
financial,
engagement,
utilization,
experience: hasExperience ? experience : 0, // Fallback purely for display
hasSuspended,
details: {
invoiceStatus,
avgOpActivity: Math.round(avgOpActivity),
avgUserVol: Math.round(avgUserVol),
avgProjectCsat,
supportCsat,
},
};
}

Tracks the volume of unique, authenticated users actively accessing this project.
</span>
</div>
<div className="flex items-center gap-3 shrink-0">
<div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
<div
className={`h-full transition-all ${getBarColor(usrVal)}`}
style={{ width: typeof usrVal === 'number' ? `${Math.min(usrVal, 100)}%` : '0%' }}
></div>
</div>
<span
className={`w-8 text-right font-bold text-xl tabular-nums ${getScoreColor(usrVal)}`}
>
{usrVal}
</span>
<ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
</div>
</summary>
<div className="px-5 pb-5 pt-4 border-t border-border text-sm text-muted-foreground space-y-3 bg-white">
<div className="flex justify-between items-center">
<span>Active Users</span>
<span className="font-semibold text-foreground">
{typeof usrVal === 'number' ? usrVal : 0}
</span>
</div>
</div>
</details>

{/* 5. Expandable: Client Sentiment */}
<details
ref={csatRef}
className="bg-white border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-primary/40 group relative"
>
<summary className="p-5 cursor-pointer outline-none hover:bg-slate-50 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
<div className="flex flex-col pr-4">
<span className="mb-1 text-sm font-bold text-foreground tracking-tight">
Client Sentiment
</span>
<span className="text-xs text-muted-foreground font-medium leading-snug">
Direct client sentiment and satisfaction scoring for this specific implementation.
</span>
</div>
<div className="flex items-center gap-3 shrink-0">
<div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
<div
className={`h-full transition-all ${getBarColor(csatVal)}`}
style={{ width: typeof csatVal === 'number' ? `${csatVal}%` : '0%' }}
></div>
</div>
<span
className={`w-8 text-right font-bold text-xl tabular-nums ${getScoreColor(csatVal)}`}
>
{csatVal}
</span>
<ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
</div>
</summary>
<div className="px-5 pb-5 pt-4 text-sm text-muted-foreground space-y-3 border-t border-border bg-white">
<div className="flex justify-between items-center">
<span className="font-medium text-foreground">Onboarding Sentiment</span>
<div className="flex items-center gap-2">
<span className="font-bold text-foreground">
{project?.onboardingCsat
? `${project.onboardingCsat.score}/100`
: project?.csat || 'No Rating'}
</span>
<button
onClick={() => setShowCsatModal(true)}
className="px-3 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
>
{project?.onboardingCsat ? 'View / Edit' : 'Record Survey'}
</button>
</div>
</div>
</div>
</details>
{showCsatModal && (
<OnboardingCsatModal project={project} onClose={() => setShowCsatModal(false)} />
)}
</div>
);
await addAutoLog(cid, `Client profile archived`, user?.name || 'System');
const cProjects = projects.filter((p: any) => p.clientIds?.includes(cid));
for (const p of cProjects)
await addProjectAutoLog(
p.id,
`Client "${client.companyName || client.name}" archived`,
user?.name || 'System',
true
);
const cServices = services.filter((s: any) => s.clientIds?.includes(cid));
for (const s of cServices)
await addServiceAutoLog(
s.id,
`Attached Client "${client.companyName || client.name}" archived`,
user?.name || 'System',
true
);
closeDrawer();
}
}}
className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-red-300 rounded-md text-red-600 bg-white hover:bg-red-50 font-semibold shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
>
<AlertTriangle className="w-4 h-4" /> Confirm Archive
</button>
) : (
<Tooltip content="Archive Client" position="bottom-right">
<button
onClick={() => setIsConfirmingDelete(true)}
className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
>
<Trash2 className="w-5 h-5" />
</button>
</Tooltip>
)}
<Tooltip content="Close Drawer" position="bottom-right">
<button
onClick={closeDrawer}
className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 duration-200"
>
<X className="w-5 h-5" />
</button>
</Tooltip>
</div>
</div>

<div className="bg-slate-50 shrink-0 border-b border-border">
<div role="tablist" className="flex overflow-x-auto px-6 custom-thin-scroll -mb-px">
{tabs.map((tab) => (
<button
key={tab.id}
onClick={() => setActiveTab(tab.id as any)}
data-state={activeTab === tab.id ? 'active' : 'inactive'}
className={`relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all active:scale-95 whitespace-nowrap outline-none ${activeTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-primary/30'}`}
>
{tab.label}
</button>
))}
</div>
</div>

<div className="flex-1 overflow-y-auto p-6 bg-white custom-thin-scroll">
{activeTab === 'health' && <ClientHealthTab client={client} />}
{activeTab === 'trends' && <ClientTrendsTab client={client} />}
{activeTab === 'projects' && <ClientProjectsTab client={client} />}
{activeTab === 'services' && <ClientServicesTab client={client} />}
{activeTab === 'notes' && (
<NotesTab
notes={client?.notes || []}
onSaveNotes={async (updatedNotes) => {
if (!client) return;
await updateClientRecord({ ...client, notes: updatedNotes } as any, {
successMsg: `Note successfully added for '${client.companyName || client.name}'.`,
errorMsg: `Failed to add note for '${client.companyName || client.name}'.`,
});
}}
emptyStateMessage="Be the first to add a note or make changes to generate system logs."
/>
)}
</div>
</div>
</>
>
<Trash2 className="w-5 h-5" />
</button>
</Tooltip>
)}
<Tooltip content="Close Drawer" position="bottom-right">
<button
onClick={closeDrawer}
className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 duration-200"
>
<X className="w-5 h-5" />
</button>
</Tooltip>
</div>
</div>

<div className="bg-slate-50 shrink-0 border-b border-border">
<div role="tablist" className="flex overflow-x-auto px-6 custom-thin-scroll -mb-px">
{tabs.map((tab) => (
<button
key={tab.id}
onClick={() => setActiveTab(tab.id as any)}
data-state={activeTab === tab.id ? 'active' : 'inactive'}
className={`relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all active:scale-95 whitespace-nowrap outline-none ${activeTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-primary/30'}`}
>
{tab.label}
</button>
))}
</div>
</div>

<div className="flex-1 overflow-y-auto p-6 bg-white custom-thin-scroll">
{activeTab === 'overview' && <ProjectOverviewTab project={project} />}
{activeTab === 'health' && <ProjectHealthTab project={project} />}
{activeTab === 'trends' && <ProjectTrendsTab project={project} />}
{activeTab === 'features' && <ProjectFeaturesTab project={project} />}
{activeTab === 'services' && <ProjectServicesTab project={project} />}
{activeTab === 'notes' && (
<NotesTab
notes={project?.notes || []}
onSaveNotes={async (updatedNotes) => {
if (!project) return;
await updateProjectRecord({ ...project, notes: updatedNotes } as any, {
successMsg: `Note successfully added for '${project.name}'.`,
errorMsg: `Failed to add note for '${project.name}'.`,
});
}}
emptyStateMessage="Be the first to add a note to this project."
/>
)}
</div>
</div>
</>
);
}

placeholder="Search sales & marketing clients..."
className="flex-1 bg-transparent border-none outline-none text-sm"
value={clientSearch}
onChange={(e) => setClientSearch(e.target.value)}
autoFocus
/>
</div>
<div className="overflow-y-auto p-1 custom-thin-scroll">
{filteredClients
.filter((c) => c.clientType === 'Sales & Marketing')
.map((c) => {
const isSelected =
project?.salesMarketingIds?.includes(c.clientId || c.id) ||
return (
<button
key={c.clientId || c.id}
onClick={() => toggleClientArrayItem(c.clientId || c.id, c.companyName)}
className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 rounded-md transition-colors"
>
<span className="font-medium">{c.companyName}</span>
{isSelected && <Check className="w-4 h-4 text-primary" />}
</button>
);
})}
</div>
</div>
)}
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="relative popover-container">
<label className="block text-sm font-medium text-muted-foreground mb-1.5">
Manager
</label>
<button
onClick={() => setOpenPop(openPop === 'manager' ? null : 'manager')}
className="w-full flex items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-all duration-200 active:scale-95 hover:bg-slate-50 hover:border-primary/50 focus:outline-none min-h-[38px]"
>
<span className="truncate font-semibold text-foreground">
{project?.assignee || 'Unassigned'}
</span>
<ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
</button>
{openPop === 'manager' && (
<div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white border border-border rounded-lg shadow-xl z-50 p-1">
{settings?.managers?.map((m: any) => (
<button
key={m.name}
onClick={() => {
handleUpdate('assignee', m.name, project?.assignee);
setOpenPop(null);
}}
className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 whitespace-nowrap"
>
{m.name}
</button>
))}
</div>
)}
</div>
</div>
</div>

{/* 3. Workflow States */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-border">
<div className="relative popover-container">
<label className="block text-sm font-medium text-muted-foreground mb-1.5">
Project Status
</label>
<div className="flex">
<button
onClick={() => setOpenPop(openPop === 'status' ? null : 'status')}
className="text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-xl inline-flex [&>span]:whitespace-normal [&>span]:text-left [&>span]:h-auto [&>span]:rounded-xl"
>
{getSettingBadge('statuses', project?.projectStatus || 'Not Set', settings, true)}
</button>
</div>
{openPop === 'status' && (
<div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white border border-border rounded-lg shadow-xl z-50 p-1">
{settings?.statuses?.map((s: any) => (
<button
key={s.name}
onClick={() => {
handleUpdate('projectStatus', s.name, project?.projectStatus);
setOpenPop(null);
}}
className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 whitespace-nowrap"
>
{getSettingBadge('statuses', s.name, settings, true)}
</button>
))}
</div>
)}
</div>
<div className="relative popover-container">
<label className="block text-sm font-medium text-muted-foreground mb-1.5">
Schedule Status
</label>
<div className="flex">
<button
onClick={() => setOpenPop(openPop === 'timeline' ? null : 'timeline')}
className="text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-xl inline-flex [&>span]:whitespace-normal [&>span]:text-left [&>span]:h-auto [&>span]:rounded-xl"
>
{getSettingBadge('timelines', project?.timelineStatus || 'Not Set', settings, true)}
</button>
</div>
{openPop === 'timeline' && (
<div className="absolute top-full left-0 mt-2 min-w-[220px] bg-white border border-border rounded-lg shadow-xl z-50 p-1">
{settings?.timelines?.map((t: any) => (
<button
key={t.name}
onClick={() => {
handleUpdate('timelineStatus', t.name, project?.timelineStatus);
setOpenPop(null);
}}
className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 whitespace-nowrap"
>
{getSettingBadge('timelines', t.name, settings, true)}
</button>
))}
</div>
)}
</div>

<div className="relative popover-container">
<label className="block text-sm font-medium text-muted-foreground mb-1.5">
Implementation Status
</label>
<div className="flex">
<button
onClick={() => setOpenPop(openPop === 'phase' ? null : 'phase')}
className="text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-xl inline-flex [&>span]:whitespace-normal [&>span]:text-left [&>span]:h-auto [&>span]:rounded-xl"
>
{getSettingBadge('phases', project?.onboardingPhase || 'Not Set', settings, true)}
</button>
</div>
{openPop === 'phase' && (
<div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white border border-border rounded-lg shadow-xl z-50 p-1">
{settings?.phases?.map((p: any) => (
<button
key={p.name}
onClick={() => {
handleUpdate('onboardingPhase', p.name, project?.onboardingPhase);
setOpenPop(null);
}}
className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 whitespace-nowrap"
>
{getSettingBadge('phases', p.name, settings, true)}
</button>
))}
</div>
)}
</div>
</div>

{/* 4. Resources */}
<div className="flex flex-col gap-4 pb-2">
<div>
<label className="block text-sm font-medium text-muted-foreground mb-1.5 mt-4">
Avesdo Development ID
</label>
<input
type="text"
className="w-full min-w-0 rounded-md border border-input bg-white px-3 py-1.5 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[38px] text-sm font-semibold transition-all"
defaultValue={project?.developmentId || ''}
onBlur={(e) => handleUpdate('developmentId', e.target.value, project?.developmentId)}
onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
placeholder="e.g. 123"
/>
</div>
<div>
<label className="block text-sm font-medium text-muted-foreground mb-1.5">
Deliverables Checklist
</label>
{editingChecklist ? (
<input
type="url"
autoFocus
className="w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[38px] text-sm transition-all text-blue-600 hover:text-blue-800 underline"
defaultValue={project?.checklistUrl || ''}
onBlur={(e) => {
handleUpdate('checklistUrl', e.target.value, project?.checklistUrl);
setEditingChecklist(false);
}}
onKeyDown={(e) => {
if (e.key === 'Enter') {
handleUpdate('checklistUrl', e.currentTarget.value, project?.checklistUrl);
setEditingChecklist(false);
}
if (e.key === 'Escape') setEditingChecklist(false);
}}
placeholder="https://"
/>
) : (
<div className="flex items-center gap-3 w-full min-h-[38px] rounded-md border border-input bg-white px-3 py-2 shadow-sm text-sm transition-all group">
<LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
{project?.checklistUrl ? (
<div className="flex-1 font-medium">Deliverables Checklist</div>
) : (
<span className="flex-1 text-muted-foreground italic">None</span>
)}
<div className="flex items-center gap-2">
{project?.checklistUrl && (
<>
<a
href={
project.checklistUrl.match(/^https?:\/\//)
? project.checklistUrl
: `https://${project.checklistUrl}`
}
target="_blank"
rel="noreferrer"
className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
>
Open Link <ExternalLink className="w-3.5 h-3.5" />
</a>
<Tooltip content="Copy URL">
<button
onClick={copyChecklistUrl}
className="p-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md transition-colors shadow-sm"
>
<Copy className="w-4 h-4" />
</button>
</Tooltip>
</>
)}
<Tooltip content="Edit URL">
<button
onClick={() => setEditingChecklist(true)}
className="p-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md transition-colors shadow-sm"
>
<Edit2 className="w-4 h-4" />
</button>
</Tooltip>
</div>
</div>
)}
</div>
</div>

{/* 5. KYC & Onboarding Details */}
<div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all mt-4">
<div className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 border-b border-slate-100">
<div
className="flex items-center gap-3 cursor-pointer"
onClick={() => setIsKycOpen(!isKycOpen)}
>
<div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
<FileText className="w-4 h-4 text-blue-600" />
</div>
<div className="text-left">
<h4 className="text-sm font-semibold text-slate-800">KYC & Onboarding Details</h4>
<p className="text-xs text-slate-500">
Foundational project knowledge and setup requirements
</p>
</div>
</div>
<div className="flex items-center gap-2">
{isKycOpen && !isKycEditing && (
<button
onClick={(e) => {
e.stopPropagation();
setIsKycEditing(true);
setKycDraft(project?.kycDetails || '');
}}
className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
>
<Pencil className="w-3.5 h-3.5" /> Edit
</button>
)}
{isKycOpen && isKycEditing && (
<button
onClick={(e) => {
e.stopPropagation();
handleSaveKyc();
}}
className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
>
<Check className="w-3.5 h-3.5" /> Save
</button>
)}
<button
onClick={() => setIsKycOpen(!isKycOpen)}
className="p-1.5 hover:bg-slate-200 rounded-md transition-colors ml-1"
>
<ChevronDown
className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isKycOpen ? 'rotate-180' : ''}`}
/>
</button>
</div>
</div>

{isKycOpen && (
<div className="p-0 border-t border-slate-200 bg-white">
{isKycEditing ? (
<div className="bg-slate-50 min-h-[400px]">
<RichTextEditor
content={kycDraft}
onChange={setKycDraft}
placeholder="Paste KYC data here..."
/>
</div>
) : (
<div className="p-5 max-h-[500px] overflow-y-auto custom-thin-scroll bg-white">
{project?.kycDetails ? (
project.kycDetails.includes('<p>') ? (
<div
className="prose prose-sm prose-slate max-w-none text-slate-700 leading-relaxed font-medium"
dangerouslySetInnerHTML={{ __html: project.kycDetails }}
/>
) : (
<div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-medium">
{project.kycDetails}
</div>
)
) : (
<div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
<FileText className="w-8 h-8 mb-2 opacity-20" />
<p className="text-sm">No KYC details have been added yet.</p>
<button
onClick={() => setIsKycEditing(true)}
className="mt-3 text-sm text-blue-600 hover:underline font-semibold"
>
Add Details
</button>
</div>
)}
</div>
)}
</div>
)}
</div>
</div>
);
});

<div>
<p className="text-sm text-slate-500 mb-1">
Incoming Raw String:{' '}
<span className="font-bold text-slate-900 px-1 py-0.5 bg-slate-100 rounded border">
"{alias.rawName}"{' '}
{alias.contextName && (
<span className="text-slate-500 font-normal">
({alias.contextName})
</span>
)}
</span>
</p>
<div className="flex items-center gap-2">
<span className="text-sm text-slate-500">
Gemini Suggests Merge With:
</span>
<span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
{(() => {
if (alias.type === 'client') {
const match = clients.find(
(c) => c.clientId === alias.targetId || c.id === alias.targetId
);
return match ? match.companyName : '[Create New Entity]';
}
if (alias.type === 'project') {
const match = projects.find((p) => p.id === alias.targetId);
return match ? match.name : '[Create New Entity]';
}
if (alias.type === 'service') {
const match = services.find((s) => s.id === alias.targetId);
return match ? match.name : '[Create New Entity]';
}
return alias.targetId;
})()}
</span>
</div>
{isCorrecting && (
<div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
<SearchableSelect
value={correctionTargetId}
onChange={setCorrectionTargetId}
options={
alias.type === 'client'
? clients.map((c) => ({
label: c.companyName || c.name || '',
value: c.clientId || (c.id as string),
}))
: alias.type === 'project'
? projects.map((p) => ({ label: p.name || '', value: p.id }))
: alias.type === 'service'
? services.map((s) => ({
label: s.name || '',
value: s.id,
}))
: []
}
placeholder={`Select correct ${alias.type}...`}
className="flex-1 min-w-[200px]"
/>
<div className="flex items-center gap-2 mt-2 sm:mt-0">
<button
onClick={() => {
if (correctionTargetId)
handleResolveAlias(alias.id, 'correct', correctionTargetId);
}}
className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
disabled={!correctionTargetId}
>
Save
</button>
<button
onClick={() => {
setCorrectingAliasId(null);
setCorrectionTargetId('');
}}
className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
>
Cancel
</button>
</div>
</div>
)}
</div>
</div>
{!isCorrecting && (
<div className="flex flex-wrap items-center gap-2 shrink-0 justify-end w-full sm:w-auto mt-3 sm:mt-0">
<button
onClick={() => setCorrectingAliasId(alias.id)}
className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shadow-sm"
>
<Edit className="w-3.5 h-3.5" /> Correct
</button>
<button
onClick={() => {
const prefix =
alias.type === 'client'
? 'C'
: alias.type === 'project'
? 'P'
: 'S';
handleResolveAlias(
alias.id,
'create_new',
`${prefix}-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`
);
}}
className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors shadow-sm"
>
<Plus className="w-3.5 h-3.5" /> Create New
</button>
<button
onClick={() => handleResolveAlias(alias.id, 'reject')}
className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors shadow-sm"
>
<XCircle className="w-3.5 h-3.5" /> Ignore
</button>
<button
onClick={() => handleResolveAlias(alias.id, 'approve')}
className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 border border-emerald-600 text-white hover:bg-emerald-600 transition-colors shadow-sm"
>
<CheckCircle2 className="w-3.5 h-3.5" /> Approve
</button>
</div>
)}
</div>
);
})}
</div>
)}
</div>
</div>
</div>
);
};

return (
<div className="flex flex-1 overflow-hidden flex-col bg-white p-6">
<div className="flex flex-1 min-h-0 w-full bg-white border border-border rounded-xl shadow-sm overflow-hidden flex-col md:flex-row">
<div className="w-full md:w-72 bg-slate-50 border-b md:border-b-0 md:border-r border-border shrink-0 p-4 flex flex-col gap-1 overflow-y-auto custom-thin-scroll">
{[
{ id: 'pipeline', label: 'Data Pipeline', icon: Database },
{ id: 'audit', label: 'Audit Trail', icon: History },
{ id: 'archives', label: 'Archives', icon: ArchiveRestore },
].map((tab) => (
<button
key={tab.id}
onClick={() => setActiveTab(tab.id as any)}
className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all active:scale-95  w-full text-left outline-none ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-slate-200/50 hover:text-foreground'}`}
>
<div className="flex items-center gap-3">
<tab.icon className="w-4 h-4 opacity-70" /> {tab.label}
</div>
{tab.id === 'intake' && pendingAliases.length > 0 && (
<span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
{pendingAliases.length}
</span>
)}
</button>
))}
</div>

<div className="flex-1 p-6 lg:p-8 bg-white min-w-0 overflow-y-auto custom-thin-scroll relative">
{activeTab === 'pipeline' && (
<div className="space-y-12">
<DataUploader />
<div className="border-t border-slate-100 pt-8 max-w-5xl mx-auto">
{renderIntake()}
</div>
</div>
)}
{activeTab === 'audit' && renderAuditTrail()}
{activeTab === 'archives' && renderArchives()}
</div>
</div>
</div>
);
}

<div className="flex flex-1 min-h-0 w-full bg-white border border-border rounded-xl shadow-sm overflow-hidden flex-col md:flex-row">
<div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-border shrink-0 p-4 flex flex-col gap-1 overflow-y-auto custom-thin-scroll">
{[
{ id: 'org', label: 'Organization', icon: Building2 },
{ id: 'workflow', label: 'Workflow & Status', icon: GitMerge },
{ id: 'products', label: 'Features & Services', icon: Package },
{ id: 'scoring', label: 'Scoring Engine', icon: Calculator },
].map((tab) => (
<button
key={tab.id}
onClick={() => setActiveTab(tab.id as any)}
className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all w-full text-left outline-none ${
activeTab === tab.id
? 'bg-primary/10 text-primary'
: 'text-muted-foreground hover:bg-slate-200/50 hover:text-foreground'
}`}
>
<tab.icon className="w-4 h-4 opacity-70" /> {tab.label}
</button>
))}
</div>

<div className="flex-1 p-6 md:p-10 overflow-y-auto bg-white custom-thin-scroll">
{activeTab === 'org' && (
<div className="max-w-3xl animate-in fade-in duration-300">
{renderList(
'Account Managers',
'Manage the users who can be assigned to clients and projects.',
'managers'
)}
{renderList('Client Types', 'Classify your clients.', 'clientTypes')}
</div>
)}
{activeTab === 'workflow' && (
<div className="max-w-3xl animate-in fade-in duration-300">
{renderList('Project Status', 'Workflow stages for projects.', 'statuses')}
{renderList(
'Project Delivery Health',
'Delivery statuses for projects.',
'timelines'
)}
{renderList('Implementation Pipeline', 'Milestones for project execution.', 'phases')}
{renderList('Service Outcomes', 'Outcome statuses for services.', 'serviceOutcomes')}
{renderList(
'Fulfillment Status',
'Lifecycle stages for services.',
'serviceStatuses'
)}
</div>
)}
{activeTab === 'products' && (
<div className="max-w-3xl animate-in fade-in duration-300">
{renderList('Service Types', 'Categories of services.', 'serviceTypes')}
{renderList('Services', 'Available billable services.', 'services')}
{renderList('Features', 'System features and modules.', 'features')}
</div>
)}
{activeTab === 'scoring' && (
<div className="max-w-4xl animate-in fade-in duration-300 space-y-8">
{/* Unified Health Pillar Weights */}
<div className="bg-white border border-border rounded-xl shadow-sm p-6">
<h3 className="text-base font-semibold text-slate-800 mb-6 flex items-center gap-2">
Health Score Weights (Total: {totalProjectWeights}%)
</h3>
<div className="space-y-6">
{[
{
label: 'Platform Engagement',
key: 'opActivity',
val: projectWeights.opActivity,
},
{
label: 'Feature Adoption',
key: 'featAdoption',
val: projectWeights.featAdoption,
},
{
label: 'Financial Standing',
key: 'financial',
val: projectWeights.featAdoption,
},
{
label: 'Financial Standing',
key: 'financial',
val: projectWeights.financial || 0,
},
{ label: 'Active Users', key: 'userVol', val: projectWeights.userVol },
{ label: 'Client Sentiment', key: 'csat', val: projectWeights.csat },
].map((item) => (
<div key={item.key} className="flex items-center gap-4">
<label className="text-sm font-semibold text-slate-600 w-48 shrink-0">
{item.label}
</label>
<input
type="range"
min="0"
max="100"
className="flex-1 accent-cyan-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
value={item.val}
onChange={(e) =>
setProjectWeights({
...projectWeights,
[item.key]: Number(e.target.value) || 0,
})
}
/>
<span className="text-sm font-semibold text-slate-800 w-12 text-right">
{item.val}%
</span>
</div>
))}
</div>
<div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
<span
className={`text-sm font-bold ${totalProjectWeights === 100 ? 'text-lime-600' : 'text-red-500'}`}
>
Total: {totalProjectWeights}%
</span>
<button
onClick={handleSaveScoring}
disabled={totalProjectWeights !== 100}
className="bg-[#00c2cb] text-white px-5 h-9 rounded text-sm font-bold hover:bg-[#00aeb6] flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
>
Save Weights
</button>
</div>
</div>

{/* KPI Thresholds */}
<div className="bg-white border border-border rounded-xl shadow-sm p-6">
<h3 className="text-base font-semibold text-slate-800 mb-6">KPI Thresholds</h3>
<div className="grid grid-cols-2 gap-8">
<div className="flex flex-col gap-2">
<label className="text-sm font-semibold text-slate-500">
Healthy Threshold
</label>
<div className="flex items-center gap-3">
<span className="text-sm font-medium text-slate-600">≥</span>
value={thresholds.healthy}
onChange={(e) =>
setThresholds({ ...thresholds, healthy: Number(e.target.value) || 0 })
}
/>
</div>
<span className="text-xs text-slate-500">
Scores above this will display green.
</span>
</div>
<div className="flex flex-col gap-2">
<label className="text-sm font-semibold text-slate-500">
At-Risk Threshold
</label>
<div className="flex items-center gap-3">
<span className="text-sm font-medium text-slate-600">&lt;</span>
<input
type="number"
className="flex-1 rounded-md border border-input px-3 py-2 text-sm outline-none shadow-sm focus:border-primary"
value={thresholds.warning}
onChange={(e) =>
setThresholds({ ...thresholds, warning: Number(e.target.value) || 0 })
}
/>
</div>
<span className="text-xs text-slate-500">
Scores below this will display red.
</span>
</div>
</div>
</div>
</div>
)}
</div>
</div>
</div>
);
}

</div>
)}
</div>
</div>
</div>
);
}

<span className="font-bold">{t.count}</span> {t.name}
</button>
);
})}
</div>
</div>
</div>
</div>

{/* ROW 4: Features + Workload */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 animate-in fade-in duration-700 delay-300 fill-mode-both">
<div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md lg:col-span-2 overflow-hidden h-full min-h-[250px] max-h-[400px]">
<div className="flex justify-between items-center p-4 pb-3 border-b border-border bg-slate-50 shrink-0">
<div className="flex flex-col pr-4 min-w-0">
<div className="text-base font-semibold tracking-tight text-foreground truncate">
Feature Adoption
</div>
<p className="text-xs text-muted-foreground mt-1 font-medium truncate">
Percentage of total projects utilizing platform modules
</p>
</div>
<div className="flex items-center gap-1.5 shrink-0">
<button
onClick={() => setFeatTab('active')}
className={`relative inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-bold whitespace-nowrap transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm border focus:outline-none focus:ring-2 focus:ring-primary/20 ${featTab === 'active' ? 'bg-white text-foreground border-border' : 'bg-muted text-muted-foreground border-transparent hover:text-foreground hover:bg-accent hover:border-border'}`}
>
Active
</button>
<button
onClick={() => setFeatTab('onb')}
className={`relative inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-bold whitespace-nowrap transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm border focus:outline-none focus:ring-2 focus:ring-primary/20 ${featTab === 'onb' ? 'bg-white text-foreground border-border' : 'bg-muted text-muted-foreground border-transparent hover:text-foreground hover:bg-accent hover:border-border'}`}
>
Onboarding
</button>
</div>
</div>
<div className="flex-1 overflow-auto p-6 custom-thin-scroll">
{featTab === 'active' && (
<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 content-start">
{featureAdoptionActive.data.length === 0 ? (
<span className="text-sm text-muted-foreground font-medium text-center w-full block">
No active features tracked.
</span>
) : (
featureAdoptionActive.data.map(([feature, count]) => {
const pct =
featureAdoptionActive.total > 0
? Math.round((count / featureAdoptionActive.total) * 100)
: 0;
const barColorClass =
pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-orange-500' : 'bg-red-500';

return (
<div
key={feature}
className="flex items-center gap-4 cursor-pointer group p-2 rounded-lg bg-white border border-transparent hover:border-border hover:shadow-sm transition-all -m-2"
onClick={() =>
openDrawer('dashDrilldown', undefined, {
contextType: 'featureAdoption',
title: `Feature: ${feature}`,
subtitle: 'Active Projects',
projects: filteredProjects.filter(
(p) =>
(p.projectStatus === 'Active' || p.projectStatus === 'Suspended') &&
(p.features || []).includes(feature)
),
})
}
>
<div className="w-[140px] text-[13px] text-slate-600 font-bold truncate group-hover:text-primary transition-colors">
{feature}
</div>
<div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
<div
className={`h-full rounded-full transition-all duration-500 ease-out ${barColorClass}`}
style={{ width: `${pct}%` }}
></div>
</div>
<div className="w-[85px] text-right flex items-center justify-end gap-1.5 shrink-0">
<span className="text-sm font-bold text-foreground">{pct}%</span>
<span className="text-[10px] font-medium text-slate-400/80">
({count}/{featureAdoptionActive.total})
</span>
</div>
</div>
);
})
)}
</div>
)}
{featTab === 'onb' && (
<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 content-start">
{featureAdoptionOnb.data.length === 0 ? (
<span className="text-sm text-muted-foreground font-medium text-center w-full block">
No onboarding features tracked.
</span>
) : (
featureAdoptionOnb.data.map(([feature, count]) => {
const pct =
featureAdoptionOnb.total > 0
? Math.round((count / featureAdoptionOnb.total) * 100)
: 0;
const barColorClass =
pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-orange-500' : 'bg-red-500';

return (
<div
key={feature}
className="flex items-center gap-4 cursor-pointer group p-2 rounded-lg bg-white border border-transparent hover:border-border hover:shadow-sm transition-all -m-2"
onClick={() =>
openDrawer('dashDrilldown', undefined, {
contextType: 'featureAdoption',
title: `Feature: ${feature}`,
subtitle: 'Onboarding Projects',
projects: filteredProjects.filter(
(p) =>
p.projectStatus === 'Onboarding' &&
(p.features || []).includes(feature)
),
})
}
>
<div className="w-[140px] text-[13px] text-slate-600 font-bold truncate group-hover:text-primary transition-colors">
{feature}
</div>
<div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
<div
className={`h-full rounded-full transition-all duration-500 ease-out ${barColorClass}`}
style={{ width: `${pct}%` }}
></div>
</div>
<div className="w-[85px] text-right flex items-center justify-end gap-1.5 shrink-0">
<span className="text-sm font-bold text-foreground">{pct}%</span>
<span className="text-[10px] font-medium text-slate-400/80">
({count}/{featureAdoptionOnb.total})
</span>
</div>
</div>
);
})
)}
</div>
)}
</div>
</div>

<div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md overflow-hidden h-full min-h-[250px] max-h-[400px]">
<div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-0.5 p-4 pb-3 border-b border-border bg-slate-50 shrink-0">
<div className="text-base font-semibold tracking-tight text-foreground">
Manager Workload
</div>
<p className="text-xs text-muted-foreground font-medium">
Project volume distribution by assignee
</p>
</div>
<div className="flex-1 overflow-auto p-4 space-y-3 content-start custom-thin-scroll">
{managerWorkload.length === 0 && (
<span className="text-sm text-muted-foreground font-medium text-center w-full block">
No manager workload data.
</span>
)}
{managerWorkload.map(([manager, counts]) => {
const initials =
manager !== 'Unassigned'
? manager
.split(' ')
.map((n: string) => n[0])
.join('')
.substring(0, 2)
.toUpperCase()
: '?';
const mHex = getSafeHex(
settings?.managers?.find((m: any) => m.name === manager)?.color,
'slate'
);
return (
<div
key={manager}
className="flex items-center justify-between p-2 rounded-lg bg-white border border-transparent hover:border-border hover:shadow-sm transition-all group"
>
<div className="flex items-center gap-3 w-1/3 min-w-[120px]">
<div
className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border border-slate-200"
style={{
backgroundColor: hexToRgba(mHex, 0.08),
color: mHex,
borderColor: hexToRgba(mHex, 0.2),
}}
>
{initials}
</div>
<span className="text-sm font-bold text-foreground truncate">{manager}</span>
</div>
<div className="flex items-center gap-3 flex-1 justify-end">
<button
onClick={() =>
openDrawer('dashDrilldown', undefined, {
contextType: 'managerWorkloadActive',
title: 'Active Projects',
subtitle: manager,
projects: projects.filter(
(p: any) =>
p.assignee === manager &&
(p.projectStatus === 'Active' || p.projectStatus === 'Suspended')
),
})
}
className="px-4 py-2 rounded-md text-xs font-bold transition-all border w-[110px] text-center bg-green-50 text-green-500 border-transparent shadow-sm hover:border-green-500/30 hover:bg-green-100 hover:-translate-y-1 hover:shadow-md active:scale-95 cursor-pointer"
>
{counts.active} Active
</button>
<button
onClick={() =>
openDrawer('dashDrilldown', undefined, {
contextType: 'managerWorkloadOnboarding',
title: 'Onboarding Projects',
subtitle: manager,
projects: projects.filter(
(p: any) => p.assignee === manager && p.projectStatus === 'Onboarding'
),
})
}
className="px-4 py-2 rounded-md text-xs font-bold transition-all border w-[120px] text-center bg-blue-50 text-blue-500 border-transparent shadow-sm hover:border-blue-500/30 hover:bg-blue-100 hover:-translate-y-1 hover:shadow-md active:scale-95 cursor-pointer"
>
{counts.onboarding} Onboarding
</button>
</div>
</div>
);
})}
</div>
</div>
</div>

{/* ROW 5: Recent Services + Launches */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8 animate-in fade-in duration-700 delay-300 fill-mode-both">
<div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md h-full max-h-[350px] min-h-[250px] overflow-hidden">
<div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-0.5 p-4 pb-3 border-b border-border bg-slate-50 shrink-0">
<div className="text-base font-semibold tracking-tight text-foreground">
Recent Services Delivered
</div>
<p className="text-xs text-muted-foreground font-medium">
Services completed this quarter
</p>
</div>

<div className="flex-1 overflow-auto p-4 custom-thin-scroll flex flex-col gap-3">
{recentServices.length === 0 && (
<div className="text-sm text-muted-foreground text-center mt-4 pb-4">
No recent services.
</div>
)}
{recentServices.map((s, idx) => {
const { iconName: SIconName, color: sColor } = getServiceIcon(s.type || '');
const hexColor = getSafeHex(sColor, 'slate');
const sDate = s.dateVal
? new Date(s.dateVal).toLocaleDateString('en-US', {
month: 'short',
day: 'numeric',
year: 'numeric',
})
: 'No Date';
const formattedPrice = formatCurrency(
parseFloat(s.price?.toString().replace(/[^0-9.-]+/g, '')) || 0
);
return (
<div
key={s.id}
onClick={() => openDrawer('service', s.id)}
className="bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group active:scale-[0.99] flex justify-between items-center"
>
<div className="flex items-center gap-4">
<div
className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-white shadow-sm"
style={{
backgroundColor: hexToRgba(hexColor, 0.1),
borderColor: hexToRgba(hexColor, 0.2),
color: hexColor,
}}
>
{renderIcon(SIconName, 'w-5 h-5')}
</div>
<div className="flex flex-col overflow-hidden">
<span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
{s.name}
</span>
<span className="text-[11px] text-muted-foreground font-medium mt-0.5">
{s.clientName || 'Not Set'} &bull; {s.manager || 'Unassigned'}
</span>
</div>
</div>
<div className="flex flex-col items-end shrink-0">
<span className="text-sm font-bold text-foreground">{formattedPrice}</span>
<span className="text-[11px] text-muted-foreground font-medium mt-0.5">
{sDate}
</span>
</div>
</div>
);
})}
</div>

<div className="bg-muted/50 border-t border-border font-medium text-foreground px-6 py-3 flex justify-between items-center shrink-0">
<span className="text-xs text-muted-foreground font-semibold">
Total Services:{' '}
<span className="text-foreground text-sm font-bold ml-1">
{recentServices.length}
</span>
</span>
<span className="text-xs text-muted-foreground font-semibold">
Total Revenue:{' '}
<span className="text-sm font-bold ml-1 text-lime-600">{formatCurrency(qRev)}</span>
</span>
</div>
</div>

<div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md h-full max-h-[350px] min-h-[250px] overflow-hidden">
<div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-0.5 p-4 pb-3 border-b border-border bg-slate-50 shrink-0">
<div className="text-base font-semibold tracking-tight text-foreground">
Recent Launches
</div>
<p className="text-xs text-muted-foreground font-medium">
Projects released in this quarter
</p>
</div>
<div className="flex-1 overflow-auto p-4 custom-thin-scroll flex flex-col gap-3 mt-0">
{recentLaunches.length === 0 && (
<div className="text-sm text-muted-foreground text-center mt-4 pb-4">
No recent launches.
</div>
)}
{recentLaunches.map((p, idx) => {
const primaryClientName = p.clients && p.clients.length > 0 ? p.clients[0] : null;
const primaryClient = activeClients?.find(
(c: any) => c.companyName === primaryClientName
);
const score =
p.healthScore ||
(primaryClient?.healthScore !== 'N/A' &&
typeof primaryClient?.healthScore === 'number'
? primaryClient.healthScore
: 0);

const healthyThresh = settings?.scoring?.thresholds?.healthy || 80;
const warningThresh = settings?.scoring?.thresholds?.warning || 50;
let orbColorClass = 'text-red-500 bg-red-50 border-red-200';
let badgeColorClass = 'bg-red-500';
const numScore = score === 'N/A' ? 0 : Number(score);
if (numScore >= healthyThresh) {
orbColorClass = 'text-green-500 bg-green-50 border-green-200';
badgeColorClass = 'bg-green-500';
} else if (numScore >= warningThresh) {
orbColorClass = 'text-orange-500 bg-orange-50 border-orange-200';
badgeColorClass = 'bg-orange-500';
}

const pDate = p.releaseDateVal
? new Date(p.releaseDateVal).toLocaleDateString('en-US', {
month: 'short',
day: 'numeric',
year: 'numeric',
})
: 'No Date';
const clientDisplay = (p.clients || []).join(', ');

return (
<div
key={p.id}
onClick={() => openDrawer('project', p.id)}
className="bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group active:scale-[0.99] flex justify-between items-center"
>
<div className="flex items-center gap-4">
<div
className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${orbColorClass}`}
>
<Rocket className="w-5 h-5" />
</div>

<span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
{p.name}
</span>
<span className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
{clientDisplay || 'No Client'} &bull; {p.assignee || 'No Manager'}
</span>
</div>
</div>
<div className="flex flex-col items-end shrink-0 pl-2">
<div
className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white mb-0.5 shadow-sm ${badgeColorClass}`}
>
{score}
</div>
<span className="text-[11px] text-muted-foreground font-medium">{pDate}</span>
</div>
</div>
);
})}
</div>

<div className="bg-muted/50 border-t border-border font-medium text-foreground px-6 py-3 flex justify-between items-center shrink-0">
<span className="text-xs text-muted-foreground font-semibold">
Total Projects:{' '}
<span className="text-foreground text-sm font-bold ml-1">
{recentLaunches.length}
</span>
</span>
</div>
</div>
</div>
</div>
);
}

</div>
);
})}
</div>
</div>
</div>
{/* Recent Activity */}
<div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md min-h-[400px] lg:min-h-0 lg:flex-1 overflow-hidden">
<div className="flex items-center justify-between p-4 pb-3 border-b border-border bg-slate-50 shrink-0">
<div className="flex flex-col">
<div className="text-base font-semibold tracking-tight text-foreground">
Recent Activity
</div>
<p className="text-xs text-muted-foreground font-medium mt-0.5">
Projects released and services sold this quarter
</p>
</div>
<div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg">
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> {recentServices.length} Services</span>
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500"></span> {recentLaunches.length} Projects</span>
</div>
</div>

<div className="flex-1 overflow-auto custom-thin-scroll bg-slate-50/30">
<div className="p-5 flex flex-col relative min-h-full z-0">
{/* vertical timeline line */}
{recentActivity.length > 0 && (
<div className="absolute left-[96px] top-6 bottom-6 w-0.5 bg-slate-200 -z-10"></div>
)}

{recentActivity.length === 0 && (
<div className="text-sm text-muted-foreground text-center mt-4 pb-4">
No recent activity.
</div>
)}

{recentActivity.map((act) => {
const d = new Date(act.dateVal);
const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const isService = act.type === 'service';
const iconObj = isService ? getServiceIcon(act.originalItem.serviceType || act.originalItem.type) : null;

const hexColor = isService ? getSafeHex(iconObj?.color, 'blue') : getSafeHex('violet', 'violet');
const IconName = isService ? (iconObj?.iconName || 'Briefcase') : 'Rocket';

const initials = act.manager !== 'Unassigned' 
? act.manager.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
: '?';

borderColor: hexToRgba(hexColor, 0.2)
}}
title={isService ? act.serviceType : 'Launch'}
>
{renderIcon(IconName, 'w-4 h-4')}
</div>
</div>
</div>

<div 
color: mHex,
borderColor: hexToRgba(mHex, 0.25),
borderWidth: '1px'
}}
>
{initials}
</div>
</div>
</div>
</div>
</div>
);
})}
</div>
</div>
</div>
<div className="flex flex-col items-end shrink-0 pl-2">
<div 
className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md"
title={act.manager}
style={{
backgroundColor: hexToRgba(mHex, 0.1),
color: mHex,
borderColor: hexToRgba(mHex, 0.25),
borderWidth: '1px'
}}
>
{initials}
</div>
</div>
</div>
</div>
</div>
);
})}
</div>
</div>
</div>
</div>
</div>
</div>
</div>
);
}

const name = item.companyName || item.name || '';
return name.toLowerCase().includes(archiveSearch.toLowerCase());
});
}

return (
<div className="max-w-5xl mx-auto animate-in fade-in duration-300">
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
<div className="flex gap-2 overflow-x-auto py-2 px-2 -mx-2 sm:px-2 sm:-mx-2 hide-scrollbar shrink-0">
{[
{ id: 'all', label: 'All', icon: Grid },
{ id: 'clients', label: 'Clients', icon: Building2 },
{ id: 'projects', label: 'Projects', icon: Home },
{ id: 'services', label: 'Services', icon: Briefcase },
{ id: 'settings', label: 'Settings', icon: SettingsIcon },
].map((f) => (
<button
key={f.id}
onClick={() => setArchiveTab(f.id as any)}
className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-full transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm whitespace-nowrap border focus:outline-none focus:ring-2 focus:ring-primary/20 ${
archiveTab === f.id
? 'bg-white text-foreground border-border'
: 'bg-muted text-muted-foreground border-transparent hover:text-foreground hover:bg-accent hover:border-border'
}`}
>
<f.icon
className={`w-4 h-4 ${archiveTab === f.id ? 'text-primary' : 'opacity-70'}`}
/>{' '}
{f.label}
</button>
))}
</div>
<div className="relative w-full sm:w-64">
<Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
<input
type="text"
placeholder="Search archives..."
value={archiveSearch}
onChange={(e) => setArchiveSearch(e.target.value)}
className="w-full pl-9 pr-4 py-2 bg-white border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
/>
</div>
</div>

<div className="bg-white border rounded-xl overflow-hidden shadow-sm">
{itemsToRender.length === 0 ? (
<div className="p-12 text-center flex flex-col items-center">
<ArchiveRestore className="w-8 h-8 text-slate-300 mb-3" />
<p className="text-sm font-medium text-slate-500">
No archived records found matching search.
</p>
</div>
) : (
<div className="divide-y divide-border/50">
{itemsToRender.map((item) => renderArchiveRow(item))}
</div>
)}
</div>
</div>
);
};

const renderIntake = () => {
return (
<div className="max-w-5xl mx-auto animate-in fade-in duration-300 space-y-8">
<div>
<div className="flex items-center gap-3 mb-6">
<div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
{"step_index":8169,"source":"MODEL","type":"PLANNER_RESPONSE","status":"DONE","created_at":"2026-06-20T22:21:10Z",
</div>
<div>
<h3 className="text-lg font-bold text-slate-900">Data Intake Pipeline</h3>
<p className="text-sm text-slate-500">
Review and approve AI-generated alignments for incoming data.
</p>
</div>
</div>

<div className="bg-white border rounded-xl overflow-visible shadow-sm">
{loadingAliases ? (
<div className="p-12 text-center text-sm font-medium text-slate-500 animate-pulse">
Loading pending merges...
</div>
) : pendingAliases.length === 0 ? (
<div className="p-12 text-center flex flex-col items-center">
<CheckCircle2 className="w-8 h-8 text-emerald-400 mb-3" />
<p className="text-sm font-medium text-slate-600">You're all caught up!</p>
<p className="text-xs text-slate-400 mt-1">No pending merges require approval.</p>
</div>
) : (
<div className="divide-y divide-border/50">
{pendingAliases.map((alias) => {
const isCorrecting = correctingAliasId === alias.id;
return (
<div
key={alias.id}







































</div>
)}
</div>
</div>
);
};

const renderIntake = () => {
return (
onClick={() => {
setCorrectingAliasId(null);
setCorrectionTargetId('');
}}
className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
>
Cancel
</button>
</div>
</div>
)}
</div>
</div>
{!isCorrecting && (
<div className="flex flex-wrap items-center gap-2 shrink-0 justify-end w-full sm:w-auto mt-3 sm:mt-0">
<button
onClick={() => setCorrectingAliasId(alias.id)}
className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shadow-sm"
>
<Edit className="w-3.5 h-3.5" /> Correct
</button>
<button
onClick={() => {
const prefix =
alias.type === 'client'
const renderIntake = () => {
return (
<div className="max-w-5xl mx-auto animate-in fade-in duration-300 space-y-8">
<div>
<div className="flex items-center gap-3 mb-6">
<div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
<CheckCircle2 className="w-5 h-5 text-emerald-600" />
</div>
<div>
<h3 className="text-lg font-bold text-slate-900">Data Intake Pipeline</h3>
<p className="text-sm text-slate-500">
Review and approve AI-generated alignments for incoming data.
</p>
</div>
</div>

<div className="bg-white border rounded-xl overflow-visible shadow-sm">
{loadingAliases ? (
<div className="p-12 text-center text-sm font-medium text-slate-500 animate-pulse">
Loading pending merges...
</div>
) : pendingAliases.length === 0 ? (
<div className="p-12 text-center flex flex-col items-center">
<CheckCircle2 className="w-8 h-8 text-emerald-400 mb-3" />
<p className="text-sm font-medium text-slate-600">You're all caught up!</p>
<p className="text-xs text-slate-400 mt-1">No pending merges require approval.</p>
</div>
) : (
<div className="divide-y divide-border/50">
{pendingAliases.map((alias) => {
const isCorrecting = correctingAliasId === alias.id;
return (
<div
key={alias.id}
className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
>
<div className="flex items-start gap-4">
<div
className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 
${
alias.type === 'client'
? 'bg-blue-100 text-blue-600'
: alias.type === 'project'
? 'bg-indigo-100 text-indigo-600'
: 'bg-emerald-100 text-emerald-600'
}`}
<button
onClick={() => handleResolveAlias(alias.id, 'reject')}
className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors shadow-sm"
>
<XCircle className="w-3.5 h-3.5" /> Ignore
</button>
<button
onClick={() => handleResolveAlias(alias.id, 'approve')}
className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 border border-emerald-600 text-white hover:bg-emerald-600 transition-colors shadow-sm"
>
<CheckCircle2 className="w-3.5 h-3.5" /> Approve
</button>
</div>
)}
</div>
);
})}
</div>
)}
</div>
</div>
</div>
);
};



return (
<div className="flex flex-1 overflow-hidden flex-col bg-slate-50/50 p-6">
<div className="flex flex-1 min-h-0 w-full bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-sm overflow-hidden flex-col md:flex-row">
<div className="w-full md:w-64 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-200/60 shrink-0 p-4 flex flex-col gap-1 overflow-y-auto custom-thin-scroll">
<div className="text-xs font-bold text-slate-400 mb-2 mt-2 px-2">Workspace</div>
{[
{ id: 'global', label: 'Global & Org', icon: Building2 },
{ id: 'projects', label: 'Projects', icon: Home },
{ id: 'services', label: 'Services', icon: Briefcase },
{ id: 'scoring', label: 'Scoring Engine', icon: Calculator },
{ id: 'templates', label: 'Templates', icon: FileText },
].map((tab) => (
<button
key={tab.id}
onClick={() => setActiveTab(tab.id as any)}
className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all w-full text-left outline-none ${
activeTab === tab.id
? 'bg-primary/10 text-primary'
: 'text-muted-foreground hover:bg-slate-200/50 hover:text-foreground'
}`}
>
<tab.icon className="w-4 h-4 opacity-70" /> {tab.label}
</button>
))}

<div className="text-xs font-bold text-slate-400 mb-2 mt-6 px-2">Operations & Data</div>
{[
{ id: 'pipeline', label: 'Data Pipeline', icon: Database },
{ id: 'exports', label: 'Data Exports', icon: FileDown },
{ id: 'archives', label: 'Archives', icon: ArchiveRestore },
{ id: 'audit', label: 'Audit Trail', icon: History },
].map((tab) => (
<button
key={tab.id}
onClick={() => setActiveTab(tab.id as any)}
className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all active:scale-95 w-full text-left outline-none ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-slate-200/50 hover:text-foreground'}`}
>
<div className="flex items-center gap-3">
<tab.icon className="w-4 h-4 opacity-70" /> {tab.label}
</div>
</button>
))}
</div>

<div className={`flex-1 overflow-y-auto custom-thin-scroll ${activeTab === 'templates' ? '' : 'p-6 md:p-10'}`}>
{activeTab === 'global' && (
<div className="max-w-3xl animate-in fade-in duration-300">
{renderList('Account Managers', 'Manage the users who can be assigned to clients and projects.', 'managers')}
{renderList('Client Types', 'Classify your clients.', 'clientTypes')}
{renderList('Platform Features', 'System features and modules.', 'features')}
</div>
)}
{activeTab === 'projects' && (
<div className="max-w-3xl animate-in fade-in duration-300">
{renderList('Project Status', 'Workflow stages for projects.', 'statuses')}
{renderList('Schedule Status', 'Schedule statuses for projects.', 'timelines')}
{renderList('Implementation Status', 'Milestones for project execution.', 'phases')}
</div>
)}
{activeTab === 'services' && (
<div className="max-w-3xl animate-in fade-in duration-300">
{renderList('Available Services', 'Available billable services.', 'services')}
{renderList('Service Types', 'Categories of services.', 'serviceTypes')}
{renderList('Service Outcomes', 'Outcome statuses for services.', 'serviceOutcomes')}
{renderList('Fulfillment Status', 'Lifecycle stages for services.', 'serviceStatuses')}
</div>
)}
{activeTab === 'scoring' && (
<div className="max-w-4xl animate-in fade-in duration-300 space-y-8">
{/* Unified Health Pillar Weights */}
<div className="bg-white border border-border rounded-xl shadow-sm p-6">
<h3 className="text-base font-semibold text-slate-800 mb-6 flex items-center gap-2">
Health Score Weights (Total: {totalProjectWeights}%)
</h3>
<div className="space-y-6">
{[
{
label: 'Platform Engagement',
key: 'opActivity',
val: projectWeights.opActivity,
},
{
label: 'Feature Adoption',
key: 'featAdoption',
val: projectWeights.featAdoption,
},
{
label: 'Financial Standing',
key: 'financial',
val: projectWeights.financial || 0,
},
{ label: 'Active Users', key: 'userVol', val: projectWeights.userVol },
{ label: 'Client Sentiment', key: 'csat', val: projectWeights.csat },
].map((item) => (
<div key={item.key} className="flex items-center gap-4">
<label className="text-sm font-semibold text-slate-600 w-48 shrink-0">
{item.label}
</label>
<input
type="range"
min="0"
max="100"
className="flex-1 accent-cyan-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
value={item.val}
<h1 className="text-2xl font-semibold text-slate-800 tracking-tight">{tabTitleMap[activeTab]}</h1>
</div>
)}
<div className={activeTab === 'templates' ? '' : 'px-10 pb-10'}>
{activeTab === 'global' && (
<div className="max-w-3xl animate-in fade-in duration-300">
{renderList('Account Managers', 'Manage the users who can be assigned to clients and projects.', 'managers')}
{renderList('Client Types', 'Classify your clients.', 'clientTypes')}
{renderList('Platform Features', 'System features and modules.', 'features')}
</div>
)}
{activeTab === 'projects' && (
<div className="max-w-3xl animate-in fade-in duration-300">
{renderList('Project Status', 'Workflow stages for projects.', 'statuses')}
{renderList('Schedule Status', 'Schedule statuses for projects.', 'timelines')}
{renderList('Implementation Status', 'Milestones for project execution.', 'phases')}
</div>
)}
{activeTab === 'services' && (
<div className="max-w-3xl animate-in fade-in duration-300">
{renderList('Available Services', 'Available billable services.', 'services')}
{renderList('Service Types', 'Categories of services.', 'serviceTypes')}
{renderList('Service Outcomes', 'Outcome statuses for services.', 'serviceOutcomes')}
{renderList('Fulfillment Status', 'Lifecycle stages for services.', 'serviceStatuses')}
</div>
)}
{activeTab === 'scoring' && (
<div className="max-w-4xl animate-in fade-in duration-300 space-y-8">
{/* Unified Health Pillar Weights */}
<div className="bg-white border border-border rounded-xl shadow-sm p-6">
<h3 className="text-base font-semibold text-slate-800 mb-6 flex items-center gap-2">
Health Score Weights (Total: {totalProjectWeights}%)
</h3>
<div className="space-y-6">
{[
{
label: 'Platform Engagement',
key: 'opActivity',
val: projectWeights.opActivity,
},
{
label: 'Feature Adoption',
key: 'featAdoption',
val: projectWeights.featAdoption,
},
{
label: 'Financial Standing',
key: 'financial',
val: projectWeights.financial || 0,
Scores above this will display green.
</span>
</div>
<div className="flex flex-col gap-2">
<label className="text-sm font-semibold text-slate-500">
At-Risk Threshold
</label>
<div className="flex items-center gap-3">
<span className="text-sm font-medium text-slate-600">&lt;</span>
<input
type="number"
className="flex-1 rounded-md border border-input px-3 py-2 text-sm outline-none shadow-sm focus:border-primary"
value={thresholds.warning}
onChange={(e) =>
setThresholds({ ...thresholds, warning: Number(e.target.value) || 0 })
}
/>
</div>
<span className="text-xs text-slate-500">
Scores below this will display red.
</span>
</div>
</div>
</div>
</div>
)}
{activeTab === 'templates' && (
<div className="h-full w-full animate-in fade-in duration-300 flex flex-col">
<TemplateDesigner />
</div>
<span className="text-sm font-medium text-slate-600">&lt;</span>
<input
type="number"
className="flex-1 rounded-md border border-input px-3 py-2 text-sm outline-none shadow-sm focus:border-primary"
value={thresholds.warning}
onChange={(e) =>
setThresholds({ ...thresholds, warning: Number(e.target.value) || 0 })
}
/>
</div>
<span className="text-xs text-slate-500">
Scores below this will display red.
</span>
</div>
</div>
</div>
</div>
)}

</div>
)}
{activeTab === 'templates' && (
<div className="h-full w-full animate-in fade-in duration-300 flex flex-col">
<TemplateDesigner />
</div>
)}

{activeTab === 'pipeline' && (
<div className="space-y-12">
<DataUploader />
<div className="border-t border-slate-100 pt-8 max-w-5xl mx-auto">
{renderIntake()}
</div>
</div>
)}
{activeTab === 'audit' && renderAuditTrail()}
{activeTab === 'archives' && renderArchives()}
{activeTab === 'exports' && (
<div className="max-w-5xl mx-auto space-y-6">
<div>
<h2 className="text-xl font-bold text-slate-800 tracking-tight">Data Exports</h2>
<p className="text-slate-500 text-sm mt-1 mb-8">
Export combined project form submissions. Each export aggregates data from all projects that have completed the specific form.
</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{[
{ title: 'Onboarding Survey', key: 'survey', isDeliverables: false, desc: 'Client survey responses' },
{ title: 'Primary QA', key: 'primaryQA', isDeliverables: false, desc: 'Internal Primary QA form responses' },
{ title: 'Client QA', key: 'clientQA', isDeliverables: false, desc: 'Client QA review feedback' },
{ title: 'Secondary QA', key: 'secondaryQA', isDeliverables: false, desc: 'Internal Secondary QA sign-offs' },
{ title: 'Project Certification', key: 'certification', isDeliverables: false, desc: 'Final Project Certification responses' },
{ title: 'Onboarding CSAT', key: 'onboardingCsat', isDeliverables: false, desc: 'Client Onboarding CSAT Responses' },
].map(form => (
<div key={form.key} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col hover:border-slate-300 hover:shadow-sm transition-all">
<div className="flex-1">
<h3 className="font-semibold text-slate-800 text-sm">{form.title}</h3>
<p className="text-xs text-slate-500 mt-1">{form.desc}</p>
</div>
<button
onClick={() => exportAllFormResponsesToCSV(form.title, form.key, projects, form.isDeliverables, getTemplate(form.title))}
className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
>
<FileDown className="w-4 h-4" />
Download CSV
</button>
</div>
))}
</div>
</div>
)}
</div>
</div>
</div>
);
}

</div>
<span className="text-xs text-slate-500">
Scores above this will display green.
</span>
</div>
<div className="flex flex-col gap-2">
<label className="text-sm font-semibold text-slate-500">
At-Risk Threshold
</label>
<div className="flex items-center gap-3">
<span className="text-sm font-medium text-slate-600">&lt;</span>
<input
type="number"
className="flex-1 rounded-md border border-input px-3 py-2 text-sm outline-none shadow-sm focus:border-primary"
value={thresholds.warning}
onChange={(e) =>
setThresholds({ ...thresholds, warning: Number(e.target.value) || 0 })
}
/>
</div>
<span className="text-xs text-slate-500">
Scores below this will display red.
</span>
</div>
</div>
</div>
</div>
)}
{activeTab === 'templates' && (
<div className="h-full w-full animate-in fade-in duration-300 flex flex-col">
<TemplateDesigner />
</div>
)}

{activeTab === 'pipeline' && (
<div className="space-y-12">
<DataUploader />
<div className="border-t border-slate-100 pt-8 max-w-5xl mx-auto">
{renderIntake()}
</div>
</div>
)}
{activeTab === 'audit' && renderAuditTrail()}
{activeTab === 'archives' && renderArchives()}
{activeTab === 'exports' && (
<div className="max-w-5xl mx-auto space-y-6">
<div>
<h2 className="text-xl font-bold text-slate-800 tracking-tight">Data Exports</h2>
<p className="text-slate-500 text-sm mt-1 mb-8">
Export combined project form submissions. Each export aggregates data from all projects that have completed the specific form.
</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{[
{ title: 'Onboarding Survey', key: 'survey', isDeliverables: false, desc: 'Client survey responses' },
{ title: 'Primary QA', key: 'primaryQA', isDeliverables: false, desc: 'Internal Primary QA form responses' },
{ title: 'Client QA', key: 'clientQA', isDeliverables: false, desc: 'Client QA review feedback' },
{ title: 'Secondary QA', key: 'secondaryQA', isDeliverables: false, desc: 'Internal Secondary QA sign-offs' },
{ title: 'Project Certification', key: 'certification', isDeliverables: false, desc: 'Final Project Certification responses' },
{ title: 'Onboarding CSAT', key: 'onboardingCsat', isDeliverables: false, desc: 'Client Onboarding CSAT Responses' },
].map(form => (
<div key={form.key} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col hover:border-slate-300 hover:shadow-sm transition-all">
<div className="flex-1">
<h3 className="font-semibold text-slate-800 text-sm">{form.title}</h3>
<p className="text-xs text-slate-500 mt-1">{form.desc}</p>
</div>
<button
onClick={() => exportAllFormResponsesToCSV(form.title, form.key, projects, form.isDeliverables, getTemplate(form.title))}
className="group mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-primary/30 text-slate-700 hover:text-primary text-sm font-medium rounded-lg transition-all hover:shadow-[0_0_15px_rgba(14,165,233,0.15)] active:scale-95"
>
<FileDown className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" />
Download CSV
</button>
</div>
))}
</div>
</div>
)}
</div>
</div>
</div>
</div>
);
}
/>
</div>
<span className="text-xs text-slate-500">
Scores below this will display red.
</span>
</div>
</div>
</div>
</div>
)}
setProjectWeights({
...projectWeights,
[item.key]: Number(e.target.value) || 0,
})
}
/>
<span className="text-sm font-bold text-slate-700 w-12 text-right">
{item.val}%
</span>
</div>
))}
</div>

{/* Right: Donut Chart */}
<div className="w-full lg:w-64 h-64 shrink-0 flex flex-col items-center justify-center">
<DonutChart 
total={totalProjectWeights}
data={[
{ name: 'Platform Engagement', value: projectWeights.opActivity, color: '#00c2cb' },
{ name: 'Feature Adoption', value: projectWeights.featAdoption, color: '#0284c7' },
{ name: 'Financial Standing', value: projectWeights.financial || 0, color: '#3b82f6' },
{ name: 'Active Users', value: projectWeights.userVol, color: '#6366f1' },
{ name: 'Client Sentiment', value: projectWeights.csat, color: '#8b5cf6' }
].filter(d => d.value > 0)}
/>
</div>
</div>

<div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
<span className="text-sm font-medium text-slate-500">
Adjust the weights above so they equal exactly 100%.
</span>
<button
onClick={handleSaveScoring}
disabled={totalProjectWeights !== 100}
className="bg-[#00c2cb] text-white px-5 h-9 rounded text-sm font-bold hover:bg-[#00aeb6] flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
>
Save Weights
</button>
</div>
</div>

{/* KPI Thresholds */}
<div className="bg-white border border-border rounded-xl shadow-sm p-6">
<div className="mb-10">
<h3 className="text-base font-semibold text-slate-800 mb-2">KPI Thresholds</h3>
<p className="text-sm text-slate-500">
Drag the handles below to define the score boundaries for At-Risk, Warning, and Healthy states.
</p>
</div>

<div className="px-4 mb-8 max-w-3xl">
<DualThumbSlider 
value={{ warning: thresholds.warning, healthy: thresholds.healthy }}
onChange={({ warning, healthy }) => setThresholds({ warning, healthy })}
/>
<div className="flex justify-between items-center mt-3">
<div className="text-center w-24">
<span className="block text-sm font-semibold text-slate-500 mb-1">At Risk</span>
<span className="text-base font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">0 - {thresholds.warning - 1}</span>
</div>
<div className="text-center w-24">
<span className="block text-sm font-semibold text-slate-500 mb-1">Warning</span>
<span className="text-base font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded">{thresholds.warning} - {thresholds.healthy - 1}</span>
</div>
<div className="text-center w-24">
<span className="block text-sm font-semibold text-slate-500 mb-1">Healthy</span>
<span className="text-base font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">{thresholds.healthy} - 100</span>
</div>
</div>
</div>

<div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
<span className="text-sm font-medium text-slate-500">
These thresholds will immediately update color coding globally.
</span>
<button
onClick={handleSaveScoring}
className="bg-[#00c2cb] text-white px-5 h-9 rounded text-sm font-bold hover:bg-[#00aeb6] flex items-center gap-2 shadow-sm transition-all active:scale-95"
>
>
Save Thresholds
</button>
</div>
</div>
</div>
)}
{activeTab === 'templates' && (
<div className="h-full w-full animate-in fade-in duration-300 flex flex-col">
<TemplateDesigner />
</div>
)}

{activeTab === 'pipeline' && (
<div className="space-y-12">
<DataUploader />
<div className="border-t border-slate-100 pt-8 max-w-5xl mx-auto">
{renderIntake()}
</div>
</div>
)}
{activeTab === 'audit' && renderAuditTrail()}
{activeTab === 'archives' && renderArchives()}
{activeTab === 'exports' && (
<div className="max-w-5xl mx-auto space-y-6">
<div>
<h2 className="text-xl font-bold text-slate-800 tracking-tight">Data Exports</h2>
<p className="text-slate-500 text-sm mt-1 mb-8">
Export combined project form submissions. Each export aggregates data from all projects that have completed the specific form.
</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{[
{ title: 'Onboarding Survey', key: 'survey', isDeliverables: false, desc: 'Client survey responses' },
{ title: 'Primary QA', key: 'primaryQA', isDeliverables: false, desc: 'Internal Primary QA form responses' },
{ title: 'Client QA', key: 'clientQA', isDeliverables: false, desc: 'Client QA review feedback' },
{ title: 'Secondary QA', key: 'secondaryQA', isDeliverables: false, desc: 'Internal Secondary QA sign-offs' },
{ title: 'Project Certification', key: 'certification', isDeliverables: false, desc: 'Final Project Certification responses' },
{ title: 'Onboarding CSAT', key: 'onboardingCsat', isDeliverables: false, desc: 'Client Onboarding CSAT Responses' },
].map(form => (
<div key={form.key} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col hover:border-slate-300 hover:shadow-sm transition-all">
<div className="flex-1">
<h3 className="font-semibold text-slate-800 text-sm">{form.title}</h3>
<p className="text-xs text-slate-500 mt-1">{form.desc}</p>
</div>
<button
onClick={() => exportAllFormResponsesToCSV(form.title, form.key, projects, form.isDeliverables, getTemplate(form.title))}
className="group mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-primary/30 text-slate-700 hover:text-primary text-sm font-medium rounded-lg transition-all hover:shadow-[0_0_15px_rgba(14,165,233,0.15)] active:scale-95"
>
<FileDown className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" />
Download CSV
</button>
</div>
))}
</div>
</div>
)}
</div>
</div>
</div>
