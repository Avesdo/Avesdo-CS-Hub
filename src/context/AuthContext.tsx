import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../api/firebase';
import { toast } from '../utils/toast';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // Enforce @avesdo.com domain restriction
                if (!currentUser.email?.endsWith('@avesdo.com')) {
                    auth.signOut().then(() => {
                        toast.error('Access Denied: Only @avesdo.com email addresses are authorized.');
                        setUser(null);
                        setLoading(false);
                    });
                    return;
                }
                setUser(currentUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        try {
            googleProvider.setCustomParameters({
                hd: 'avesdo.com' // Hint to Google to use Avesdo domain
            });
            const result = await signInWithPopup(auth, googleProvider);
            if (!result.user.email?.endsWith('@avesdo.com')) {
                await auth.signOut();
                toast.error('Access Denied: Only @avesdo.com email addresses are authorized.');
                return;
            }
            toast.success(`Welcome, ${result.user.displayName || result.user.email}!`);
        } catch (error: any) {
            console.error("Login failed:", error);
            if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                toast.error('Authentication failed. Please try again.');
            }
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            toast.success('Successfully logged out.');
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error('Failed to log out.');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
