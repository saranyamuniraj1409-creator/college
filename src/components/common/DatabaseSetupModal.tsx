import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  Key,
  Server,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  isSupabaseConfigured,
  testSupabaseConnection,
  updateSupabaseCredentials,
  clearSupabaseCredentials,
} from '../../lib/supabase';

interface DatabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSetupModal: React.FC<DatabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    return localStorage.getItem('campus_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
  });
  const [supabaseKey, setSupabaseKey] = useState(() => {
    return localStorage.getItem('campus_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setIsTesting(false);
    setTestResult(result);

    if (result.success) {
      updateSupabaseCredentials(supabaseUrl, supabaseKey);
    }
  };

  const handleResetToDemo = () => {
    clearSupabaseCredentials();
    setSupabaseUrl('');
    setSupabaseKey('');
    setTestResult({
      success: true,
      message: 'Reset to local high-fidelity demo database successfully.',
    });
  };

  const handleCopySql = () => {
    const sqlText = `-- CampusConnect – PostgreSQL Supabase Schema
-- Run this in your Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    hod_name VARCHAR(100),
    established_year INT DEFAULT 2005,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    phone VARCHAR(20),
    department_id UUID REFERENCES public.departments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    register_number VARCHAR(30) UNIQUE NOT NULL,
    batch VARCHAR(20) NOT NULL,
    semester INT NOT NULL DEFAULT 5,
    section VARCHAR(5) DEFAULT 'A',
    department_id UUID REFERENCES public.departments(id),
    cgpa NUMERIC(4, 2) DEFAULT 8.42,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    period_slot VARCHAR(20) NOT NULL,
    status VARCHAR(15) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject_code VARCHAR(15) NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    exam_type VARCHAR(30) NOT NULL,
    marks_obtained NUMERIC(5, 2) NOT NULL,
    max_marks NUMERIC(5, 2) NOT NULL DEFAULT 100,
    grade VARCHAR(5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    leave_type VARCHAR(30) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    priority VARCHAR(15) DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600/30 text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Database & Backend Setup</h3>
              <p className="text-xs text-slate-300">Supabase PostgreSQL & Gemini AI Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6 text-sm">
          
          {/* Current Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start space-x-3 ${
              configured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {configured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold text-sm">
                {configured
                  ? 'Supabase Cloud Database Connected'
                  : 'Currently in Interactive Demo Mode (Local Storage)'}
              </div>
              <p className="text-xs mt-1 leading-relaxed text-slate-600">
                {configured
                  ? 'Your app is configured to communicate with your Supabase PostgreSQL database.'
                  : 'All four role dashboards (Student, Advisor, HOD, Admin) are fully operational with pre-loaded realistic college data. To persist data to a live PostgreSQL database, connect your Supabase project below.'}
              </p>
            </div>
          </div>

          {/* Quick Steps */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              How to Connect Your Supabase PostgreSQL Project:
            </h4>
            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
              <li>
                Create a free project at{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline font-medium inline-flex items-center gap-0.5"
                >
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                Go to <strong>SQL Editor</strong> in Supabase, click <strong>New Query</strong>, and paste the schema:
                <div className="mt-1.5 flex items-center space-x-2">
                  <button
                    onClick={handleCopySql}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema (supabase-schema.sql)'}</span>
                  </button>
                  <span className="text-[11px] text-slate-400">or check root file supabase-schema.sql</span>
                </div>
              </li>
              <li>
                Go to <strong>Project Settings &gt; API</strong>, copy your <strong>Project URL</strong> and{' '}
                <strong>anon public key</strong>, and paste below.
              </li>
            </ol>
          </div>

          {/* Connection Form */}
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supabase Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supabase Anon Public Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="text"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs font-medium border flex items-center space-x-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetToDemo}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 hover:bg-slate-100 transition"
              >
                Reset to Demo Storage
              </button>

              <button
                type="submit"
                disabled={isTesting}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition disabled:opacity-50"
              >
                {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isTesting ? 'Testing Connection...' : 'Test & Save Supabase'}</span>
              </button>
            </div>
          </form>

          {/* Vercel & Gemini Note */}
          <div className="border-t border-slate-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Gemini AI Server Feature
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                AI features (Study Assistant, timetable generator, performance insights) execute securely through the Node server with <code className="text-slate-800 font-mono">GEMINI_API_KEY</code>.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                <Server className="w-3.5 h-3.5 text-blue-600" />
                Vercel Deployment
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Configured with standard Vite build (<code className="text-slate-800 font-mono">npm run build</code>) and <code className="text-slate-800 font-mono">vercel.json</code> SPA rewrites.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
