import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  role: 'advertiser' | 'screen_owner' | 'admin';
  business_name: string;
  contact_email: string;
  phone?: string;
  website?: string;
  description?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, role: string, businessName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Defer any Supabase calls to avoid deadlocks, pass the user from session
        setTimeout(() => {
          fetchProfile(session.user!.id, session.user!);
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Then get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, currentUser?: User) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      // If no profile exists, create one from auth metadata
      if (!data) {
        // Use currentUser if provided, otherwise fall back to user state
        const userForMeta = currentUser || user;
        const roleFromMeta = ((userForMeta?.user_metadata as any)?.role ?? 'advertiser') as UserProfile['role'];
        const businessFromMeta = (userForMeta?.user_metadata as any)?.business_name as string | undefined;
        const contactEmail = userForMeta?.email ?? '';

        console.log('Creating profile with role:', roleFromMeta, 'from metadata:', userForMeta?.user_metadata);

        const { data: inserted, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            role: roleFromMeta,
            business_name: businessFromMeta || 'Business',
            contact_email: contactEmail,
            is_verified: false,
          })
          .select('*')
          .single();

        if (insertError) throw insertError;
        setProfile(inserted as UserProfile);
        return;
      }

      // If profile exists but role differs from metadata, sync it (when metadata present)
      const userForMeta = currentUser || user;
      const metaRole = (userForMeta?.user_metadata as any)?.role as UserProfile['role'] | undefined;
      
      console.log('Profile exists with role:', data.role, 'metadata role:', metaRole);
      
      if (metaRole && data.role !== metaRole) {
        console.log('Syncing role from metadata:', metaRole);
        const { data: updated, error: updateError } = await supabase
          .from('user_profiles')
          .update({ role: metaRole })
          .eq('user_id', userId)
          .select('*')
          .maybeSingle();
        if (updateError) throw updateError;
        setProfile((updated as UserProfile) ?? (data as UserProfile));
        return;
      }

      setProfile((data as UserProfile) ?? null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: string, businessName: string) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role,
            business_name: businessName,
          }
        }
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Proactively ensure profile exists and role is synced right after login
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await fetchProfile(userData.user.id, userData.user);
      }

      toast({
        title: "Success",
        description: "Signed in successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Signed out successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchProfile(user.id);
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};