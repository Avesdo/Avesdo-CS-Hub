const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'pages', 'SupportDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Delete EmptyChartState
const emptyChartStateRegex = /const EmptyChartState = \(\{\s*message = 'No data available for the selected filters',\s*\}\: \{\s*message\?\: string;\s*\}\) => \([\s\S]*?\n\);\n\n/;
content = content.replace(emptyChartStateRegex, '');

// 2. Add imports
if (!content.includes(`import EmptyState from '../components/EmptyState'`)) {
  content = content.replace(
    `import { Tooltip as UITooltip } from '../components/ui/Tooltip';`,
    `import { Tooltip as UITooltip } from '../components/ui/Tooltip';\nimport EmptyState from '../components/EmptyState';\nimport { PieChart as PieChartIcon, Activity, LayoutGrid, SearchX } from 'lucide-react';`
  );
}

// 3. Ticket Origins
// Wrap the <div className="h-[400px]">...</div>
const originRegex = /(<div className="h-\[400px\] w-full relative">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*{\/\* 5\. Busiest Times)/;
content = content.replace(originRegex, (match, p1, p2, p3) => {
  return `${p1}
                  {doughnutData.outer.length === 0 ? (
                    <EmptyState
                      icon={PieChartIcon}
                      title="No Ticket Origins Found"
                      subtitle="There are no tickets matching your current filter criteria."
                    />
                  ) : (${p2})}
                ${p3}`;
});

// 4. Busiest Times (Activity Heatmap)
const heatmapRegex = /(<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-0">\s*<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">[\s\S]*?<\/div>)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*{\/\* High-Friction Sources)/;
content = content.replace(heatmapRegex, (match, p1, p2, p3) => {
  return `${p1}
                  {filteredTickets.length === 0 ? (
                    <div className="flex-1 min-h-[300px]">
                      <EmptyState
                        icon={Activity}
                        title="No Activity Data"
                        subtitle="Try adjusting your filters to see ticket activity patterns."
                      />
                    </div>
                  ) : (
                    ${p2}
                  )}
                ${p3}`;
});

// 5. High-Friction Sources
const frictionRegex = /(<div className="flex-1 min-h-0 min-h-\[400px\]">)(\s*<ResponsiveContainer width="99%" height="100%" minWidth=\{1\} minHeight=\{1\}>)/;
content = content.replace(frictionRegex, (match, p1, p2) => {
  return `${p1}
                  {(frictionSourceView === 'project' ? chartData.frictionProjects : chartData.frictionContacts).length === 0 ? (
                    <EmptyState
                      icon={SearchX}
                      title="No High-Friction Sources"
                      subtitle="Great news! There are no high-friction tickets matching your criteria."
                    />
                  ) : (${p2}`;
});

// For High Friction, we need to close the ternary
const frictionCloseRegex = /(<\/ResponsiveContainer>\s*)(<\/div>\s*<\/div>\s*<\/div>\s*{\/\* 3\. Dynamic Workload Matrix)/;
content = content.replace(frictionCloseRegex, (match, p1, p2) => {
  return `${p1}
                  )}
                ${p2}`;
});

// 6. Dynamic Workload Matrix
const workloadRegex = /(<div className="flex-1 min-h-0 min-h-\[400px\]">)(\s*<ResponsiveContainer width="99%" height="100%" minWidth=\{1\} minHeight=\{1\}>)([\s\S]*?)(<\/ResponsiveContainer>\s*)(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\;\s*\})/;
content = content.replace(workloadRegex, (match, p1, p2, p3, p4, p5) => {
  return `${p1}
                  {chartData.workloadDistribution.length === 0 ? (
                    <EmptyState
                      icon={LayoutGrid}
                      title="No Workload Data"
                      subtitle="There are no tickets to plot in the workload matrix."
                    />
                  ) : (
                    ${p2}${p3}${p4}
                  )}
                ${p5}`;
});

fs.writeFileSync(filePath, content);
console.log("Replaced");
