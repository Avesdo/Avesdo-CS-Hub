import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../EmptyState';

interface ActivityHeatmapWidgetProps {
  chartData: any;
  hasTickets: boolean;
}

export function ActivityHeatmapWidget({ chartData, hasTickets }: ActivityHeatmapWidgetProps) {
  const [showWorkingHours, setShowWorkingHours] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden flex flex-col mt-6">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="font-bold text-foreground text-lg flex items-center gap-2 flex-wrap">
              Busiest Times (Activity Heatmap)
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Ticket volume concentrated by day of week and hour of day
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setShowWorkingHours(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                !showWorkingHours
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              24 Hours
            </button>
            <button
              onClick={() => setShowWorkingHours(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                showWorkingHours
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Working Hours
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 w-full overflow-x-auto custom-thin-scroll pb-4 pt-8">
          {!hasTickets ? (
            <EmptyState
              icon={Activity}
              title="No Activity Data"
              subtitle="Try adjusting your filters to see ticket activity patterns."
              className="min-h-[300px]"
            />
          ) : (
            <div className="min-w-[700px]">
              {(() => {
                const gridCols = showWorkingHours
                  ? 'repeat(5, minmax(0, 1fr)) 32px repeat(13, minmax(0, 1fr)) 40px repeat(6, minmax(0, 1fr))'
                  : '32px repeat(24, minmax(0, 1fr)) 40px';
                const offset = showWorkingHours ? 5 : 0;
                const totalCol = offset + (showWorkingHours ? 15 : 26);

                return (
                  <>
                    {/* X-Axis Labels (Hours) */}
                    <div
                      className="grid gap-1.5 mb-2 items-center"
                      style={{ gridTemplateColumns: gridCols }}
                    >
                      <div style={{ gridColumnStart: offset + 1, gridRowStart: 1 }} />{' '}
                      {/* Empty slot for Y-axis label */}
                      <AnimatePresence initial={false}>
                        {[
                          '12a',
                          '1a',
                          '2a',
                          '3a',
                          '4a',
                          '5a',
                          '6a',
                          '7a',
                          '8a',
                          '9a',
                          '10a',
                          '11a',
                          '12p',
                          '1p',
                          '2p',
                          '3p',
                          '4p',
                          '5p',
                          '6p',
                          '7p',
                          '8p',
                          '9p',
                          '10p',
                          '11p',
                        ]
                          .map((hr, i) => ({ hr, i }))
                          .filter(({ i }) => !showWorkingHours || (i >= 6 && i <= 18))
                          .map(({ hr, i }, filteredIdx) => (
                            <motion.div
                              key={i}
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                gridColumnStart: offset + filteredIdx + 2,
                                gridRowStart: 1,
                              }}
                              className="text-center text-[10px] font-semibold text-slate-400"
                            >
                              {hr}
                            </motion.div>
                          ))}
                      </AnimatePresence>
                      <div style={{ gridColumnStart: totalCol, gridRowStart: 1 }} />{' '}
                      {/* Empty slot for Row Total label */}
                    </div>

                    {/* The Grid */}
                    <div className="flex flex-col gap-1.5">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIdx) => (
                        <div
                          key={dayIdx}
                          className="grid gap-1.5 items-center"
                          style={{ gridTemplateColumns: gridCols }}
                        >
                          {/* Y-Axis Label (Day) */}
                          <motion.div
                            layout
                            transition={{ duration: 0.3 }}
                            className="text-[11px] font-semibold text-slate-400 text-right"
                            style={{ gridColumnStart: offset + 1, gridRowStart: 1 }}
                          >
                            {day}
                          </motion.div>

                          {/* 24 Hour Blocks */}
                          <AnimatePresence initial={false}>
                            {(() => {
                              const filteredBlocks = chartData.heatmapMatrix[dayIdx]
                                .map((val: number, hourIdx: number) => ({ val, hourIdx }))
                                .filter(
                                  ({ hourIdx }: any) =>
                                    !showWorkingHours || (hourIdx >= 6 && hourIdx <= 18)
                                );

                              return filteredBlocks.map(
                                ({ val, hourIdx }: any, filteredIdx: number) => {
                                  let bgClass = 'bg-slate-100/70 border-slate-200/50';
                                  if (val > 0) {
                                    const ratio = val / (chartData.maxHeat || 1);
                                    if (ratio <= 0.25)
                                      bgClass = 'bg-[#00bdd9]/20 border-[#00bdd9]/30';
                                    else if (ratio <= 0.5)
                                      bgClass = 'bg-[#00bdd9]/50 border-[#00bdd9]/60';
                                    else if (ratio <= 0.75)
                                      bgClass = 'bg-[#00bdd9]/80 border-[#00bdd9]/90';
                                    else bgClass = 'bg-[#00bdd9] border-[#0096ad]';
                                  }

                                  const isFirst = filteredIdx === 0;
                                  const isLast = filteredIdx === filteredBlocks.length - 1;

                                  return (
                                    <motion.div
                                      key={hourIdx}
                                      layout
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      transition={{ duration: 0.3 }}
                                      style={{
                                        gridColumnStart: offset + filteredIdx + 2,
                                        gridRowStart: 1,
                                      }}
                                      className={`aspect-square rounded-[3px] border ${bgClass} transition-all duration-200 hover:ring-2 hover:ring-offset-1 hover:ring-[#00bdd9]/50 group relative cursor-pointer`}
                                    >
                                      {/* Tooltip */}
                                      <div
                                        className={`absolute bottom-full mb-2 hidden group-hover:flex flex-col z-50 pointer-events-none ${isFirst ? 'left-0 items-start' : isLast ? 'right-0 items-end' : 'left-1/2 -translate-x-1/2 items-center'}`}
                                      >
                                        <div className="bg-white/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex flex-col min-w-[200px] transform transition-all duration-200">
                                          <p className="font-semibold text-foreground border-b border-border pb-2 mb-3 text-sm">
                                            {day} at{' '}
                                            {hourIdx === 0
                                              ? '12 AM'
                                              : hourIdx < 12
                                                ? `${hourIdx} AM`
                                                : hourIdx === 12
                                                  ? '12 PM'
                                                  : `${hourIdx - 12} PM`}
                                          </p>
                                          <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between gap-6">
                                              <div className="flex items-center gap-2.5">
                                                <div className="w-2.5 h-2.5 rounded-[3px] shadow-sm bg-[#00bdd9]" />
                                                <span className="text-[13px] font-medium text-muted-foreground">
                                                  Avg Tickets
                                                </span>
                                              </div>
                                              <span className="text-[14px] font-bold text-foreground">
                                                {val}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                }
                              );
                            })()}
                          </AnimatePresence>

                          {/* Row Total */}
                          <motion.div
                            layout
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-center ml-1"
                            style={{ gridColumnStart: totalCol, gridRowStart: 1 }}
                          >
                            <span className="text-[11px] font-bold text-slate-500">
                              {chartData.dayTotals[dayIdx]}
                            </span>
                          </motion.div>
                        </div>
                      ))}

                      {/* Column Totals Row */}
                      <div
                        className="grid gap-1.5 items-center mt-1"
                        style={{ gridTemplateColumns: gridCols }}
                      >
                        <motion.div
                          layout
                          transition={{ duration: 0.3 }}
                          className="text-[10px] font-bold text-slate-400 text-right"
                          style={{ gridColumnStart: offset + 1, gridRowStart: 1 }}
                        >
                          Avg
                        </motion.div>
                        <AnimatePresence initial={false}>
                          {chartData.hourTotals
                            .map((total: number, i: number) => ({ total, i }))
                            .filter(({ i }: any) => !showWorkingHours || (i >= 6 && i <= 18))
                            .map(({ total, i }: any, filteredIdx: number) => (
                              <motion.div
                                key={i}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                  gridColumnStart: offset + filteredIdx + 2,
                                  gridRowStart: 1,
                                }}
                                className="text-center text-[10px] font-bold text-slate-500"
                              >
                                {total}
                              </motion.div>
                            ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Bottom Bar: Badges + Legend */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="bg-[#00bdd9]/10 text-[#0096ad] text-[11px] px-2 py-0.5 rounded-full font-bold">
                    Peak Day: {chartData.peakDay}
                  </span>
                  <span className="bg-[#00bdd9]/10 text-[#0096ad] text-[11px] px-2 py-0.5 rounded-full font-bold">
                    Peak Time: {chartData.peakTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded-[2px] bg-slate-100/70 border border-slate-200/50"></div>
                  <div className="w-3 h-3 rounded-[2px] bg-[#00bdd9]/20 border border-[#00bdd9]/30"></div>
                  <div className="w-3 h-3 rounded-[2px] bg-[#00bdd9]/50 border border-[#00bdd9]/60"></div>
                  <div className="w-3 h-3 rounded-[2px] bg-[#00bdd9]/80 border border-[#00bdd9]/90"></div>
                  <div className="w-3 h-3 rounded-[2px] bg-[#00bdd9] border border-[#0096ad]"></div>
                  <span>More</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
