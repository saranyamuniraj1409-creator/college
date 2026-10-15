import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_PROFILES } from '../data/initialData';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  loginAsDemoRole: (role: UserRole) => void;
  loginWithCredentials: (email: string, pass: string, targetRole: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  isSupabaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('student');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('campus_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PROFILES.student;
      }
    }
    return INITIAL_PROFILES.student;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('campus_auth_status') === 'authenticated';
  });

  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(isSupabaseConfigured());

  useEffect(() => {
    setIsSupabaseActive(isSupabaseConfigured());
  }, []);

  const loginAsDemoRole = (targetRole: UserRole) => {
    const profile = INITIAL_PROFILES[targetRole] || INITIAL_PROFILES.student;
    setCurrentUser(profile);
    setRole(targetRole);
    setIsAuthenticated(true);
    localStorage.setItem('campus_current_user', JSON.stringify(profile));
    localStorage.setItem('campus_auth_status', 'authenticated');
    localStorage.setItem('campus_active_role', targetRole);
  };

  const loginWithCredentials = async (
    email: string,
    pass: string,
    targetRole: UserRole
  ): Promise<{ success: boolean; message?: string }> => {
    const supabase = getSupabaseClient();
    
    // If Supabase is active and has credentials, authenticate against Supabase Auth
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          return { success: false, message: error.message };
        }

        if (data.user) {
          // Fetch profile from profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_id', data.user.id)
            .single();

          const userProfile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: profileData?.full_name || email.split('@')[0],
            role: (profileData?.role as UserRole) || targetRole,
            departmentCode: profileData?.department_code || 'IT',
            departmentName: profileData?.department_name || 'Information Technology',
            avatarUrl: profileData?.avatar_url,
          };

          setCurrentUser(userProfile);
          setRole(userProfile.role);
          setIsAuthenticated(true);
          localStorage.setItem('campus_current_user', JSON.stringify(userProfile));
          localStorage.setItem('campus_auth_status', 'authenticated');
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, message: err?.message || 'Authentication error' };
      }
    }

    // Default Demo Authentication fallback
    if (email && pass) {
      const demoUser = INITIAL_PROFILES[targetRole];
      setCurrentUser(demoUser);
      setRole(targetRole);
      setIsAuthenticated(true);
      localStorage.setItem('campus_current_user', JSON.stringify(demoUser));
      localStorage.setItem('campus_auth_status', 'authenticated');
      return { success: true };
    }

    return { success: false, message: 'Please provide valid login credentials' };
  };

  const logout = () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('campus_current_user');
    localStorage.removeItem('campus_auth_status');
    localStorage.removeItem('campus_active_role');
  };

  const switchRole = (newRole: UserRole) => {
    loginAsDemoRole(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAuthenticated,
        loginAsDemoRole,
        loginWithCredentials,
        logout,
        switchRole,
        isSupabaseActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
