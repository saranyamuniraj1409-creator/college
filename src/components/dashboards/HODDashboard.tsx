import React, { useState } from 'react';
import {
  Building2,
  Users,
  Award,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  Bell,
  Plus,
  Mail,
  Phone,
  BarChart3,
  Calendar,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCollegeData } from '../../context/CollegeDataContext';
import { getAcademicPerformanceInsights } from '../../services/ai';

type HODTab =
  | 'overview'
  | 'faculty'
  | 'performance'
  | 'attendance'
  | 'leaves'
  | 'announcements'
  | 'ai-analytics';

export const HODDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    students,
    faculty,
    departments,
    leaveRequests,
    announcements,
    reviewLeaveRequest,
    publishAnnouncement,
  } = useCollegeData();

  const [activeTab, setActiveTab] = useState<HODTab>('overview');

  // New Department Announcement
  const [showAncModal, setShowAncModal] = useState(false);
  const [ancTitle, setAncTitle] = useState('');
  const [ancContent, setAncContent] = useState('');
  const [ancPriority, setAncPriority] = useState<'normal' | 'high' | 'urgent'>('normal');

  // AI Analytics State
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Department Stats
  const itDept = departments.find((d) => d.code === 'IT') || departments[0];

  // Escalated Leaves to HOD
  const escalatedLeaves = leaveRequests.filter(
    (l) => l.status === 'escalated_to_hod' || l.daysCount >= 3
  );

  // Performance cohorts
  const distinctionCount = students.filter((s) => s.cgpa >= 8.5).length;
  const firstClassCount = students.filter((s) => s.cgpa >= 7.0 && s.cgpa < 8.5).length;
  const atRiskCount = students.filter((s) => s.cgpa < 7.0 || s.attendancePercentage < 75).length;

  const handlePublishDeptAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ancTitle.trim() || !ancContent.trim()) return;

    await publishAnnouncement({
      title: ancTitle,
      content: ancContent,
      category: 'Academic',
      priority: ancPriority,
      department: 'Information Technology',
      targetRole: 'all',
      authorName: currentUser?.fullName || 'Dr. Rajesh Sundaram',
      authorRole: 'HOD - Information Technology',
    });

    setAncTitle('');
    setAncContent('');
    setShowAncModal(false);
  };

  const handleGenerateHodAnalytics = async () => {
    setIsGeneratingAi(true);
    const report = await getAcademicPerformanceInsights({
      role: 'Head of Department (HOD)',
      department: 'Information Technology',
      attendanceRate: `${itDept.averageAttendance}%`,
      passRate: `${itDept.passPercentage}%`,
      targetFocus: 'Department-wide NAAC/NBA Accreditation Metrics & Remedial Class Allocation',
      studentsData: students.map((s) => ({
        name: s.name,
        roll: s.rollNumber,
        cgpa: s.cgpa,
        attendance: s.attendancePercentage,
      })),
    });
    setAiReport(report);
    setIsGeneratingAi(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* HOD Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300 text-2xl font-bold">
              {currentUser?.fullName?.charAt(0) || 'R'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold">{currentUser?.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Head of Department
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Department: <strong className="text-white">Information Technology (B.Tech IT)</strong> • Established 2005
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                Faculty Strength: <span className="text-white font-mono font-bold">{itDept.facultyCount} Professors</span> • Total Department Students: <span className="text-white font-mono font-bold">{itDept.studentCount}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-xl border bg-slate-800/80 border-slate-700 text-center min-w-[110px]">
              <span className="text-xs text-slate-400 block font-medium">Dept Attendance</span>
              <span className="text-2xl font-extrabold text-blue-400">{itDept.averageAttendance}%</span>
              <span className="text-[10px] block text-slate-400">All 4 Years</span>
            </div>

            <div className="p-4 rounded-xl border bg-slate-800/80 border-slate-700 text-center min-w-[110px]">
              <span className="text-xs text-slate-400 block font-medium">Pass Percentage</span>
              <span className="text-2xl font-extrabold text-emerald-400">{itDept.passPercentage}%</span>
              <span className="text-[10px] block text-slate-400">NBA Target &gt;90%</span>
            </div>

            <div className="p-4 rounded-xl border bg-slate-800/80 border-slate-700 text-center min-w-[110px]">
              <span className="text-xs text-slate-400 block font-medium">Average CGPA</span>
              <span className="text-2xl font-extrabold text-purple-400">{itDept.averageCgpa}</span>
              <span className="text-[10px] block text-slate-400">Scale of 10.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-3 mb-6 border-b border-slate-200 text-xs font-semibold scrollbar-none">
        {[
          { id: 'overview', label: 'Department Overview', icon: Building2 },
          { id: 'faculty', label: `Faculty Directory (${faculty.length})`, icon: Users },
          { id: 'performance', label: 'Student Performance & Ranks', icon: Award },
          { id: 'attendance', label: 'Department Attendance Analytics', icon: Clock },
          { id: 'leaves', label: `Leave Approvals (${escalatedLeaves.length})`, icon: CheckCircle2 },
          { id: 'announcements', label: 'Department Circulars', icon: Bell },
          { id: 'ai-analytics', label: 'AI Academic Diagnostics', icon: Sparkles, highlight: true },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as HODTab)}
              className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : tab.highlight
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Student-Faculty Ratio
              </span>
              <div className="text-3xl font-extrabold text-blue-600">15.8 : 1</div>
              <p className="text-xs text-emerald-600 font-medium mt-1">✓ AICTE & NBA Compliant (&lt;20:1)</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Distinction Rate
              </span>
              <div className="text-3xl font-extrabold text-emerald-600">
                {Math.round((distinctionCount / (students.length || 1)) * 100)}%
              </div>
              <p className="text-xs text-slate-500 mt-1">Students scoring &gt;= 8.5 CGPA</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                At-Risk Students
              </span>
              <div className="text-3xl font-extrabold text-amber-600">{atRiskCount}</div>
              <p className="text-xs text-slate-500 mt-1">Assigned for remedial coaching</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Escalated Leaves
              </span>
              <div className="text-3xl font-extrabold text-purple-600">{escalatedLeaves.length}</div>
              <p className="text-xs text-slate-500 mt-1">Awaiting HOD endorsement</p>
            </div>
          </div>

          {/* Quick AI Trigger & Action Buttons */}
          <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-purple-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Gemini AI Academic Diagnostic Engine
              </div>
              <h3 className="text-lg font-bold">Generate Comprehensive Department Evaluation</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Synthesizes attendance drop trends, internal test score distributions, and generates targeted intervention recommendations for faculty council meetings.
              </p>
            </div>

            <button
              onClick={() => {
                setActiveTab('ai-analytics');
                handleGenerateHodAnalytics();
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center space-x-2 shadow-lg shadow-purple-600/30 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Diagnostic</span>
            </button>
          </div>

          {/* Year-wise Attendance Distribution Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-4">
              Year-Wise Attendance Breakdown (B.Tech IT)
            </h3>
            <div className="space-y-4">
              {[
                { year: '1st Year (Batch 2026-2030)', pct: 88.2, count: 95 },
                { year: '2nd Year (Batch 2025-2029)', pct: 86.4, count: 95 },
                { year: '3rd Year (Batch 2024-2028 - Current)', pct: 84.6, count: 95 },
                { year: '4th Year (Batch 2023-2027 Final)', pct: 82.5, count: 95 },
              ].map((row, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{row.year}</span>
                    <span className="font-mono text-blue-600 font-bold">{row.pct}% (Avg)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${
                        row.pct >= 85 ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${row.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. FACULTY DIRECTORY */}
      {activeTab === 'faculty' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Department Faculty Members & Advisors</h2>
                <p className="text-xs text-slate-500">Teaching allocation, research specializations, and class advisor designations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faculty.map((f) => (
                <div key={f.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-blue-600">{f.employeeCode}</span>
                      <h4 className="text-sm font-bold text-slate-900">{f.name}</h4>
                      <p className="text-xs text-slate-600 font-medium">{f.designation}</p>
                    </div>
                    {f.isAdvisor && (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                        Class Advisor
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 pt-2 border-t border-slate-200/80 space-y-1">
                    <div>Specialization: <strong className="text-slate-800">{f.specialization}</strong></div>
                    {f.advisedClass && (
                      <div>Advised Class: <strong className="text-blue-700">{f.advisedClass}</strong></div>
                    )}
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2 font-mono">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {f.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {f.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. STUDENT PERFORMANCE & RANKS */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Academic Rank Holders & Cohort Distribution</h2>
            <p className="text-xs text-slate-500 mb-6">Top performing candidates across B.Tech IT 3rd Year</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="pb-3">Rank</th>
                    <th className="pb-3">Roll No</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3 text-center">CGPA</th>
                    <th className="pb-3 text-center">Attendance</th>
                    <th className="pb-3 text-right">Academic Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...students]
                    .sort((a, b) => b.cgpa - a.cgpa)
                    .map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 font-bold font-mono text-slate-900">
                          {idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : `#${idx + 1}`}
                        </td>
                        <td className="py-3 font-mono font-bold text-blue-600">{s.rollNumber}</td>
                        <td className="py-3 font-bold text-slate-900">{s.name}</td>
                        <td className="py-3 text-center font-mono font-extrabold text-blue-700 text-sm">
                          {s.cgpa}
                        </td>
                        <td className="py-3 text-center font-mono">{s.attendancePercentage}%</td>
                        <td className="py-3 text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.cgpa >= 8.5
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.cgpa >= 7.5
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {s.cgpa >= 8.5 ? 'First Class Distinction' : s.cgpa >= 7.5 ? 'First Class' : 'Second Class'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. DEPARTMENT ATTENDANCE ANALYTICS */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Department Attendance Statistics</h2>
            <p className="text-xs text-slate-500 mb-6">Regulatory compliance monitoring for Semester Examinations</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-500">Eligible (&gt;=75%)</span>
                <span className="text-3xl font-extrabold text-emerald-600 block mt-1">87.5%</span>
                <span className="text-[11px] text-slate-400">Direct Hall Ticket Issuance</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-xs text-amber-800">Condonation (65% - 74%)</span>
                <span className="text-3xl font-extrabold text-amber-600 block mt-1">10.2%</span>
                <span className="text-[11px] text-amber-700">Requires Medical/HOD Endorsement</span>
              </div>
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
                <span className="text-xs text-red-800">Detained (&lt;65%)</span>
                <span className="text-3xl font-extrabold text-red-600 block mt-1">2.3%</span>
                <span className="text-[11px] text-red-700">Non-negotiable Repeat Semester</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. LEAVE APPROVALS TAB */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1">HOD Level Leave Endorsements</h2>
            <p className="text-xs text-slate-500 mb-6">Extended leaves and advisor escalations requiring HOD sign-off</p>

            <div className="space-y-4">
              {escalatedLeaves.map((lev) => (
                <div key={lev.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-blue-600">{lev.rollNumber}</span>
                        <h4 className="text-sm font-bold text-slate-900">{lev.studentName}</h4>
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-semibold">
                          {lev.leaveType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2">"{lev.reason}"</p>
                      {lev.advisorRemarks && (
                        <div className="mt-2 text-xs text-blue-900 bg-blue-50 p-2 rounded-lg border border-blue-200">
                          <strong>Class Advisor Note:</strong> {lev.advisorRemarks}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() =>
                          reviewLeaveRequest(
                            lev.id,
                            'approved',
                            'Approved by HOD with academic condonation undertaking.',
                            'hod'
                          )
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Endorse & Approve
                      </button>
                      <button
                        onClick={() =>
                          reviewLeaveRequest(
                            lev.id,
                            'rejected',
                            'Rejected by HOD due to critical semester exam laboratory attendance requirement.',
                            'hod'
                          )
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Department Circulars & Bulletins</h2>
                <p className="text-xs text-slate-500">Broadcast official departmental notifications</p>
              </div>

              <button
                onClick={() => setShowAncModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Circular</span>
              </button>
            </div>

            <div className="space-y-4">
              {announcements
                .filter((a) => !a.department || a.department === 'Information Technology')
                .map((anc) => (
                  <div key={anc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">
                        {anc.category}
                      </span>
                      <span className="text-xs text-slate-400">{anc.publishedDate}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{anc.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{anc.content}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. AI ACADEMIC ANALYTICS TAB */}
      {activeTab === 'ai-analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-purple-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-purple-100 mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
                  <Sparkles className="w-5 h-5 text-purple-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Gemini AI Department Diagnostic Report
                  </h3>
                  <p className="text-xs text-purple-700 font-medium">
                    Powered by server-side Gemini 3.8 Flash SDK
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateHodAnalytics}
                disabled={isGeneratingAi}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isGeneratingAi && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{isGeneratingAi ? 'Synthesizing...' : 'Re-run Analytics'}</span>
              </button>
            </div>

            {aiReport ? (
              <div className="whitespace-pre-line text-xs leading-relaxed text-slate-700 bg-slate-50 p-6 rounded-2xl border border-slate-200 font-sans">
                {aiReport}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Sparkles className="w-10 h-10 mx-auto text-purple-300 mb-2" />
                <p className="text-xs">Click "Launch AI Diagnostic" to generate automated department analytics.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Announcement Modal */}
      {showAncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Publish Department Circular</h3>
            <form onSubmit={handlePublishDeptAnnouncement} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={ancTitle}
                  onChange={(e) => setAncTitle(e.target.value)}
                  placeholder="e.g. Schedule for Pre-University Model Practical Exams"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Circular Content</label>
                <textarea
                  rows={4}
                  required
                  value={ancContent}
                  onChange={(e) => setAncContent(e.target.value)}
                  placeholder="Details of the announcement..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={ancPriority}
                  onChange={(e: any) => setAncPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAncModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
