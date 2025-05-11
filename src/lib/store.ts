import { create } from 'zustand';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from './database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
}

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchProfileWithRetry = async (userId: string, retries = MAX_RETRIES): Promise<Profile> => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      if (retries > 0) {
        await sleep(RETRY_DELAY);
        return fetchProfileWithRetry(userId, retries - 1);
      }
      throw new Error('Failed to fetch user profile after multiple attempts');
    }

    if (!profile) {
      if (retries > 0) {
        await sleep(RETRY_DELAY);
        return fetchProfileWithRetry(userId, retries - 1);
      }
      throw new Error('Profile not found after multiple attempts');
    }

    return profile;
  } catch (error) {
    if (retries > 0) {
      await sleep(RETRY_DELAY);
      return fetchProfileWithRetry(userId, retries - 1);
    }
    throw error;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  signIn: async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const normalizedEmail = email.toLowerCase().trim();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      const profile = await fetchProfileWithRetry(data.user.id);
      set({ user: data.user, profile });
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  },
  signUp: async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const normalizedEmail = email.toLowerCase().trim();
      const siteUrl = window.location.origin;

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user data returned');

      const profile = await fetchProfileWithRetry(data.user.id);
      set({ user: data.user, profile });
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, profile: null });
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  },
  loadProfile: async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      if (!session) {
        set({ user: null, profile: null, isLoading: false });
        return;
      }

      const profile = await fetchProfileWithRetry(session.user.id);
      set({
        user: session.user,
        profile,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      set({ user: null, profile: null, isLoading: false });
    }
  },
  resendVerification: async (email: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-verification`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend verification email');
      }
    } catch (error: any) {
      console.error('Error resending verification:', error);
      throw new Error(error.message || 'Failed to resend verification email');
    }
  },
}));