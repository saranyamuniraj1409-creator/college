import React, { useState } from 'react';
import {
  GraduationCap,
  UserCheck,
  Building2,
  ShieldCheck,
  LogIn,
  Eye,
  EyeOff,
  Sparkles,
  Database,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { INITIAL_PROFILES } from '../../data/initialData';

interface LoginPortalProps {
  onOpenDbModal: () => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onOpenDbModal }) => {
  const { loginAsDemoRole, loginWithCredentials, isSupabaseActive } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const roleConfigs: Record<
    UserRole,
    {
      label: string;
      title: string;
      description: string;
      icon: React.ElementType;
      defaultEmail: string;
      accentBg: string;
      accentBorder: string;
      features: string[];
    }
  > = {
    student: {
      label: 'Student',
      title: 'Student Portal Login',
      description: 'Access attendance records, internal marks, semester results, CGPA calculator, timetable, and AI study assistant.',
      icon: GraduationCap,
      defaultEmail: INITIAL_PROFILES.student.email,
      accentBg: 'bg-blue-600',
      accentBorder: 'border-blue-500',
      features: ['Attendance & Alerts', 'Internal Marks & GPA', 'Assignment Submissions', 'Gemini Study Mentor'],
    },
    advisor: {
      label: 'Class Advisor',
      title: 'Class Advisor Portal',
      description: 'Manage class attendance, enter internal marks, review student leave applications, and track students with low attendance (<75%).',
      icon: UserCheck,
      defaultEmail: INITIAL_PROFILES.advisor.email,
      accentBg: 'bg-indigo-600',
      accentBorder: 'border-indigo-500',
      features: ['Daily Period Attendance', 'Low Attendance Alerts', 'Internal Marks Entry', 'Leave Approvals'],
    },
    hod: {
      label: 'HOD',
      title: 'Head of Department Portal',
      description: 'Review department-wide performance, faculty workload, attendance analytics, escalated leave requests, and academic reports.',
      icon: Building2,
      defaultEmail: INITIAL_PROFILES.hod.email,
      accentBg: 'bg-purple-600',
      accentBorder: 'border-purple-500',
      features: ['Department Analytics', 'Faculty Allocation', 'Academic Interventions', 'Leave Escalations'],
    },
    admin: {
      label: 'Admin',
      title: 'Central ERP Administration',
      description: 'Manage student and faculty records, department structures, subjects, college announcements, and system access policies.',
      icon: ShieldCheck,
      defaultEmail: INITIAL_PROFILES.admin.email,
      accentBg: 'bg-slate-800',
      accentBorder: 'border-slate-700',
      features: ['Student Directory', 'Faculty & HOD Roles', 'Subject Curriculum', 'College Announcements'],
    },
  };

  const currentConfig = roleConfigs[selectedRole];
  const IconComponent = currentConfig.icon;

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(roleConfigs[role].defaultEmail);
    setPassword('campus123');
    setErrorMessage('');
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const userEmail = email.trim() || currentConfig.defaultEmail;
    const userPass = password.trim() || 'campus123';

    const res = await loginWithCredentials(userEmail, userPass, selectedRole);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    loginAsDemoRole(role);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      
      {/* Top Banner */}
      <div className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white">CampusConnect ERP</span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              NAAC A++ Accredited Institution
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={onOpenDbModal}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition ${
              isSupabaseActive
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSupabaseActive ? 'Supabase Connected' : 'Database Settings'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
        
        {/* Header Text */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-700/50 text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI-Powered Academic Intelligence & College Operations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            CampusConnect ERP Portal
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Select your university portal login below to access your role-specific dashboard.
          </p>
        </div>

        {/* 4 Login Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto w-full mb-6">
          {(['student', 'advisor', 'hod', 'admin'] as UserRole[]).map((r) => {
            const config = roleConfigs[r];
            const TabIcon = config.icon;
            const isSelected = selectedRole === r;
            return (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`flex items-center space-x-2 px-3.5 py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 text-left ${
                  isSelected
                    ? `${config.accentBg} text-white border-transparent shadow-lg shadow-blue-900/40 ring-2 ring-blue-400/30 scale-102`
                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold leading-tight">{config.label}</div>
                  <div className="text-[10px] opacity-75 font-normal">Login Option</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Login Card Grid */}
        <div className="max-w-4xl mx-auto w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left: Role Info & Highlights (5 cols) */}
          <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700/60">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
                <IconComponent className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{currentConfig.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                {currentConfig.description}
              </p>

              <div className="space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Key Role Privileges:
                </div>
                {currentConfig.features.map((feat, i) => (
                  <div key={i} className="flex items-center space-x-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="text-[11px] text-slate-400">Sample Account Profile:</div>
              <div className="text-xs font-semibold text-white mt-0.5">
                {INITIAL_PROFILES[selectedRole].fullName}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {INITIAL_PROFILES[selectedRole].rollNumber ||
                  INITIAL_PROFILES[selectedRole].employeeCode ||
                  'Central Admin'}
              </div>
            </div>
          </div>

          {/* Right: Login Form & 1-Click Evaluation (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 bg-slate-900 flex flex-col justify-center">
            
            {/* Quick 1-Click Evaluation Button */}
            <div className="mb-6 p-4 rounded-xl bg-blue-950/40 border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Instant Evaluator Access
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                  No Typing Required
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Experience the <strong>{currentConfig.label} Dashboard</strong> instantly with complete pre-seeded records:
              </p>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(selectedRole)}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition transform active:scale-98"
              >
                <span>Launch {currentConfig.label} Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <span className="relative px-3 bg-slate-900 text-slate-500 text-xs font-medium uppercase">
                Or Sign In with Supabase Account
              </span>
            </div>

            {/* Custom Credentials Form */}
            <form onSubmit={handleCustomLogin} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentConfig.defaultEmail}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <span className="text-[11px] text-slate-500">Demo pwd: campus123</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Verifying...' : `Sign in as ${currentConfig.label}`}</span>
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-[11px] text-slate-500">
                Trouble logging in? Contact the College Systems Administrator at{' '}
                <span className="text-slate-400 font-mono">erp-support@campusconnect.edu</span>
              </p>
            </div>

          </div>

        </div>

        {/* Feature Tickers */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-400 text-xs">
            <span className="block font-bold text-white text-base">75% Min.</span>
            Automated Attendance Rules
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-400 text-xs">
            <span className="block font-bold text-white text-base">PostgreSQL</span>
            Supabase Relational Backend
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-400 text-xs">
            <span className="block font-bold text-white text-base">Gemini 3.8</span>
            Server AI Study Assistant
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-400 text-xs">
            <span className="block font-bold text-white text-base">Vercel Ready</span>
            Production React SPA Build
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        CampusConnect ERP – Smart College Management System • B.Tech IT Mini Project • Built with React, Vite & Supabase
      </footer>

    </div>
  );
};
