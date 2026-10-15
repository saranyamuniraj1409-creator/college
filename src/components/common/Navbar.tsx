import React, { useState } from 'react';
import {
  GraduationCap,
  Database,
  Sparkles,
  Bell,
  LogOut,
  ChevronDown,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCollegeData } from '../../context/CollegeDataContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenDbModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDbModal }) => {
  const { currentUser, role, logout, switchRole, isSupabaseActive } = useAuth();
  const { announcements } = useCollegeData();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const roleLabels: Record<UserRole, { title: string; badge: string; color: string }> = {
    student: { title: 'Student Portal', badge: 'Student', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
    advisor: { title: 'Class Advisor', badge: 'Class Advisor', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
    hod: { title: 'Head of Department', badge: 'HOD', color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
    admin: { title: 'Central Administration', badge: 'Administrator', color: 'bg-amber-500/10 text-amber-800 border-amber-200' },
  };

  const currentRoleInfo = roleLabels[role];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Branding & Role info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white">CampusConnect</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                ERP v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden md:block">
              Smart College Management System • {currentUser?.departmentName || 'Information Technology'}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Supabase Status Button */}
          <button
            onClick={onOpenDbModal}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isSupabaseActive
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Click to configure or view Supabase PostgreSQL database settings"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSupabaseActive ? 'Supabase Active' : 'Demo DB (Local)'}
            </span>
            {isSupabaseActive ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>

          {/* Gemini AI Status Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gemini AI Ready</span>
          </div>

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">{currentRoleInfo.badge}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-2 z-50">
                <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700/60 mb-1">
                  Switch Active Role
                </div>
                {(['student', 'advisor', 'hod', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-700/70 transition ${
                      role === r ? 'text-blue-400 bg-blue-950/40 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span>{roleLabels[r].badge}</span>
                    {role === r && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {announcements.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Recent Announcements ({announcements.length})
                  </span>
                </div>
                <div className="divide-y divide-slate-700/60 max-h-72 overflow-y-auto">
                  {announcements.slice(0, 4).map((a) => (
                    <div key={a.id} className="py-2.5 text-left">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-medium">
                          {a.category}
                        </span>
                        <span>{a.publishedDate}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 line-clamp-1">{a.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{a.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-2 border-l border-slate-700 pl-2">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-white leading-tight">
                {currentUser?.fullName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentUser?.rollNumber || currentUser?.employeeCode || 'Central ERP'}
              </span>
            </div>
            
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
