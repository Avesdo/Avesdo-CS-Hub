import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { ArrowRight, PieChart as PieChartIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../EmptyState';

const CATEGORY_COLORS: Record<string, string> = {
  Onboarding: '#00bdd9',
  Product: '#8b5cf6',
  Services: '#f59e0b',
  Internal: '#64748b',
  Maintenance: '#10b981',
  Uncategorized: '#14b8a6',
};

interface OriginsAndClassificationsWidgetProps {
  doughnutData: any;
  chartData: any;
  selectedRingCategory: string | null;
  setSelectedRingCategory: (category: string | null) => void;
}

export function OriginsAndClassificationsWidget({
  doughnutData,
  chartData,
  selectedRingCategory,
  setSelectedRingCategory,
}: OriginsAndClassificationsWidgetProps) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-6 overflow-hidden mt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">Ticket Origins & Classifications</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Dual-ring breakdown of ticket categories and their classifications
          </p>
        </div>
        <AnimatePresence>
          {selectedRingCategory && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => setSelectedRingCategory(null)}
              className="mt-4 md:mt-0 text-sm font-semibold text-[#00bdd9] bg-[#00bdd9]/10 hover:bg-[#00bdd9]/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to All Categories
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-8">
        <div className="w-full lg:w-1/2 h-[500px] relative shrink-0">
          {doughnutData.inner.length === 0 ? (
            <EmptyState
              icon={PieChartIcon}
              title="No Ticket Origins Found"
              subtitle="There are no tickets matching your current filter criteria."
            />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <RechartsTooltip
                  cursor={{ fill: '#f8fafa' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const total = data.category
                        ? doughnutData.outer.reduce((sum: number, item: any) => sum + item.value, 0)
                        : doughnutData.inner.reduce(
                            (sum: number, item: any) => sum + item.value,
                            0
                          );
                      const percentage = Math.round((data.value / total) * 100);

                      return (
                        <div className="bg-white/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex flex-col min-w-[200px] transform transition-all duration-200">
                          <p className="font-semibold text-foreground border-b border-border pb-2 mb-3 text-sm">
                            {data.category ? data.category + ' Classification' : 'Ticket Category'}
                          </p>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-6">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-2.5 h-2.5 rounded-[3px] shadow-sm"
                                  style={{ backgroundColor: data.fill }}
                                />
                                <span className="text-[13px] font-medium text-muted-foreground">
                                  {data.name}
                                </span>
                              </div>
                              <span className="text-[14px] font-bold text-foreground flex items-center gap-2">
                                <span>{data.value}</span>
                                <span className="text-muted-foreground font-normal text-xs">•</span>
                                <span className="text-[#00bdd9]">
                                  {percentage}% of {data.category ? data.category : 'Total'}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Inner Ring: Categories */}
                <Pie
                  data={doughnutData.inner}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={110}
                  outerRadius={160}
                  paddingAngle={selectedRingCategory ? 0 : 2}
                  onClick={(data) => {
                    if (!selectedRingCategory && data?.name) {
                      setSelectedRingCategory(data.name);
                    }
                  }}
                  className={
                    !selectedRingCategory
                      ? 'cursor-pointer hover:opacity-90 transition-all duration-200'
                      : ''
                  }
                  stroke="none"
                  isAnimationActive={true}
                >
                  {doughnutData.inner.map((entry: any, index: number) => (
                    <Cell key={`inner-${index}`} fill={entry.fill} />
                  ))}
                </Pie>

                {/* Outer Ring: Classifications */}
                <Pie
                  data={doughnutData.outer}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={165}
                  outerRadius={200}
                  paddingAngle={1}
                  stroke="none"
                  isAnimationActive={true}
                >
                  {doughnutData.outer.map((entry: any, index: number) => (
                    <Cell key={`outer-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}

          {/* Center Label */}
          <AnimatePresence mode="wait">
            {!selectedRingCategory && doughnutData.inner.length > 0 ? (
              <motion.div
                key="global"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl font-bold text-slate-800"
                >
                  {doughnutData.inner.reduce((acc: number, curr: any) => acc + curr.value, 0)}
                </motion.div>
                <div className="text-sm font-semibold text-slate-500 capitalize tracking-wide mt-1">
                  Total Tickets
                </div>
              </motion.div>
            ) : selectedRingCategory && doughnutData.inner.length > 0 ? (
              <motion.div
                key="category"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl font-bold text-slate-800"
                >
                  {doughnutData.outer.reduce((acc: number, curr: any) => acc + curr.value, 0)}
                </motion.div>
                <div
                  className="text-sm font-semibold capitalize tracking-wide mt-1"
                  style={{ color: doughnutData.inner[0].fill }}
                >
                  {selectedRingCategory}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Legends */}
        {doughnutData.inner.length > 0 && (
          <div className="w-full lg:w-1/2 flex flex-col md:flex-row gap-8 lg:py-6">
            {/* Categories Column */}
            <div
              className="w-full md:w-1/2 flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-2"
              style={{ scrollbarWidth: 'thin' }}
            >
              <h4 className="text-sm font-bold text-slate-700 mb-1 border-b border-slate-100 pb-2 sticky top-0 bg-white z-10">
                Categories
              </h4>
              {chartData.categoryData.map((item: any, idx: number) => {
                const isSelected = selectedRingCategory === item.name;
                const hasSelection = selectedRingCategory !== null;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedRingCategory(isSelected ? null : item.name)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left ${isSelected ? 'border-[#00bdd9] bg-[#00bdd9]/5 shadow-sm opacity-100' : hasSelection ? 'border-slate-100 opacity-50 hover:opacity-100 hover:bg-slate-50' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[item.name] || CATEGORY_COLORS['Uncategorized'],
                        }}
                      />
                      <span className="font-semibold text-sm text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-500">{item.value}</span>
                  </button>
                );
              })}
            </div>

            {/* Classifications Column */}
            <div
              className="w-full md:w-1/2 flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-2"
              style={{ scrollbarWidth: 'thin' }}
            >
              <h4 className="text-sm font-bold text-slate-700 mb-1 border-b border-slate-100 pb-2 sticky top-0 bg-white z-10">
                {selectedRingCategory
                  ? `${selectedRingCategory} Classifications`
                  : 'All Classifications'}
              </h4>
              {(() => {
                const classMap = new Map<string, { value: number; fill: string }>();
                doughnutData.outer.forEach((item: any) => {
                  if (!classMap.has(item.name)) {
                    classMap.set(item.name, { value: 0, fill: item.fill });
                  }
                  classMap.get(item.name)!.value += item.value;
                });
                const classList = Array.from(classMap.entries())
                  .map(([name, data]) => ({
                    name,
                    value: data.value,
                    fill: data.fill,
                  }))
                  .sort((a, b) => b.value - a.value);

                return classList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/30"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full shadow-sm opacity-80"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="font-medium text-xs text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{item.value}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
