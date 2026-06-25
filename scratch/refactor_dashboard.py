import os
import re

file_path = r'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/pages/Dashboard.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
imports_to_add = """import { TrendIndicator } from '../components/TrendIndicator';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import FeatureAdoption from '../components/Dashboard/FeatureAdoption';
import ManagerWorkload from '../components/Dashboard/ManagerWorkload';
import OnboardingTracker from '../components/Dashboard/OnboardingTracker';
import RecentDeliverables from '../components/Dashboard/RecentDeliverables';"""
content = content.replace(
    "import { TrendIndicator } from '../components/TrendIndicator';\nimport { useOnClickOutside } from '../hooks/useOnClickOutside';",
    imports_to_add
)

# 2. Remove lines from onboardingPhases to recentLaunches
# We'll use regex to remove from "const onboardingPhases = useMemo" to "}, [filteredProjects]);" right before "const formatCurrency"
pattern = re.compile(r'  const onboardingPhases = useMemo.*?  }, \[filteredProjects\]\);\n', re.DOTALL)
content = re.sub(pattern, '', content)

# 3. Replace the rest of the file from {/* ROW 2: Portfolio Dist + Movers + Action Required */} to the end
rest_pattern = re.compile(r'      \{/\* ROW 2: Portfolio Dist \+ Movers \+ Action Required \*/\}.*\}', re.DOTALL)

new_layout = """      {/* BENTO BOX LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 pb-12 transition-all duration-500 animate-in fade-in duration-700 delay-300 fill-mode-both">
        
        {/* LEFT COLUMN - PRIMARY DATA (Col Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-white shadow-sm hover:border-primary/50 transition-all duration-300 flex flex-col min-h-[350px]">
              <div className="p-5 border-b border-border bg-slate-50/50 rounded-t-xl shrink-0">
                <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2">
                  <PieChart className="w-[18px] h-[18px] text-muted-foreground" />
                  Portfolio Distribution
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Real-time health segmentation</p>
              </div>
              <div className="p-6 flex-1 flex items-center justify-center">
                {totalScored === 0 ? (
                  <EmptyState icon={PieChart} title="No Data" subtitle="Score clients" />
                ) : (
                  <div className="w-56 h-56 relative flex items-center justify-center">
                    <Doughnut data={chartData} options={chartOptions} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                      <span className="text-3xl font-bold text-foreground leading-none">{totalScored}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold mt-1">Active</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white shadow-sm hover:border-primary/50 transition-all duration-300 flex flex-col min-h-[350px]">
              <div className="p-5 border-b border-border bg-slate-50/50 rounded-t-xl shrink-0">
                <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2">
                  <Users className="w-[18px] h-[18px] text-muted-foreground" />
                  Manager Workload
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Project distribution by assignee</p>
              </div>
              <div className="p-4 flex-1">
                <ManagerWorkload />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white shadow-sm hover:border-primary/50 transition-all duration-300 flex flex-col min-h-[350px]">
            <div className="p-5 border-b border-border bg-slate-50/50 rounded-t-xl shrink-0">
              <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2">
                <Package className="w-[18px] h-[18px] text-muted-foreground" />
                Feature Adoption
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Top modules utilized across projects</p>
            </div>
            <div className="p-4 flex-1">
              <FeatureAdoption />
            </div>
          </div>
          
          <div className="rounded-xl border border-border bg-white shadow-sm hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col min-h-[300px]">
            <div className="p-5 border-b border-border bg-slate-50/50 rounded-t-xl shrink-0">
              <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-[18px] h-[18px] text-muted-foreground" />
                Quarterly Movers
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Largest 90-day health score changes</p>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              {!movers || (movers.improvers.length === 0 && movers.droppers.length === 0) ? (
                <EmptyState icon={BarChart3} title="No Movement" subtitle="No major health shifts." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {movers.improvers.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold text-lime-600 uppercase tracking-wider flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5"/> Top Improvers</h5>
                      {movers.improvers.map((m: any) => (
                        <div key={m.id} className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-slate-50/50">
                          <span className="text-[13px] font-bold text-foreground truncate max-w-[150px]">{m.name}</span>
                          <span className="text-xs font-bold text-lime-600 bg-lime-100 px-2 py-0.5 rounded-full">+{m.diff}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {movers.droppers.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5"/> At Risk (Dropping)</h5>
                      {movers.droppers.map((m: any) => (
                        <div key={m.id} className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-slate-50/50">
                          <span className="text-[13px] font-bold text-foreground truncate max-w-[150px]">{m.name}</span>
                          <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{m.diff}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - ACTION & ACTIVITY (Col Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {showActionReq && (
            <div className="rounded-xl border-2 border-red-200 bg-white shadow-sm overflow-hidden flex flex-col max-h-[400px]">
              <div className="p-4 border-b border-red-100 bg-red-50/80 shrink-0 flex flex-col gap-3">
                <div className="text-[15px] font-bold text-red-600 flex items-center gap-2">
                  <AlertOctagon className="w-[18px] h-[18px]" /> Action Required
                </div>
                {(hasRisk && hasSus) && (
                  <div className="flex bg-white/60 p-1 rounded-lg">
                    <button onClick={() => setActionTab('sus')} className={`flex-1 text-xs font-bold py-1.5 rounded-md ${actionTab === 'sus' ? 'bg-white shadow-sm text-red-600' : 'text-red-600/70 hover:bg-white/50'}`}>Suspended</button>
                    <button onClick={() => setActionTab('risk')} className={`flex-1 text-xs font-bold py-1.5 rounded-md ${actionTab === 'risk' ? 'bg-white shadow-sm text-red-600' : 'text-red-600/70 hover:bg-white/50'}`}>At Risk</button>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-thin-scroll space-y-2">
                {hasRisk && (!hasSus || actionTab === 'risk') && atRiskClients.map(c => (
                  <div key={c.clientId} onClick={() => openDrawer('client', c.clientId, { targetTab: 'health' })} className="p-3 border border-red-100 rounded-lg flex justify-between items-center cursor-pointer hover:bg-red-50/50">
                    <span className="text-[13px] font-bold truncate pr-2 max-w-[180px]">{c.companyName}</span>
                    {getHealthBadge(c.healthScore, settings)}
                  </div>
                ))}
                {hasSus && (!hasRisk || actionTab === 'sus') && suspendedProjects.map(p => (
                  <div key={p.id} onClick={() => openDrawer('project', p.id, { targetTab: 'overview' })} className="p-3 border border-red-100 rounded-lg flex justify-between items-center cursor-pointer hover:bg-red-50/50">
                    <span className="text-[13px] font-bold truncate pr-2 max-w-[180px]">{p.name}</span>
                    <PauseCircle className="w-4 h-4 text-red-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-white shadow-sm hover:border-primary/50 transition-all duration-300 flex flex-col min-h-[350px]">
            <div className="p-5 border-b border-border bg-slate-50/50 rounded-t-xl shrink-0">
              <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2">
                <ListTodo className="w-[18px] h-[18px] text-muted-foreground" />
                Onboarding Tracker
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Schedule status by phase</p>
            </div>
            <div className="p-4 flex-1">
              <OnboardingTracker />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white shadow-sm hover:border-primary/50 transition-all duration-300 flex flex-col flex-1 max-h-[600px] overflow-hidden">
            <div className="p-5 border-b border-border bg-slate-50/50 rounded-t-xl shrink-0">
              <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2">
                <History className="w-[18px] h-[18px] text-muted-foreground" />
                Recent Activity
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Latest deliverables and launches</p>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-thin-scroll">
              <RecentDeliverables />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
"""
content = re.sub(rest_pattern, new_layout, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Dashboard.tsx refactored successfully")
