import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CollegeDataProvider } from './context/CollegeDataContext';
import { Navbar } from './components/common/Navbar';
import { DatabaseSetupModal } from './components/common/DatabaseSetupModal';
import { LoginPortal } from './components/auth/LoginPortal';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { AdvisorDashboard } from './components/dashboards/AdvisorDashboard';
import { HODDashboard } from './components/dashboards/HODDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <LoginPortal onOpenDbModal={() => setIsDbModalOpen(true)} />
        <DatabaseSetupModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <Navbar onOpenDbModal={() => setIsDbModalOpen(true)} />
        
        <main className="pb-12">
          {role === 'student' && <StudentDashboard />}
          {role === 'advisor' && <AdvisorDashboard />}
          {role === 'hod' && <HODDashboard />}
          {role === 'admin' && <AdminDashboard />}
        </main>
      </div>

      {/* College ERP Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-white">CampusConnect – Smart College Management System</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Designed for B.Tech Information Technology • NAAC A++ / NBA Accredited Institution
            </p>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="text-slate-400 hover:text-white underline"
            >
              PostgreSQL Database Configuration
            </button>
            <span>•</span>
            <span className="text-slate-400 font-mono">React 19 + TypeScript + Vite</span>
          </div>
        </div>
      </footer>

      <DatabaseSetupModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CollegeDataProvider>
        <MainAppContent />
      </CollegeDataProvider>
    </AuthProvider>
  );
}
