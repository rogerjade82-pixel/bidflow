import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, facebookProvider, googleProvider } from '../lib/firebase';
import { auctionService } from '../services/auctionService';
import { UserProfile } from '../types';

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithFacebook: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Upsert basic info
        await auctionService.upsertUserProfile(u.uid, {
          displayName: u.displayName || 'Anonymous',
          email: u.email || '',
          photoURL: u.photoURL || ''
        });
        const userProfile = await auctionService.getUserProfile(u.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await auctionService.getUserProfile(user.uid);
      setProfile(userProfile);
    }
  };

  const isAdmin = user?.email === 'rogerjade82@gmail.com';

  const signInWithFacebook = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        alert("Facebook login is not enabled in the Firebase Console. Please enable it under Authentication > Sign-in method.");
      }
      console.error("Facebook Login failed", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        alert("Google login is not enabled in the Firebase Console. Please enable it under Authentication > Sign-in method.");
      }
      console.error("Google Login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return { user, profile, loading, isAdmin, signInWithFacebook, signInWithGoogle, logout, refreshProfile };
}
