import React, { useMemo } from 'react';
import {
  ShieldCheck,
  GraduationCap,
  Star,
  AlertCircle,
  ArrowRight,
  HeartPulse,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useAcademyStore } from '../../store/useAcademyStore';
import { useSupportStore } from '../../store/useSupportStore';
import { Tooltip as UITooltip } from '../ui/Tooltip';
import { calculateProjectHealth } from '../../utils/scoringUtils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Label,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const order = ['Support CSAT', 'Onboarding CSAT', 'Knowledge Checks', 'Platform NPS'];

    const sortedPayload = [...payload].sort((a, b) => {
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

    return (
      <div className="bg-white/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex flex-col min-w-[200px] transform transition-all duration-200">
        <p className="font-semibold text-foreground border-b border-border pb-2 mb-3 text-sm">
          {label}
        </p>
        <div className="flex flex-col gap-3">
          {sortedPayload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-[3px] shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[13px] font-medium text-muted-foreground">
                  {entry.name}
                </span>
              </div>
              <span className="text-[14px] font-bold text-foreground">
                {entry.value}
                {entry.name === 'Platform NPS' ? '' : '%'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex flex-col min-w-[200px] transform transition-all duration-200">
        <p className="font-semibold text-foreground border-b border-border pb-2 mb-3 text-sm">
          Sentiment
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-[3px] shadow-sm"
                style={{ backgroundColor: payload[0].payload.color }}
              />
              <span className="text-[13px] font-medium text-muted-foreground">
                {payload[0].name}
              </span>
            </div>
            <span className="text-[14px] font-bold text-foreground">
              {payload[0].value}{' '}
              <span className="text-[12px] font-normal text-muted-foreground ml-0.5">
                responses
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  const order = ['Support CSAT', 'Onboarding CSAT', 'Knowledge Checks', 'Platform NPS'];

  // Sort payload elements based on the exact predefined order
  const sortedPayload = [...(payload || [])].sort((a, b) => {
    return order.indexOf(a.value) - order.indexOf(b.value);
  });

  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] font-semibold text-slate-600 pt-4 pb-2">
      {sortedPayload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.value}
        </li>
      ))}
    </ul>
  );
};

export function QualityMetricsWidget() {
  const clients = useAppStore((state) => state.clients);
  const projects = useAppStore((state) => state.projects);
  const settings = useAppStore((state) => state.settings);
  const quizAttempts = useAcademyStore((state) => state.quizAttempts);

  const dateRange = useSupportStore((state) => state.dateRange);
  const customStartDate = useSupportStore((state) => state.customStartDate);
  const customEndDate = useSupportStore((state) => state.customEndDate);

  const data = useMemo(() => {
    // KPIs
    let supportTotal = 0,
      supportCount = 0;
    let onboardingTotal = 0,
      onboardingCount = 0;
    let kbTotal = 0,
      kbCount = 0;
    let npsTotal = 0,
      npsCount = 0;

    // Sentiment
    let promoters = 0,
      passives = 0,
      detractors = 0;

    // Dynamic Trend Generation based on Global Date Filter
    const getTrendConfig = () => {
      const now = new Date();
      now.setHours(23, 59, 59, 999);

      let start = new Date();
      let type: 'day' | 'week' | 'month' = 'day';
      let length = 7;

      if (dateRange === '7d') {
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        type = 'day';
        length = 7;
      } else if (dateRange === 'thisMonth') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        type = 'week';
        length = 5; // Roughly 5 weeks max per month
      } else if (dateRange === 'lastMonth') {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        type = 'week';
        length = 5;
      } else if (dateRange === 'thisQuarter') {
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), quarterStartMonth, 1);
        type = 'week';
        length = 14; // max 14 weeks in a quarter
      } else if (dateRange === 'lastQuarter') {
        const lastQuarterStartMonth = Math.floor(now.getMonth() / 3) * 3 - 3;
        start = new Date(now.getFullYear(), lastQuarterStartMonth, 1);
        type = 'week';
        length = 14;
      } else if (dateRange === 'ytd') {
        start = new Date(now.getFullYear(), 0, 1);
        type = 'month';
        length = now.getMonth() + 1;
      } else if (dateRange === 'all') {
        start = new Date();
        start.setFullYear(now.getFullYear() - 1);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        type = 'month';
        length = 13;
      } else if (dateRange === 'custom' && customStartDate && customEndDate) {
        start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEndDate);
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          type = 'day';
          length = diffDays + 1;
        } else if (diffDays <= 90) {
          type = 'week';
          length = Math.ceil(diffDays / 7);
          if (length === 0) length = 1;
        } else {
          type = 'month';
          const diffMonths =
            (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
          length = diffMonths + 1;
        }
      }

      const bins = [];
      for (let i = 0; i < length; i++) {
        const binStart = new Date(start);
        const binEnd = new Date(start);
        let label = '';

        if (type === 'day') {
          binStart.setDate(start.getDate() + i);
          binEnd.setDate(start.getDate() + i);
          binEnd.setHours(23, 59, 59, 999);
          label = binStart.toLocaleDateString('default', { weekday: 'short' });
        } else if (type === 'week') {
          binStart.setDate(start.getDate() + i * 7);
          binEnd.setDate(start.getDate() + i * 7 + 6);
          binEnd.setHours(23, 59, 59, 999);
          // Week of [Date]
          label = `Week of ${binStart.toLocaleDateString('default', { month: 'short', day: 'numeric' })}`;
        } else if (type === 'month') {
          binStart.setMonth(start.getMonth() + i);
          binStart.setDate(1);
          binEnd.setMonth(start.getMonth() + i + 1);
          binEnd.setDate(0);
          binEnd.setHours(23, 59, 59, 999);
          label = binStart.toLocaleDateString('default', { month: 'short', year: '2-digit' });
        }

        bins.push({
          label,
          start: binStart.getTime(),
          end: binEnd.getTime(),
          sTotal: 0,
          sCount: 0,
          oTotal: 0,
          oCount: 0,
          kTotal: 0,
          kCount: 0,
          nTotal: 0,
          nCount: 0,
        });
      }
      return bins;
    };

    const trendBins = getTrendConfig();

    const isInTimeframe = (dateInput?: string | number) => {
      if (!dateInput) return false;
      const created = new Date(dateInput);
      if (isNaN(created.getTime())) return false;

      const now = new Date();
      let start = new Date(0);
      let end = new Date(now);

      if (dateRange === '7d') {
        start = new Date();
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        end = now;
      } else if (dateRange === 'thisMonth') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
      } else if (dateRange === 'lastMonth') {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      } else if (dateRange === 'thisQuarter') {
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), quarterStartMonth, 1);
        end = now;
      } else if (dateRange === 'lastQuarter') {
        const lastQuarterStartMonth = Math.floor(now.getMonth() / 3) * 3 - 3;
        start = new Date(now.getFullYear(), lastQuarterStartMonth, 1);
        end = new Date(now.getFullYear(), lastQuarterStartMonth + 3, 0, 23, 59, 59, 999);
      } else if (dateRange === 'ytd') {
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
      } else if (dateRange === 'all') {
        return true;
      } else if (dateRange === 'custom') {
        start = customStartDate ? new Date(customStartDate) : new Date(0);
        start.setHours(0, 0, 0, 0);
        const customEnd = customEndDate ? new Date(customEndDate) : new Date();
        end = new Date(customEnd.getTime());
        end.setHours(23, 59, 59, 999);
      }

      return created >= start && created <= end;
    };

    const addToTrend = (type: 's' | 'o' | 'k' | 'n', dateInput: string | number, score: number) => {
      if (!dateInput || isNaN(score)) return;
      if (!isInTimeframe(dateInput)) return; // Only plot points that match the current filter

      const d = new Date(dateInput);
      const time = d.getTime();
      if (isNaN(time)) return;

      const match = trendBins.find((b) => time >= b.start && time <= b.end);
      if (match) {
        match[`${type}Total`] += score;
        match[`${type}Count`]++;
      }
    };

    // Process Clients (Support CSAT & NPS)
    clients.forEach((client) => {
      // Support CSAT
      if (
        client.supportCsatHistory &&
        Array.isArray(client.supportCsatHistory) &&
        client.supportCsatHistory.length > 0
      ) {
        client.supportCsatHistory.forEach((csat) => {
          if (isInTimeframe(csat.submittedAt)) {
            supportTotal += csat.score;
            supportCount++;
            promoters += csat.promoters || 0;
            passives += csat.passives || 0;
            detractors += csat.detractors || 0;
          }
          addToTrend('s', csat.submittedAt, csat.score);
        });
      } else if (dateRange === 'all') {
        if (client.supportCsat && typeof client.supportCsat.score === 'number') {
          supportTotal += client.supportCsat.score;
          supportCount++;
          promoters += client.supportCsat.promoters || 0;
          passives += client.supportCsat.passives || 0;
          detractors += client.supportCsat.detractors || 0;
        } else if (client.clientCsat !== undefined && client.clientCsat !== null) {
          const score =
            typeof client.clientCsat === 'number'
              ? client.clientCsat
              : parseFloat(client.clientCsat);
          if (!isNaN(score)) {
            supportTotal += score;
            supportCount++;
          }
        }
      }

      // Platform NPS
      if (
        client.clientNpsHistory &&
        Array.isArray(client.clientNpsHistory) &&
        client.clientNpsHistory.length > 0
      ) {
        client.clientNpsHistory.forEach((nps) => {
          if (isInTimeframe(nps.submittedAt)) {
            npsTotal += nps.score;
            npsCount++;
          }
          addToTrend('n', nps.submittedAt, nps.score);
        });
      } else if (dateRange === 'all') {
        if (client.clientNps && typeof client.clientNps.score === 'number') {
          npsTotal += client.clientNps.score;
          npsCount++;
        }
      }
    });
    // Process Projects (Onboarding CSAT)
    projects.forEach((project) => {
      const rawCsat = project.onboardingCsat || project.health?.onboardingCsat || project.csat;
      if (rawCsat !== undefined) {
        // Prioritize the project's release date so that users can control which month the CSAT belongs to
        let dateToUse =
          project.releaseDateStr ||
          project.releaseDateVal ||
          project.releaseDate ||
          project.health?.onboardingCsat?.submittedAt ||
          project.onboardingCsat?.submittedAt ||
          project.createdAt;

        // Ensure date is a valid parsable string for addToTrend and isInTimeframe
        if (typeof dateToUse === 'number') {
          dateToUse = new Date(dateToUse).toISOString();
        }

        const projectHealth = calculateProjectHealth(project, settings);

        let score = NaN;
        if (typeof projectHealth.csat === 'number') {
          score = projectHealth.csat;
        }

        if (isInTimeframe(dateToUse)) {
          if (!isNaN(score)) {
            onboardingTotal += score;
            onboardingCount++;
          }
        }
        if (dateToUse) {
          addToTrend('o', dateToUse, score);
        }
      }
    });

    // Process Quizzes (Knowledge Checks)
    quizAttempts.forEach((attempt) => {
      const score = typeof attempt.score === 'number' ? attempt.score : parseFloat(attempt.score);
      if (isInTimeframe(attempt.completedAt)) {
        if (!isNaN(score)) {
          kbTotal += score;
          kbCount++;
        }
      }
      addToTrend('k', attempt.completedAt, score);
    });

    // Finalize Trend Data
    const trendData = trendBins.map((b) => ({
      name: b.label,
      Support: b.sCount > 0 ? Math.round(b.sTotal / b.sCount) : null,
      Onboarding: b.oCount > 0 ? Math.round(b.oTotal / b.oCount) : null,
      Knowledge: b.kCount > 0 ? Math.round(b.kTotal / b.kCount) : null,
      NPS: b.nCount > 0 ? Math.round(b.nTotal / b.nCount) : null,
    }));

    const sentimentData = [
      { name: 'Promoters', value: promoters, color: '#10b981' },
      { name: 'Passives', value: passives, color: '#f59e0b' },
      { name: 'Detractors', value: detractors, color: '#ef4444' },
    ].filter((d) => d.value > 0);

    return {
      kpis: {
        support: supportCount > 0 ? `${Math.round(supportTotal / supportCount)}%` : 'N/A',
        onboarding:
          onboardingCount > 0 ? `${Math.round(onboardingTotal / onboardingCount)}%` : 'N/A',
        knowledge: kbCount > 0 ? `${Math.round(kbTotal / kbCount)}%` : 'N/A',
        nps: npsCount > 0 ? Math.round(npsTotal / npsCount) : 'N/A',
      },
      trendData,
      sentimentData,
    };
  }, [clients, projects, quizAttempts, dateRange, customStartDate, customEndDate]);
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">Quality Metrics</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track customer satisfaction, internal knowledge, and overall platform sentiment.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="flex flex-col rounded-xl border border-border bg-white p-3.5 group hover:shadow-sm hover:-translate-y-0.5 hover:border-blue-500/40 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/5 group-hover:bg-blue-500/10 rounded-full blur-xl transition-colors duration-200"></div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
              Support CSAT
              <UITooltip content="Average Satisfaction score from Happyfox Support Tickets in this timeframe">
                <AlertCircle className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help" />
              </UITooltip>
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            {data.kpis.support}
          </span>
        </div>

        <div className="flex flex-col rounded-xl border border-border bg-white p-3.5 group hover:shadow-sm hover:-translate-y-0.5 hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-full blur-xl transition-colors duration-200"></div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
              Onboarding CSAT
              <UITooltip content="Average Satisfaction score from completed Project Onboarding surveys in this timeframe">
                <AlertCircle className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help" />
              </UITooltip>
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            {data.kpis.onboarding}
          </span>
        </div>

        <div className="flex flex-col rounded-xl border border-border bg-white p-3.5 group hover:shadow-sm hover:-translate-y-0.5 hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/5 group-hover:bg-purple-500/10 rounded-full blur-xl transition-colors duration-200"></div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-3 h-3" />
            </div>
            <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
              Knowledge Checks
              <UITooltip content="Average score of completed Academy Knowledge Checks in this timeframe">
                <AlertCircle className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help" />
              </UITooltip>
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            {data.kpis.knowledge}
          </span>
        </div>

        <div className="flex flex-col rounded-xl border border-border bg-white p-3.5 group hover:shadow-sm hover:-translate-y-0.5 hover:border-rose-500/40 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/5 group-hover:bg-rose-500/10 rounded-full blur-xl transition-colors duration-200"></div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <div className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-3 h-3" />
            </div>
            <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
              Platform NPS
              <UITooltip content="Average Net Promoter Score given by users across the platform in this timeframe">
                <AlertCircle className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help" />
              </UITooltip>
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">{data.kpis.nps}</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Donut */}
        <div className="bg-white border border-border shadow-sm rounded-xl p-6">
          <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            Support CSAT Sentiment
            <UITooltip content="Breakdown of Promoters, Passives, and Detractors based on selected timeframe.">
              <AlertCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
            </UITooltip>
          </h4>
          {data.sentimentData.length > 0 ? (
            <div className="h-[200px] w-full flex items-center">
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={5}
                    >
                      {data.sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <Label
                        value={data.sentimentData
                          .reduce((acc, curr) => acc + curr.value, 0)
                          .toString()}
                        position="center"
                        fill="#0f172a"
                        style={{ fontSize: '24px', fontWeight: 900 }}
                      />
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} cursor={{ fill: 'transparent' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center gap-3 ml-4 shrink-0 pr-4">
                {data.sentimentData.map((entry, idx) => (
                  <div
                    className="flex items-center gap-2.5 text-sm font-semibold text-muted-foreground"
                    key={idx}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] w-full flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">No sentiment data</span>
            </div>
          )}
        </div>

        {/* Historical Trend */}
        <div className="lg:col-span-2 bg-white border border-border shadow-sm rounded-xl p-6">
          <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            Historical Trend
          </h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.trendData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1eaeb" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#74868a', fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#74868a', fontWeight: 500 }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#f8fafa', strokeWidth: 2 }}
                />
                <Legend content={<CustomLegend />} />
                <Line
                  name="Support CSAT"
                  type="monotone"
                  dataKey="Support"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                  filter="url(#shadow)"
                />
                <Line
                  name="Onboarding CSAT"
                  type="monotone"
                  dataKey="Onboarding"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                  filter="url(#shadow)"
                />
                <Line
                  name="Knowledge Checks"
                  type="monotone"
                  dataKey="Knowledge"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                  filter="url(#shadow)"
                />
                <Line
                  name="Platform NPS"
                  type="monotone"
                  dataKey="NPS"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                  filter="url(#shadow)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
