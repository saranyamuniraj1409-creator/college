import React, { useState } from 'react';
import {
  Users,
  CalendarCheck,
  Award,
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Search,
  Plus,
  Sparkles,
  Phone,
  Mail,
  Filter,
  Check,
  Send,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCollegeData } from '../../context/CollegeDataContext';
import { Student } from '../../types';
import { getAcademicPerformanceInsights } from '../../services/ai';

type AdvisorTab =
  | 'overview'
  | 'attendance'
  | 'marks'
  | 'students'
  | 'leaves'
  | 'assignments'
  | 'timetable';

export const AdvisorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    students,
    subjects,
    marks,
    timetable,
    assignments,
    submissions,
    leaveRequests,
    markAttendance,
    addMarkRecord,
    reviewLeaveRequest,
    createAssignment,
    gradeSubmission,
    lowAttendanceStudents,
  } = useCollegeData();

  const [activeTab, setActiveTab] = useState<AdvisorTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Daily Attendance Marker State
  const [attDate, setAttDate] = useState('2026-10-15');
  const [attSubject, setAttSubject] = useState(subjects[0]?.code || 'IT3501');
  const [attPeriod, setAttPeriod] = useState('09:00 - 10:00');
  const [attendanceSheet, setAttendanceSheet] = useState<
    Record<string, 'present' | 'absent' | 'on_duty' | 'late'>
  >(() => {
    const init: Record<string, 'present' | 'absent' | 'on_duty' | 'late'> = {};
    students.forEach((s) => {
      // By default mark low attendance ones absent for realism, others present
      init[s.id] = s.attendancePercentage < 75 ? 'absent' : 'present';
    });
    return init;
  });
  const [attSavedFeedback, setAttSavedFeedback] = useState(false);

  // Marks Entry State
  const [marksExamType, setMarksExamType] = useState<'IA-1' | 'IA-2' | 'Model Exam'>('IA-2');
  const [marksSubject, setMarksSubject] = useState(subjects[0]?.code || 'IT3501');
  const [studentMarksInputs, setStudentMarksInputs] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    students.forEach((s) => {
      init[s.id] = Math.floor(75 + Math.random() * 20);
    });
    return init;
  });
  const [marksSavedFeedback, setMarksSavedFeedback] = useState(false);

  // Leave Approval Remarks
  const [advisorRemarksInput, setAdvisorRemarksInput] = useState<Record<string, string>>({});

  // New Assignment Modal
  const [showNewAsgModal, setShowNewAsgModal] = useState(false);
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgDesc, setNewAsgDesc] = useState('');
  const [newAsgSubject, setNewAsgSubject] = useState(subjects[0]?.code || 'IT3501');
  const [newAsgDue, setNewAsgDue] = useState('2026-10-30');

  // AI Insights State
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Class stats
  const classAvgAttendance = +(
    students.reduce((acc, s) => acc + s.attendancePercentage, 0) / (students.length || 1)
  ).toFixed(1);
  const classAvgCgpa = +(
    students.reduce((acc, s) => acc + s.cgpa, 0) / (students.length || 1)
  ).toFixed(2);

  // Filtered Students
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleToggleAttendance = (studentId: string, status: 'present' | 'absent' | 'on_duty' | 'late') => {
    setAttendanceSheet((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, 'present' | 'absent' | 'on_duty' | 'late'> = {};
    students.forEach((s) => {
      updated[s.id] = 'present';
    });
    setAttendanceSheet(updated);
  };

  const handleSaveAttendance = async () => {
    const currentSub = subjects.find((s) => s.code === attSubject);
    const records = students.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      rollNumber: s.rollNumber,
      date: attDate,
      subjectCode: attSubject,
      subjectName: currentSub?.name || 'Subject',
      period: attPeriod,
      status: attendanceSheet[s.id] || 'present',
    }));

    await markAttendance(records);
    setAttSavedFeedback(true);
    setTimeout(() => setAttSavedFeedback(false), 3000);
  };

  const handleSaveMarks = async () => {
    const currentSub = subjects.find((s) => s.code === marksSubject);
    for (const s of students) {
      const score = studentMarksInputs[s.id] ?? 80;
      const grade = score >= 90 ? 'O' : score >= 80 ? 'A+' : score >= 70 ? 'A' : score >= 60 ? 'B+' : 'B';
      await addMarkRecord({
        studentId: s.id,
        studentName: s.name,
        rollNumber: s.rollNumber,
        subjectCode: marksSubject,
        subjectName: currentSub?.name || 'Subject',
        examType: marksExamType,
        marksObtained: score,
        maxMarks: 100,
        grade,
        semester: s.semester,
        dateRecorded: new Date().toISOString().split('T')[0],
      });
    }
    setMarksSavedFeedback(true);
    setTimeout(() => setMarksSavedFeedback(false), 3000);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle.trim()) return;

    const sub = subjects.find((s) => s.code === newAsgSubject);
    await createAssignment({
      title: newAsgTitle,
      description: newAsgDesc,
      subjectCode: newAsgSubject,
      subjectName: sub?.name || 'Subject',
      semester: 5,
      section: 'A',
      dueDate: `${newAsgDue}T23:59:00`,
      maxPoints: 100,
      createdByName: currentUser?.fullName || 'Dr. Priya Natarajan',
    });

    setNewAsgTitle('');
    setNewAsgDesc('');
    setShowNewAsgModal(false);
  };

  const handleGenerateAdvisorAi = async () => {
    setIsGeneratingAi(true);
    const report = await getAcademicPerformanceInsights({
      role: 'Class Advisor',
      department: 'Information Technology',
      attendanceRate: `${classAvgAttendance}%`,
      passRate: '92.4%',
      targetFocus: '3rd Year IT-A Mid-term Diagnostic & Low Attendance Intervention',
      studentsData: lowAttendanceStudents.map((s) => ({
        name: s.name,
        roll: s.rollNumber,
        attendance: s.attendancePercentage,
        cgpa: s.cgpa,
      })),
    });
    setAiReport(report);
    setIsGeneratingAi(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Advisor Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 text-2xl font-bold">
              {currentUser?.fullName?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold">{currentUser?.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Class Advisor
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Class: <strong className="text-white">B.Tech IT - 3rd Year Section A</strong> • Dept of Information Technology
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                Total Enrolled Students: <span className="text-white font-mono font-bold">64</span> • Active in Portal: <span className="text-white font-mono font-bold">{students.length}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-xl border bg-slate-800/80 border-slate-700 text-center min-w-[110px]">
              <span className="text-xs text-slate-400 block font-medium">Class Attendance</span>
              <span className="text-2xl font-extrabold text-blue-400">{classAvgAttendance}%</span>
              <span className="text-[10px] block text-slate-400">Class Average</span>
            </div>

            <div className="p-4 rounded-xl border bg-red-950/60 border-red-500/40 text-center min-w-[110px]">
              <span className="text-xs text-red-300 block font-medium">Low Attendance</span>
              <span className="text-2xl font-extrabold text-red-400">{lowAttendanceStudents.length}</span>
              <span className="text-[10px] block text-red-300">Below 75%</span>
            </div>

            <div className="p-4 rounded-xl border bg-slate-800/80 border-slate-700 text-center min-w-[110px]">
              <span className="text-xs text-slate-400 block font-medium">Class CGPA</span>
              <span className="text-2xl font-extrabold text-emerald-400">{classAvgCgpa}</span>
              <span className="text-[10px] block text-slate-400">Target &gt; 8.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-3 mb-6 border-b border-slate-200 text-xs font-semibold scrollbar-none">
        {[
          { id: 'overview', label: 'Overview & Alerts', icon: AlertTriangle },
          { id: 'attendance', label: 'Daily Attendance Entry', icon: CalendarCheck },
          { id: 'marks', label: 'Internal Marks Entry', icon: Award },
          { id: 'students', label: `Student Roster (${students.length})`, icon: Users },
          { id: 'leaves', label: `Leave Approvals (${leaveRequests.filter(l => l.status === 'pending').length})`, icon: CheckCircle2 },
          { id: 'assignments', label: 'Assignment Management', icon: FileText },
          { id: 'timetable', label: 'Class Timetable', icon: Clock },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdvisorTab)}
              className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
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

      {/* 1. OVERVIEW & LOW ATTENDANCE ALERTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Low Attendance Critical Notification Panel */}
          <div className="bg-red-50/80 rounded-2xl p-6 border border-red-300 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-red-600 text-white">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-red-900">
                    Low Attendance Alerts (<span className="font-mono">{lowAttendanceStudents.length}</span> Students &lt; 75%)
                  </h3>
                  <p className="text-xs text-red-700">
                    Action required: Send official parent notices and schedule advisory counseling before semester exam hall ticket generation.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateAdvisorAi}
                disabled={isGeneratingAi}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-2 shadow-md shadow-indigo-500/20 disabled:opacity-50"
              >
                {isGeneratingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGeneratingAi ? 'Analyzing Batch...' : 'AI Batch Diagnostic'}</span>
              </button>
            </div>

            {/* Flagged Students Table */}
            <div className="overflow-x-auto bg-white rounded-xl border border-red-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-red-200 bg-red-50/50 text-red-900 font-bold uppercase text-[11px]">
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3 text-center">Attendance %</th>
                    <th className="p-3 text-center">CGPA</th>
                    <th className="p-3">Parent Contact</th>
                    <th className="p-3 text-right">Advisory Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100">
                  {lowAttendanceStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-red-50/30 transition">
                      <td className="p-3 font-mono font-bold text-red-700">{s.rollNumber}</td>
                      <td className="p-3 font-bold text-slate-900">{s.name}</td>
                      <td className="p-3 text-center font-bold text-red-600 font-mono text-sm">
                        {s.attendancePercentage}%
                      </td>
                      <td className="p-3 text-center font-mono text-slate-700">{s.cgpa}</td>
                      <td className="p-3 text-slate-600">
                        <div>{s.parentName}</div>
                        <div className="font-mono text-[11px] text-blue-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {s.parentPhone}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => alert(`Official parent advisory SMS & Email queued for ${s.parentName} (${s.parentPhone}) regarding ${s.name}'s attendance of ${s.attendancePercentage}%.`)}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition"
                        >
                          Alert Parent
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Diagnostic Report Drawer */}
          {aiReport && (
            <div className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-md">
              <div className="flex items-center space-x-2 text-indigo-700 mb-3">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm uppercase tracking-wider">AI Advisory Intervention Report</h3>
              </div>
              <div className="whitespace-pre-line text-xs leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans">
                {aiReport}
              </div>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Class Distribution</h4>
              <div className="text-2xl font-extrabold text-slate-900">3rd Year IT - A</div>
              <p className="text-xs text-slate-500 mt-1">64 Total Students • 100% Registered for Sem 5</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs">
                <span>Distinction Candidates (&gt;8.5):</span>
                <strong className="text-emerald-600">32%</strong>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Pending Leave Requests</h4>
              <div className="text-2xl font-extrabold text-blue-600">
                {leaveRequests.filter((l) => l.status === 'pending').length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Students awaiting advisor review</p>
              <button
                onClick={() => setActiveTab('leaves')}
                className="mt-4 text-xs text-blue-600 hover:underline font-bold block"
              >
                Review Requests &rarr;
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Internal Assessment 2</h4>
              <div className="text-2xl font-extrabold text-indigo-600">Active Entry</div>
              <p className="text-xs text-slate-500 mt-1">Marks entry portal currently open</p>
              <button
                onClick={() => setActiveTab('marks')}
                className="mt-4 text-xs text-blue-600 hover:underline font-bold block"
              >
                Enter Marks &rarr;
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 2. DAILY ATTENDANCE ENTRY TAB */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            
            {/* Controls Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Daily Period Attendance Recording</h2>
                <p className="text-xs text-slate-500">Record attendance period-by-period for B.Tech IT 3rd Year A</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                />

                <select
                  value={attSubject}
                  onChange={(e) => setAttSubject(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-semibold"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={attPeriod}
                  onChange={(e) => setAttPeriod(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                >
                  <option value="09:00 - 10:00">Period 1 (09:00 - 10:00)</option>
                  <option value="10:00 - 11:00">Period 2 (10:00 - 11:00)</option>
                  <option value="11:15 - 12:15">Period 3 (11:15 - 12:15)</option>
                  <option value="13:15 - 15:15">Period 4-5 (13:15 - 15:15 Lab)</option>
                </select>

                <button
                  onClick={handleMarkAllPresent}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Mark All Present
                </button>

                <button
                  onClick={handleSaveAttendance}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Save Attendance
                </button>
              </div>
            </div>

            {attSavedFeedback && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                ✅ Attendance records saved and student aggregate percentages updated!
              </div>
            )}

            {/* Attendance Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="pb-3">Roll No</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3 text-center">Current %</th>
                    <th className="pb-3 text-center">Status for this Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => {
                    const status = attendanceSheet[s.id] || 'present';
                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 font-mono font-bold text-blue-600">{s.rollNumber}</td>
                        <td className="py-3 font-bold text-slate-900">{s.name}</td>
                        <td className="py-3 text-center font-mono">
                          <span className={`font-bold ${s.attendancePercentage < 75 ? 'text-red-600' : 'text-slate-800'}`}>
                            {s.attendancePercentage}%
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-center space-x-1.5">
                            {(['present', 'absent', 'on_duty', 'late'] as const).map((st) => (
                              <button
                                key={st}
                                onClick={() => handleToggleAttendance(s.id, st)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition ${
                                  status === st
                                    ? st === 'present'
                                      ? 'bg-emerald-600 text-white'
                                      : st === 'absent'
                                      ? 'bg-red-600 text-white'
                                      : st === 'on_duty'
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-amber-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {st.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* 3. INTERNAL MARKS ENTRY TAB */}
      {activeTab === 'marks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Internal Assessment Marks Entry</h2>
                <p className="text-xs text-slate-500">Record IA-1, IA-2 or Model Exam scores out of 100</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={marksExamType}
                  onChange={(e: any) => setMarksExamType(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-semibold"
                >
                  <option value="IA-1">Internal Assessment 1 (IA-1)</option>
                  <option value="IA-2">Internal Assessment 2 (IA-2)</option>
                  <option value="Model Exam">Model Examination</option>
                </select>

                <select
                  value={marksSubject}
                  onChange={(e) => setMarksSubject(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-semibold"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleSaveMarks}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Submit Marks to Central DB
                </button>
              </div>
            </div>

            {marksSavedFeedback && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                ✅ Marks recorded successfully! Grade points updated for semester report card.
              </div>
            )}

            {/* Marks Input Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="pb-3">Roll No</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3 text-center">Marks (Max: 100)</th>
                    <th className="pb-3 text-center">Calculated Grade</th>
                    <th className="pb-3 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => {
                    const score = studentMarksInputs[s.id] ?? 80;
                    const grade = score >= 90 ? 'O' : score >= 80 ? 'A+' : score >= 70 ? 'A' : score >= 60 ? 'B+' : score >= 50 ? 'B' : 'U';
                    const isPass = score >= 50;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 font-mono font-bold text-blue-600">{s.rollNumber}</td>
                        <td className="py-3 font-bold text-slate-900">{s.name}</td>
                        <td className="py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={score}
                            onChange={(e) =>
                              setStudentMarksInputs({
                                ...studentMarksInputs,
                                [s.id]: Number(e.target.value),
                              })
                            }
                            className="w-20 px-2.5 py-1 text-center font-mono font-bold rounded-lg border border-slate-300 text-slate-900 text-xs"
                          />
                        </td>
                        <td className="py-3 text-center font-bold">
                          <span className={`px-2.5 py-0.5 rounded ${isPass ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                            {grade}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold">
                          <span className={isPass ? 'text-emerald-600' : 'text-red-600'}>
                            {isPass ? 'PASS' : 'RE-APPEAR'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* 4. STUDENT ROSTER MANAGEMENT */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Class Student Directory</h2>
                <p className="text-xs text-slate-500">Contact information, parent details, and performance tracking</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student or roll no..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="pb-3">Roll No</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Register No</th>
                    <th className="pb-3 text-center">Attendance</th>
                    <th className="pb-3 text-center">CGPA</th>
                    <th className="pb-3">Parent Info</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-mono font-bold text-blue-600">{s.rollNumber}</td>
                      <td className="py-3 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 font-mono text-slate-500">{s.registerNumber}</td>
                      <td className="py-3 text-center font-mono">
                        <span className={`font-bold ${s.attendancePercentage < 75 ? 'text-red-600' : 'text-slate-800'}`}>
                          {s.attendancePercentage}%
                        </span>
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-slate-800">{s.cgpa}</td>
                      <td className="py-3 text-slate-600">
                        <div>{s.parentName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{s.parentPhone}</div>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.attendancePercentage < 75
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {s.attendancePercentage < 75 ? 'At Risk (<75%)' : 'Active'}
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

      {/* 5. LEAVE APPROVALS TAB */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Student Leave Applications & Approvals</h2>
            <p className="text-xs text-slate-500 mb-6">Review requests from students of B.Tech IT 3rd Year A</p>

            <div className="space-y-4">
              {leaveRequests.map((lev) => (
                <div key={lev.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-blue-600">{lev.rollNumber}</span>
                        <h4 className="text-sm font-bold text-slate-900">{lev.studentName}</h4>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
                          {lev.leaveType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 font-medium">"{lev.reason}"</p>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Dates: {lev.startDate} to {lev.endDate} ({lev.daysCount} days) • Applied: {lev.appliedDate}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        lev.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : lev.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : lev.status === 'escalated_to_hod'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {lev.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {lev.status === 'pending' && (
                    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <input
                        type="text"
                        placeholder="Add advisor remarks / recommendation..."
                        value={advisorRemarksInput[lev.id] || ''}
                        onChange={(e) =>
                          setAdvisorRemarksInput({
                            ...advisorRemarksInput,
                            [lev.id]: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            reviewLeaveRequest(
                              lev.id,
                              'approved',
                              advisorRemarksInput[lev.id] || 'Approved by Class Advisor.',
                              'advisor'
                            )
                          }
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() =>
                            reviewLeaveRequest(
                              lev.id,
                              'escalated_to_hod',
                              advisorRemarksInput[lev.id] || 'Escalated to HOD for special attendance consideration.',
                              'advisor'
                            )
                          }
                          className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" /> Escalate to HOD
                        </button>
                        <button
                          onClick={() =>
                            reviewLeaveRequest(
                              lev.id,
                              'rejected',
                              advisorRemarksInput[lev.id] || 'Rejected due to attendance shortage.',
                              'advisor'
                            )
                          }
                          className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. ASSIGNMENT MANAGEMENT TAB */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Assignment Management & Grading</h2>
                <p className="text-xs text-slate-500">Publish course tasks and evaluate student work</p>
              </div>

              <button
                onClick={() => setShowNewAsgModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assignment</span>
              </button>
            </div>

            <div className="space-y-4">
              {assignments.map((asg) => (
                <div key={asg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-600">{asg.subjectCode}</span>
                      <h4 className="text-sm font-bold text-slate-900">{asg.title}</h4>
                      <p className="text-xs text-slate-600 mt-1">{asg.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-800 block">Due: {asg.dueDate.split('T')[0]}</span>
                      <span className="text-[11px] text-slate-500">Submissions: {asg.submittedCount} / {asg.totalStudents}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. CLASS TIMETABLE TAB */}
      {activeTab === 'timetable' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Class Timetable Master Schedule</h2>
            <p className="text-xs text-slate-500 mb-6">Weekly timetable for B.Tech IT 3rd Year A (Room LH-301)</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                    <th className="p-3">Day</th>
                    <th className="p-3">Period 1 (09:00 - 10:00)</th>
                    <th className="p-3">Period 2 (10:00 - 11:00)</th>
                    <th className="p-3">Period 3 (11:15 - 12:15)</th>
                    <th className="p-3">Afternoon Session (13:15 - 15:15)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                    const slots = timetable.filter((t) => t.day === day);
                    return (
                      <tr key={day} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-900 bg-slate-50/70 border-r border-slate-200">
                          {day}
                        </td>
                        {slots.slice(0, 4).map((s) => (
                          <td key={s.id} className="p-3">
                            <div className="font-bold text-blue-700 font-mono">{s.subjectCode}</div>
                            <div className="text-slate-800 text-[11px]">{s.subjectName}</div>
                            <div className="text-slate-400 text-[10px]">{s.facultyName}</div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showNewAsgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Create New Course Assignment</h3>
            
            <form onSubmit={handleCreateAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={newAsgSubject}
                  onChange={(e) => setNewAsgSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={newAsgTitle}
                  onChange={(e) => setNewAsgTitle(e.target.value)}
                  placeholder="e.g. Assignment 4: Red-Black Trees & B+ Tree Indices"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instructions & Problem Statement</label>
                <textarea
                  rows={3}
                  value={newAsgDesc}
                  onChange={(e) => setNewAsgDesc(e.target.value)}
                  placeholder="Provide submission guidelines and questions..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newAsgDue}
                  onChange={(e) => setNewAsgDue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAsgModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
