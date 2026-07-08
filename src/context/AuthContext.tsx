import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../api/firebase';
import { toast } from '../utils/toast';
import { useAppStore } from '../store/useAppStore';
import { AppUser } from '../types';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUser: setZustandUser } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Enforce @avesdo.com domain restriction
        if (!currentUser.email?.endsWith('@avesdo.com')) {
          auth.signOut().then(() => {
            toast.error('Access Denied: Only @avesdo.com email addresses are authorized.');
            setUser(null);
            setAppUser(null);
            setZustandUser(null);
            setLoading(false);
          });
          return;
        }

        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          let finalAppUser: AppUser;
          const emailKey = currentUser.email.toLowerCase();

          if (!userSnap.exists()) {
            // First login logic
            let roleId = 'viewer'; // Default role

            // Check invitations
            const inviteRef = doc(db, 'invitations', emailKey);
            const inviteSnap = await getDoc(inviteRef);

            if (inviteSnap.exists()) {
              roleId = inviteSnap.data().roleId;
              await deleteDoc(inviteRef); // Remove invite
            } else {
              // Fetch settings to find default role
              const settingsRef = doc(db, 'settings', 'global_config');
              const settingsSnap = await getDoc(settingsRef);
              if (settingsSnap.exists()) {
                const roles = settingsSnap.data().roles || [];
                const defaultRole = roles.find((r: any) => r.isDefault);
                if (defaultRole) {
                  roleId = defaultRole.id;
                }
              }
            }

            // Failsafe bootstrap for you
            if (emailKey === 'support@avesdo.com') {
              roleId = 'super_admin';
            }

            finalAppUser = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              roleId,
              createdAt: new Date().getTime(),
              lastLogin: new Date().getTime(),
            };
            await setDoc(userRef, finalAppUser);
          } else {
            const data = userSnap.data();
            finalAppUser = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || data.displayName || '',
              photoURL: currentUser.photoURL || data.photoURL || '',
              roleId: data.roleId || 'viewer',
              createdAt: data.createdAt || new Date().getTime(),
              lastLogin: new Date().getTime(),
            };

            // Failsafe bootstrap for existing but wrong role
            if (emailKey === 'support@avesdo.com' && finalAppUser.roleId !== 'super_admin') {
              finalAppUser.roleId = 'super_admin';
            }

            await setDoc(userRef, finalAppUser, { merge: true });
          }

          setUser(currentUser);
          setAppUser(finalAppUser);
          setZustandUser(finalAppUser);
        } catch (err) {
          console.error('Error setting up user profile:', err);
          toast.error('Failed to setup user profile');
        }
      } else {
        setUser(null);
        setAppUser(null);
        setZustandUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setZustandUser]);

  const loginWithGoogle = async () => {
    try {
      googleProvider.setCustomParameters({
        hd: 'avesdo.com', // Hint to Google to use Avesdo domain
      });
      const result = await signInWithPopup(auth, googleProvider);
      if (!result.user.email?.endsWith('@avesdo.com')) {
        await auth.signOut();
        toast.error('Access Denied: Only @avesdo.com email addresses are authorized');
        return;
      }
      toast.success(`Welcome, ${result.user.displayName || result.user.email}`);
    } catch (error: any) {
      console.error('Login failed:', error);
      if (
        error.code !== 'auth/popup-closed-by-user' &&
        error.code !== 'auth/cancelled-popup-request'
      ) {
        toast.error('Authentication failed. Please try again');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, loginWithGoogle, logout }}>
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
