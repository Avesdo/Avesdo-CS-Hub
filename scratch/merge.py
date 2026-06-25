import os

settings_path = 'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/pages/Settings.tsx'
admin_path = 'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/pages/AdminHub.tsx'
output_path = 'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/pages/Settings.tsx'

with open(settings_path, 'r', encoding='utf-8') as f:
    settings_code = f.read()

with open(admin_path, 'r', encoding='utf-8') as f:
    admin_code = f.read()

# 1. Imports
# AdminHub imports
admin_imports = """
import { SearchableSelect } from '../components/ui/SearchableSelect';
import {
  AlertCircle,
  ArchiveRestore,
  RotateCcw,
  Trash2,
  History,
  Search,
  Settings as SettingsIcon,
  Users,
  FolderOpen,
  ChevronDown,
  Grid,
  Home,
  CheckCircle2,
  XCircle,
  Edit,
  Database
} from 'lucide-react';
import {
  getSystemLogs,
  restoreRecord,
  hardDeleteRecord,
  addAutoLog,
  addServiceAutoLog,
  addProjectAutoLog,
  getPendingAliases,
  resolveAlias,
  clearAuditTrail,
} from '../api/dbService';
import { DataUploader } from '../components/admin/DataUploader';
import { PageHeader } from '../components/PageHeader';
import MultiSelectCombobox from '../components/MultiSelectCombobox';
import { exportAllFormResponsesToCSV } from '../utils/exportUtils';
import { FileDown } from 'lucide-react';
"""

# 2. Extract Admin state & functions
admin_start = admin_code.find('const [activeTab, setActiveTab]')
admin_end = admin_code.find('const renderAuditTrail = () => {')
admin_logic = admin_code[admin_start:admin_end]
# Remove `const [activeTab...` from admin_logic
admin_logic = admin_logic.split('\n', 1)[1]

admin_render_start = admin_code.find('const renderAuditTrail = () => {')
admin_render_end = admin_code.find('return (\n    <div className="flex flex-1 overflow-hidden')
admin_render = admin_code[admin_render_start:admin_render_end]

# 3. Inject into Settings
settings_start = settings_code.find('const [activeTab, setActiveTab]')
settings_before_tab = settings_code[:settings_start]

# Replace activeTab
new_active_tab = "const [activeTab, setActiveTab] = useState<'global' | 'projects' | 'services' | 'scoring' | 'templates' | 'pipeline' | 'exports' | 'archives' | 'audit'>('global');"

# Find end of settings logic
settings_render_start = settings_code.find('return (\n    <div className="flex flex-1 overflow-hidden')
settings_logic = settings_code[settings_start:settings_render_start].split('\n', 1)[1] # skip activeTab

# Inject imports
import_insert_idx = settings_before_tab.find("import { toast } from '../utils/toast';")
if import_insert_idx != -1:
    settings_before_tab = settings_before_tab[:import_insert_idx] + admin_imports + '\n' + settings_before_tab[import_insert_idx:]


new_render = """
  return (
    <div className="flex flex-1 overflow-hidden flex-col bg-slate-50/50 p-6">
      <div className="flex flex-1 min-h-0 w-full bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-sm overflow-hidden flex-col md:flex-row">
        <div className="w-full md:w-64 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-200/60 shrink-0 p-4 flex flex-col gap-1 overflow-y-auto custom-thin-scroll">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2 px-2">Workspace</div>
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
          
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6 px-2">Operations & Data</div>
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
              {/* Scoring logic here */}
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
"""

# Extract the inner scoring layout from the old settings_code since we omitted it above
scoring_start = settings_code.find('              {/* Unified Health Pillar Weights */}')
scoring_end = settings_code.find('          {activeTab === \'templates\' && (')
scoring_logic = settings_code[scoring_start:scoring_end]

new_render = new_render.replace('              {/* Scoring logic here */}', scoring_logic)


full_code = settings_before_tab + new_active_tab + '\n' + admin_logic + '\n' + settings_logic + '\n' + admin_render + '\n' + new_render

# We need to fix one thing: `const getTemplate` is defined twice?
# Let's check if `getTemplate` is in both.
if full_code.count('const getTemplate =') > 1:
    # Remove one
    pass # we will manually delete it if so.

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(full_code)
