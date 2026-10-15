import React, { useState } from 'react';
import {
  User,
  Calendar,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Award,
  Clock,
  FileText,
  Send,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Download,
  Calculator,
  Bell,
  MessageSquare,
  HelpCircle,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCollegeData } from '../../context/CollegeDataContext';
import { askAIAssistant, generateAIStudyTimetable } from '../../services/ai';

type StudentTab =
  | 'overview'
  | 'attendance'
  | 'marks'
  | 'cgpa'
  | 'timetable'
  | 'assignments'
  | 'leave'
  | 'exams'
  | 'announcements'
  | 'ai-mentor';

export const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    students,
    subjects,
    marks,
    timetable,
    assignments,
    submissions,
    leaveRequests,
    announcements,
    examSchedule,
    applyLeave,
    submitAssignment,
  } = useCollegeData();

  const [activeTab, setActiveTab] = useState<StudentTab>('overview');

  // Find student record matching current logged in user
  const student = students.find((s) => s.id === currentUser?.id) || students[0];

  // Attendance metrics
  const attendancePct = student?.attendancePercentage || 86.5;
  const isAttendanceLow = attendancePct < 75;

  // Assignments
  const [selectedAsgId, setSelectedAsgId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [asgSubmittedSuccess, setAsgSubmittedSuccess] = useState(false);

  // Leave Form
  const [leaveType, setLeaveType] = useState<'Sick Leave' | 'On Duty (OD)' | 'Personal Leave'>('On Duty (OD)');
  const [leaveStart, setLeaveStart] = useState('2026-10-24');
  const [leaveEnd, setLeaveEnd] = useState('2026-10-25');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState('');

  // CGPA Calculator State
  const [simulatedGrades, setSimulatedGrades] = useState<Record<string, number>>({
    IT3501: 9, // A+
    IT3502: 10, // O
    IT3503: 8, // A
    IT3504: 10, // O
    IT3505: 8, // A
    IT3508: 10, // O
  });

  // AI Study Assistant State
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string }>
  >([
    {
      role: 'assistant',
      text: `Hello ${student.name.split(' ')[0]}! I'm CampusAI, your academic mentor. Ask me any conceptual question from your B.Tech IT subjects, or request a personalized revision timetable for your upcoming semester exams.`,
    },
  ]);
  const [userQuery, setUserQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All Subjects');

  // Timetable Day Tab
  const [activeDay, setActiveDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');

  // Handlers
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    await applyLeave({
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      semester: student.semester,
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      daysCount: 2,
      reason: leaveReason,
    });

    setLeaveReason('');
    setLeaveSuccessMsg('Leave application submitted successfully for Advisor review.');
    setTimeout(() => setLeaveSuccessMsg(''), 4000);
  };

  const handleSubmitWork = async (assignmentId: string) => {
    if (!submissionText.trim()) return;
    await submitAssignment(assignmentId, submissionText);
    setSubmissionText('');
    setSelectedAsgId(null);
    setAsgSubmittedSuccess(true);
    setTimeout(() => setAsgSubmittedSuccess(false), 4000);
  };

  const handleSendAiPrompt = async (promptToSend?: string) => {
    const q = promptToSend || userQuery;
    if (!q.trim() || isAiLoading) return;

    setUserQuery('');
    setChatMessages((prev) => [...prev, { role: 'user', text: q }]);
    setIsAiLoading(true);

    const reply = await askAIAssistant(
      q,
      selectedSubjectFilter !== 'All Subjects' ? selectedSubjectFilter : undefined,
      {
        rollNo: student.rollNumber,
        department: student.department,
        semester: student.semester,
        attendance: attendancePct,
      },
      chatMessages.map((m) => ({ role: m.role, content: m.text }))
    );

    setIsAiLoading(false);
    setChatMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
  };

  const handleGenerateTimetableAi = async () => {
    setIsAiLoading(true);
    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: 'Generate a personalized revision timetable for my upcoming semester exams.' },
    ]);

    const schedule = await generateAIStudyTimetable({
      subjects: subjects.map((s) => s.name),
      weakSubjects: ['Computer Networks', 'Operating Systems & Architecture'],
      availableHoursPerDay: 4,
      targetCgpa: '8.8+',
      examDate: 'Starting Nov 16th, 2026',
    });

    setIsAiLoading(false);
    setChatMessages((prev) => [...prev, { role: 'assistant', text: schedule }]);
  };

  // CGPA Simulation calculation
  const totalSimulatedPoints = subjects.reduce((acc, sub) => {
    const gradePoint = simulatedGrades[sub.code] || 8;
    return acc + gradePoint * sub.credits;
  }, 0);
  const totalCredits = subjects.reduce((acc, s) => acc + s.credits, 0);
  const simulatedGpa = +(totalSimulatedPoints / (totalCredits || 1)).toFixed(2);
  const projectedCgpa = +((student.cgpa * 4 + simulatedGpa) / 5).toFixed(2);

  // Filtered timetable slots for active day
  const dayTimetable = timetable.filter((t) => t.day === activeDay);

  // Student specific leaves
  const myLeaves = leaveRequests.filter((l) => l.studentId === student.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 text-2xl font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold">{student.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Semester {student.semester}
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Roll No: <span className="font-mono font-semibold text-white">{student.rollNumber}</span> • Reg No: <span className="font-mono text-white">{student.registerNumber}</span> • {student.department}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                Class Advisor: <span className="text-slate-200 font-medium">{student.advisorName}</span> (IT Dept)
              </p>
            </div>
          </div>

          {/* Quick Stat Badges */}
          <div className="flex items-center gap-3">
            <div className={`p-4 rounded-xl border text-center min-w-[110px] ${
              isAttendanceLow ? 'bg-red-950/60 border-red-500/40 text-red-200' : 'bg-slate-800/80 border-slate-700 text-white'
            }`}>
              <span className="text-xs text-slate-400 block font-medium">Attendance</span>
              <span className={`text-2xl font-extrabold ${isAttendanceLow ? 'text-red-400' : 'text-emerald-400'}`}>
                {attendancePct}%
              </span>
              <span className="text-[10px] block text-slate-400">Req. &gt;= 75%</span>
            </div>

            <div className="p-4 rounded-xl border bg-slate-800/80 border-slate-700 text-center min-w-[110px]">
              <span className="text-xs text-slate-400 block font-medium">Current CGPA</span>
              <span className="text-2xl font-extrabold text-blue-400">{student.cgpa}</span>
              <span className="text-[10px] block text-slate-400">Scale of 10.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Low Attendance Critical Alert Warning */}
      {isAttendanceLow && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-300 flex items-start space-x-3 text-red-900 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-sm block text-red-800">Attendance Warning Notice: Below 75% Threshold</span>
            Your aggregate attendance is currently <span className="font-bold">{attendancePct}%</span>. University regulations mandate a minimum of 75% attendance to qualify for Semester Examinations. Please meet your Class Advisor <span className="font-semibold">{student.advisorName}</span> immediately or apply for formal On-Duty (OD) condonation.
          </div>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-3 mb-6 border-b border-slate-200 text-xs font-semibold scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: BookOpen },
          { id: 'attendance', label: 'Attendance Tracker', icon: Clock },
          { id: 'marks', label: 'Internal Marks & Results', icon: Award },
          { id: 'cgpa', label: 'CGPA Calculator', icon: Calculator },
          { id: 'timetable', label: 'Weekly Timetable', icon: Calendar },
          { id: 'assignments', label: `Assignments (${assignments.length})`, icon: FileText },
          { id: 'leave', label: 'Leave & OD Application', icon: Send },
          { id: 'exams', label: 'Exam Schedule', icon: CheckCircle },
          { id: 'announcements', label: 'Announcements', icon: Bell },
          { id: 'ai-mentor', label: 'AI Study Assistant', icon: Sparkles, highlight: true },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudentTab)}
              className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : tab.highlight
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
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

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Student Profile Overview Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Student Academic Profile
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Degree & Branch</span>
                  <span className="font-semibold text-slate-900">B.Tech IT</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Batch</span>
                  <span className="font-semibold text-slate-900">{student.batch}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Semester & Section</span>
                  <span className="font-semibold text-slate-900">Semester {student.semester} - Section {student.section}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Parent / Guardian</span>
                  <span className="font-semibold text-slate-900">{student.parentName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Advisor Contact</span>
                  <span className="font-semibold text-blue-600">{student.advisorName}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Academic Standing</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Good Standing</span>
                </div>
              </div>
            </div>

            {/* Attendance Summary Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Attendance Summary
                </h3>
                <div className="flex items-center space-x-4 my-3">
                  <div className="text-3xl font-extrabold text-blue-600">{attendancePct}%</div>
                  <div className="text-xs text-slate-500">
                    <div>Attended: <strong className="text-slate-800">182</strong> / 210 Hours</div>
                    <div className="text-emerald-600 font-medium">Safe margin: +24 hrs above cutoff</div>
                  </div>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      attendancePct >= 85 ? 'bg-emerald-500' : attendancePct >= 75 ? 'bg-blue-600' : 'bg-red-500'
                    }`}
                    style={{ width: `${attendancePct}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>0%</span>
                  <span className="text-red-500 font-bold">75% (Min)</span>
                  <span>100%</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('attendance')}
                className="mt-4 w-full py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition flex items-center justify-center gap-1"
              >
                <span>View Subject Breakdown</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick AI Assistant Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 border border-indigo-800/50 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    CampusAI Study Assistant
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px]">Gemini 3.8</span>
                </div>
                <h4 className="text-base font-bold mb-2">Need Help with Engineering Subjects?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  CampusAI can explain Data Structures algorithms, optimize database schemas, or plan your semester revision schedule.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('ai-mentor')}
                className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open AI Study Assistant</span>
              </button>
            </div>

          </div>

          {/* Today's Schedule & Recent Announcements Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Today's Classes */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Today's Class Schedule ({activeDay})
                </h3>
                <button
                  onClick={() => setActiveTab('timetable')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Full Week
                </button>
              </div>
              <div className="space-y-3">
                {dayTimetable.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/60 transition"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-bold">
                          {slot.subjectCode}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{slot.subjectName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                        <span>Faculty: {slot.facultyName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {slot.roomNumber}
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active College Announcements */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  Recent Announcements
                </h3>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {announcements.slice(0, 3).map((a) => (
                  <div key={a.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        a.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {a.category}
                      </span>
                      <span className="text-[11px] text-slate-400">{a.publishedDate}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900">{a.title}</h5>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{a.content}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Attendance Tracker & Regulations</h2>
                <p className="text-xs text-slate-500">Real-time attendance record for Semester {student.semester} (Academic Year 2026-27)</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  Aggregate: <strong className={`text-sm ${isAttendanceLow ? 'text-red-600' : 'text-emerald-700'}`}>{attendancePct}%</strong>
                </div>
              </div>
            </div>

            {/* Subject-wise breakdown table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="pb-3">Subject Code</th>
                    <th className="pb-3">Subject Name</th>
                    <th className="pb-3">Faculty</th>
                    <th className="pb-3 text-center">Attended / Total</th>
                    <th className="pb-3 text-center">Percentage</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((sub, index) => {
                    const pct = [88.5, 92.0, 78.4, 95.0, 81.2, 98.0][index % 6];
                    const isSubjectLow = pct < 75;
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 font-mono font-bold text-blue-600">{sub.code}</td>
                        <td className="py-3 font-semibold text-slate-900">{sub.name}</td>
                        <td className="py-3 text-slate-600">{sub.facultyName}</td>
                        <td className="py-3 text-center font-mono text-slate-700">
                          {Math.round((pct / 100) * 45)} / 45
                        </td>
                        <td className="py-3 text-center">
                          <span className={`font-bold font-mono ${isSubjectLow ? 'text-red-600' : 'text-slate-800'}`}>
                            {pct}%
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isSubjectLow
                              ? 'bg-red-100 text-red-800'
                              : pct >= 85
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isSubjectLow ? 'At Risk (<75%)' : 'Eligible'}
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

      {/* 3. INTERNAL MARKS & SEMESTER RESULTS */}
      {activeTab === 'marks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Internal Assessment & Semester Results</h2>
                <p className="text-xs text-slate-500">Continuous Assessment Test Scores for Semester {student.semester}</p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
                Evaluation: 40% Internals + 60% University Final
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="pb-3">Subject</th>
                    <th className="pb-3">Credits</th>
                    <th className="pb-3 text-center">IA-1 (100)</th>
                    <th className="pb-3 text-center">IA-2 (100)</th>
                    <th className="pb-3 text-center">Avg (40%)</th>
                    <th className="pb-3 text-center">Grade</th>
                    <th className="pb-3 text-right">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((sub, idx) => {
                    const ia1Marks = [88, 92, 79, 95, 84, 98][idx % 6];
                    const ia2Marks = [90, 89, 82, 96, 88, 95][idx % 6];
                    const avg = ((ia1Marks + ia2Marks) / 2).toFixed(1);
                    const grade = +avg >= 90 ? 'O' : +avg >= 80 ? 'A+' : +avg >= 70 ? 'A' : 'B+';
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50 transition">
                        <td className="py-3">
                          <div className="font-mono text-blue-600 font-bold">{sub.code}</div>
                          <div className="text-slate-900 font-medium">{sub.name}</div>
                        </td>
                        <td className="py-3 font-mono text-slate-600">{sub.credits}</td>
                        <td className="py-3 text-center font-mono font-semibold">{ia1Marks}</td>
                        <td className="py-3 text-center font-mono font-semibold">{ia2Marks}</td>
                        <td className="py-3 text-center font-mono font-bold text-slate-900">{avg}</td>
                        <td className="py-3 text-center font-bold">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">{grade}</span>
                        </td>
                        <td className="py-3 text-right font-bold text-emerald-600">PASSED</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. CGPA CALCULATOR TAB */}
      {activeTab === 'cgpa' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="max-w-2xl mb-6">
              <h2 className="text-lg font-bold text-slate-900">Interactive CGPA Projector & Target Simulator</h2>
              <p className="text-xs text-slate-500 mt-1">
                Simulate your expected letter grades for Semester {student.semester} subjects to compute your projected GPA and overall cumulative CGPA.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-medium">Completed Semesters</span>
                <span className="text-2xl font-extrabold text-slate-900 block mt-1">Semesters 1 to 4</span>
                <span className="text-[11px] text-slate-400">Past CGPA: {student.cgpa}</span>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-xs text-blue-700 font-medium">Simulated Semester 5 GPA</span>
                <span className="text-3xl font-extrabold text-blue-700 block mt-1">{simulatedGpa}</span>
                <span className="text-[11px] text-blue-600 font-semibold">{totalCredits} Total Credits</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs text-emerald-800 font-medium">Projected Cumulative CGPA</span>
                <span className="text-3xl font-extrabold text-emerald-700 block mt-1">{projectedCgpa}</span>
                <span className="text-[11px] text-emerald-600 font-semibold">First Class with Distinction</span>
              </div>
            </div>

            {/* Subject Grade Selectors */}
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-3">
              Select Anticipated Grades for Semester 5 Courses:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((sub) => (
                <div key={sub.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-600">{sub.code}</span>
                      <p className="text-xs font-semibold text-slate-900 leading-snug">{sub.name}</p>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {sub.credits} C
                    </span>
                  </div>
                  <label className="text-[11px] text-slate-500 block mb-1">Expected Grade:</label>
                  <select
                    value={simulatedGrades[sub.code] || 8}
                    onChange={(e) =>
                      setSimulatedGrades({
                        ...simulatedGrades,
                        [sub.code]: Number(e.target.value),
                      })
                    }
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value={10}>O - Outstanding (10 pts)</option>
                    <option value={9}>A+ - Excellent (9 pts)</option>
                    <option value={8}>A - Very Good (8 pts)</option>
                    <option value={7}>B+ - Good (7 pts)</option>
                    <option value={6}>B - Above Average (6 pts)</option>
                    <option value={0}>U - Re-appear (0 pts)</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TIMETABLE TAB */}
      {activeTab === 'timetable' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Weekly Class Timetable</h2>
                <p className="text-xs text-slate-500">B.Tech Information Technology • 3rd Year Section A • Room LH-301</p>
              </div>

              {/* Day Selector Tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setActiveDay(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeDay === d ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {dayTimetable.map((slot, index) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-300 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold text-sm font-mono">
                      0{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-blue-600">{slot.subjectCode}</span>
                        <h4 className="text-sm font-bold text-slate-900">{slot.subjectName}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Faculty: <span className="text-slate-700 font-medium">{slot.facultyName}</span> • Hall:{' '}
                        <span className="text-slate-700 font-medium">{slot.roomNumber}</span>
                      </p>
                    </div>
                  </div>

                  <div className="font-mono text-xs font-bold text-blue-900 bg-blue-100/60 px-3 py-1.5 rounded-lg text-right self-start sm:self-center">
                    {slot.startTime} - {slot.endTime}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Course Assignments & Tasks</h2>
                <p className="text-xs text-slate-500">Track deadlines, submit laboratory tasks and view faculty grades</p>
              </div>
            </div>

            {asgSubmittedSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                ✅ Assignment submitted successfully!
              </div>
            )}

            <div className="mt-6 space-y-4">
              {assignments.map((asg) => {
                const submission = submissions.find(
                  (s) => s.assignmentId === asg.id && s.studentId === student.id
                );
                const isSelected = selectedAsgId === asg.id;

                return (
                  <div key={asg.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold font-mono">
                            {asg.subjectCode}
                          </span>
                          <span className="text-xs text-slate-500">{asg.subjectName}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{asg.title}</h4>
                        <p className="text-xs text-slate-600 mt-1">{asg.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold block text-slate-800">Due: {asg.dueDate.split('T')[0]}</span>
                        <span className="text-[11px] text-slate-500">Max Marks: {asg.maxPoints} pts</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        {submission ? (
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                              Status: {submission.status.toUpperCase()}
                            </span>
                            {submission.score !== undefined && (
                              <span className="text-xs font-bold text-slate-800">
                                Score: {submission.score} / {asg.maxPoints}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                            Pending Submission
                          </span>
                        )}
                      </div>

                      {!submission && (
                        <button
                          onClick={() => setSelectedAsgId(isSelected ? null : asg.id)}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                        >
                          {isSelected ? 'Cancel' : 'Submit Solution'}
                        </button>
                      )}
                    </div>

                    {/* Submission Drawer */}
                    {isSelected && !submission && (
                      <div className="mt-4 p-4 rounded-xl bg-white border border-blue-200 space-y-3">
                        <label className="block text-xs font-bold text-slate-700">
                          Submit Solution (GitHub Link / Project Summary / Text):
                        </label>
                        <textarea
                          rows={3}
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          placeholder="Paste GitHub repository URL, code solution, or summary here..."
                          className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleSubmitWork(asg.id)}
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                        >
                          Confirm & Submit Task
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 7. LEAVE & ON DUTY (OD) TAB */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Apply Leave Form (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-base text-slate-900 mb-1">Apply for Leave or On-Duty (OD)</h3>
              <p className="text-xs text-slate-500 mb-4">Requests are sent to Class Advisor <strong className="text-slate-700">{student.advisorName}</strong> for approval.</p>

              {leaveSuccessMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                  {leaveSuccessMsg}
                </div>
              )}

              <form onSubmit={handleApplyLeave} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Category</label>
                  <select
                    value={leaveType}
                    onChange={(e: any) => setLeaveType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="On Duty (OD)">On Duty (OD) - Symposium/Sports</option>
                    <option value="Sick Leave">Sick Leave (Medical)</option>
                    <option value="Personal Leave">Personal Leave / Emergency</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Purpose</label>
                  <textarea
                    rows={3}
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Provide detailed justification or symposium details..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                >
                  Submit Application
                </button>
              </form>
            </div>

            {/* Application History Tracker (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-base text-slate-900 mb-4">Leave Application Tracker</h3>
              
              <div className="space-y-3">
                {myLeaves.length === 0 ? (
                  <p className="text-xs text-slate-400">No leave requests found.</p>
                ) : (
                  myLeaves.map((lev) => (
                    <div key={lev.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-800">{lev.leaveType}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
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
                      <p className="text-xs text-slate-600">{lev.reason}</p>
                      <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Period: {lev.startDate} to {lev.endDate} ({lev.daysCount} days)</span>
                        <span>Applied: {lev.appliedDate}</span>
                      </div>
                      {lev.advisorRemarks && (
                        <div className="mt-2 p-2 rounded bg-blue-50 text-[11px] text-blue-900">
                          <strong>Advisor Remarks:</strong> {lev.advisorRemarks}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 8. EXAM SCHEDULE TAB */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">End Semester Examination Timetable</h2>
                <p className="text-xs text-slate-500">Hall Ticket & Seat Allotment Schedule (November 2026)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                  Hall Ticket: ELIGIBLE
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {examSchedule.map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{exam.subjectCode}</span>
                      <h4 className="text-sm font-bold text-slate-900">{exam.subjectName}</h4>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      <span>Exam: {exam.examName}</span>
                      <span>•</span>
                      <span>Venue: <strong className="text-slate-800">{exam.hallNumber}</strong></span>
                      <span>•</span>
                      <span>Seat: <strong className="text-blue-700 font-mono">{exam.seatInfo}</strong></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block font-bold text-slate-900 text-xs">{exam.date}</span>
                    <span className="block font-mono text-[11px] text-slate-500">{exam.timeSlot}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1">College & Department Circulars</h2>
            <p className="text-xs text-slate-500 mb-6">Official notices from Examination Cell, Placement Office, and Department</p>

            <div className="space-y-4">
              {announcements.map((anc) => (
                <div key={anc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">
                      {anc.category}
                    </span>
                    <span className="text-xs text-slate-400">{anc.publishedDate}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{anc.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{anc.content}</p>
                  <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-200 pt-2 flex justify-between">
                    <span>Issued By: {anc.authorName} ({anc.authorRole})</span>
                    <span>Target: Students</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 10. AI STUDY ASSISTANT (GEMINI POWERED) */}
      {activeTab === 'ai-mentor' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[700px]">
            
            {/* AI Header */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Sparkles className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                    CampusAI Study Assistant
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-normal">
                      Gemini 3.8 Flash
                    </span>
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Syllabus Q&A • Algorithm explanations • Personalized timetable generator
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleGenerateTimetableAi}
                  disabled={isAiLoading}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Generate Study Plan</span>
                </button>
              </div>
            </div>

            {/* Quick Prompt Pills */}
            <div className="bg-indigo-50/70 border-b border-indigo-100 p-2.5 px-4 flex items-center space-x-2 overflow-x-auto text-xs">
              <span className="text-slate-500 font-semibold shrink-0">Quick Ask:</span>
              {[
                'Explain AVL Tree balance rotations with example',
                'Top 5 SQL normalization interview questions',
                'What is the difference between TCP and UDP?',
                'Tips to score 9+ CGPA in B.Tech IT',
              ].map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendAiPrompt(p)}
                  className="px-2.5 py-1 rounded-full bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-100 text-[11px] whitespace-nowrap transition"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                    }`}
                  >
                    <div className="font-bold mb-1 opacity-75 text-[10px] uppercase">
                      {msg.role === 'user' ? 'You' : 'CampusAI Mentor'}
                    </div>
                    <div className="whitespace-pre-line prose-xs">{msg.text}</div>
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs flex items-center space-x-2 text-indigo-600 shadow-xs">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>CampusAI is thinking with Gemini 3.8...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center space-x-2">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendAiPrompt()}
                placeholder="Ask any question about algorithms, DBMS, networks, or exam tips..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSendAiPrompt()}
                disabled={isAiLoading || !userQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
