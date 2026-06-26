import React from 'react';
import { cn } from '../../lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200/60', className)} {...props} />;
}

// Higher-order skeleton layouts for specific pages

export function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-2xl border border-slate-200/60 bg-white">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-10 w-24 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 h-[400px]">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 h-[400px]">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientPortalSkeleton() {
  return (
    <div className="min-h-screen bg-white font-sans animate-in fade-in duration-500">
      <div className="relative overflow-hidden bg-slate-50 border-b border-slate-200">
        <div className="relative z-40 bg-white/80 border-b border-slate-200 p-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10 pb-16 pt-14 space-y-4">
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-6 w-[500px]" />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col space-y-6 relative ml-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center p-6 bg-white border border-slate-200 rounded-2xl shadow-sm h-[110px]"
              >
                <Skeleton className="w-14 h-14 rounded-2xl shrink-0 mr-6" />
                <div className="flex-1 space-y-2.5">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="w-24 h-8 rounded-lg ml-4" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/80 rounded-2xl p-6 border border-slate-200/60 h-[300px]">
              <Skeleton className="h-6 w-40 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppLoadingSkeleton() {
  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-white flex-shrink-0 flex flex-col p-4 border-r border-slate-200">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-50">
        <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0">
          <Skeleton className="h-10 w-[300px] rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="flex-1 p-6 overflow-hidden">
          <div className="w-full h-full rounded-2xl border border-slate-200/60 bg-white p-6">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-64" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-24 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>
            <Skeleton className="w-full h-[60px] rounded-lg mb-4" />
            <Skeleton className="w-full h-[400px] rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
