import React, { createContext, useContext, useState, useEffect } from 'react';
import { setupRealtimeListeners } from '../js/api';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
    const [state, setState] = useState({
        settings: null,
        clients: [],
        projects: [],
        services: [],
        user: null,
        timestamp: "0",
        ready: false,
    });

    useEffect(() => {
        setupRealtimeListeners((newState) => {
            setState({
                ...newState,
                ready: true
            });
        });
    }, []);

    if (!state.ready) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground animate-pulse">Loading Workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <AppStateContext.Provider value={state}>
            {children}
        </AppStateContext.Provider>
    );
}

export function useAppState() {
    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error("useAppState must be used within an AppStateProvider");
    }
    return context;
}