import React, { useEffect } from 'react';
import * as lucide from 'lucide';

export default function Settings() {
    useEffect(() => {
        if (lucide && lucide.createIcons) lucide.createIcons();
    });

    return (
        <div className="flex flex-1 overflow-hidden flex-col bg-slate-50/50 p-6">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <h1 className="text-3xl font-semibold text-foreground tracking-tight">System Settings</h1>
            </div>

            <div className="flex-1 bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col p-12 items-center justify-center text-center">
                <i data-lucide="settings" className="w-16 h-16 text-muted-foreground opacity-20 mb-4 animate-spin-slow"></i>
                <h2 className="text-xl font-semibold mb-2">Settings Configuration Migrating</h2>
                <p className="text-muted-foreground max-w-md">
                    The dynamic settings configuration interface is currently being rewritten into functional React components. 
                </p>
            </div>
        </div>
    );
}