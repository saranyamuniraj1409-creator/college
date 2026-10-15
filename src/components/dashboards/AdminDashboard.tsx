import React, { useState } from 'react';
import {
  ShieldCheck,
  Building,
  Users,
  BookOpen,
  Bell,
  Download,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  GraduationCap,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCollegeData } from '../../context/CollegeDataContext';
import { Student, UserRole } from '../../types';

type AdminTab =
  | 'overview'
  | 'students'
  | 'advisors'
  | 'departments'
  | 'subjects'
  | 'announcements'
  | 'reports'
  | 'roles';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    students,
    faculty,
    departments,
    subjects,
    marks,
    announcements,
    addStudent,
    deleteStudent,
    addSubject,
    publishAnnouncement,
  } = useCollegeData();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [studentSearch, setStudentSearch] = useState('');

  // Add Student Modal State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStdName, setNewStdName] = useState('');
  const [newStdEmail, setNewStdEmail] = useState('');
  const [newStdRoll, setNewStdRoll] = useState('');
  const [newStdReg, setNewStdReg] = useState('');
  const [newStdDept, setNewStdDept] = useState('Information Technology');
  const [newStdBatch, setNewStdBatch] = useState('2023 - 2027');
  const [newStdParent, setNewStdParent] = useState('');
  const [newStdParentPhone, setNewStdParentPhone] = useState('');

  // Add Subject Modal State
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubCredits, setNewSubCredits] = useState(3);
  const [newSubSem, setNewSubSem] = useState(5);
  const [newSubDept, setNewSubDept] = useState('Information Technology');
  const [newSubFaculty, setNewSubFaculty] = useState('Dr. Priya Natarajan');

  // New Announcement Modal State
  const [showAncModal, setShowAncModal] = useState(false);
  const [ancTitle, setAncTitle] = useState('');
  const [ancContent, setAncContent] = useState('');
  const [ancCategory, setAncCategory] = useState<'Academic' | 'Exams' | 'Placement' | 'Events' | 'Emergency' | 'General'>('General');
  const [ancPriority, setAncPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [ancTarget, setAncTarget] = useState<UserRole | 'all'>('all');

  // Filtered Students
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.department.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Handlers
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStdName || !newStdRoll) return;

    await addStudent({
      name: newStdName,
      email: newStdEmail || `${newStdRoll.toLowerCase()}@campusconnect.edu`,
      rollNumber: newStdRoll,
      registerNumber: newStdReg || `7100222050${Math.floor(100 + Math.random() * 900)}`,
      department: newStdDept,
      semester: 5,
      section: 'A',
      batch: newStdBatch,
      cgpa: 8.0,
      attendancePercentage: 88.0,
      advisorName: 'Dr. Priya Natarajan',
      parentName: newStdParent || 'Parent Name',
      parentPhone: newStdParentPhone || '+91 94441 00000',
      studentPhone: '+91 98401 00000',
      status: 'active',
    });

    setNewStdName('');
    setNewStdRoll('');
    setNewStdReg('');
    setNewStdEmail('');
    setShowAddStudentModal(false);
  };

  const handleAddSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCode || !newSubName) return;

    await addSubject({
      code: newSubCode,
      name: newSubName,
      department: newSubDept,
      semester: newSubSem,
      credits: newSubCredits,
      facultyName: newSubFaculty,
    });

    setNewSubCode('');
    setNewSubName('');
    setShowAddSubModal(false);
  };

  const handlePublishCollegeAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ancTitle.trim() || !ancContent.trim()) return;

    await publishAnnouncement({
      title: ancTitle,
      content: ancContent,
      category: ancCategory,
      priority: ancPriority,
      targetRole: ancTarget,
      authorName: currentUser?.fullName || 'Central Administration',
      authorRole: 'Central Administrator',
    });

    setAncTitle('');
    setAncContent('');
    setShowAncModal(false);
  };

  // CSV Exporters
  const exportStudentsCsv = () => {
    const headers = 'RollNumber,Name,Email,Department,Semester,Section,CGPA,AttendancePercentage,ParentPhone\n';
    const rows = students
      .map(
        (s) =>
          `"${s.rollNumber}","${s.name}","${s.email}","${s.department}",${s.semester},"${s.section}",${s.cgpa},${s.attendancePercentage},"${s.parentPhone}"`
      )
      .join('\n');
    downloadBlob(headers + rows, 'campusconnect-students.csv');
  };

  const exportMarksCsv = () => {
    const headers = 'StudentName,RollNumber,SubjectCode,SubjectName,ExamType,MarksObtained,Grade\n';
    const rows = marks
      .map(
        (m) =>
          `"${m.studentName}","${m.rollNumber}","${m.subjectCode}","${m.subjectName}","${m.examType}",${m.marksObtained},"${m.grade}"`
      )
      .join('\n');
    downloadBlob(headers + rows, 'campusconnect-marks.csv');
  };

  const downloadBlob = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-700 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 text-2xl font-bold">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold">{currentUser?.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Central ERP Administrator
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Central Academic Directorate • Campus ERP Master Control Unit
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                Institutional ID: <span className="text-white font-mono">{currentUser?.employeeCode || 'ADM-SYS-001'}</span> • All Privileges Granted
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-xl border bg-slate-800/80 border-slate-700 text-center min-w-[110px]">
              <span className="text-xs text-slate-400 block font-medium">Departments</span>
              <span className="text-2xl font-extrabold text-blue-400">{departments.length}</span>
              <span className="text-[10px] block text-slate-400">Engineering</span>
            </div>

            <div className="p-4 rounded-xl border bg-slate-800/80 border-slate-700 text-center min-w-[110px]">
              <span className="text-xs text-slate-400 block font-medium">Faculty Strength</span>
              <span className="text-2xl font-extrabold text-emerald-400">112</span>
              <span className="text-[10px] block text-slate-400">Total Roster</span>
            </div>

            <div className="p-4 rounded-xl border bg-slate-800/80 border-slate-700 text-center min-w-[110px]">
              <span className="text-xs text-slate-400 block font-medium">Total Students</span>
              <span className="text-2xl font-extrabold text-amber-400">1,730</span>
              <span className="text-[10px] block text-slate-400">Enrolled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-3 mb-6 border-b border-slate-200 text-xs font-semibold scrollbar-none">
        {[
          { id: 'overview', label: 'College Overview', icon: Layers },
          { id: 'students', label: `Student Accounts (${students.length})`, icon: GraduationCap },
          { id: 'advisors', label: 'Advisors & HODs', icon: Users },
          { id: 'departments', label: `Departments (${departments.length})`, icon: Building },
          { id: 'subjects', label: `Courses & Subjects (${subjects.length})`, icon: BookOpen },
          { id: 'announcements', label: 'College Announcements', icon: Bell },
          { id: 'reports', label: 'Academic Reports & Export', icon: FileSpreadsheet },
          { id: 'roles', label: 'User Role Management', icon: ShieldCheck },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
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

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                College Attendance Avg
              </span>
              <div className="text-3xl font-extrabold text-blue-600">84.8%</div>
              <p className="text-xs text-slate-500 mt-1">Across all 4 branches</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Active Courses
              </span>
              <div className="text-3xl font-extrabold text-emerald-600">48</div>
              <p className="text-xs text-slate-500 mt-1">Theory & laboratory units</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Active Class Advisors
              </span>
              <div className="text-3xl font-extrabold text-purple-600">28</div>
              <p className="text-xs text-slate-500 mt-1">Designated faculty mentors</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                System Status
              </span>
              <div className="text-base font-extrabold text-emerald-600 flex items-center gap-1.5 mt-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Operational</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Database & Auth syncing</p>
            </div>
          </div>

          {/* Department Summary Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-4">
              Institutional Department Status Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="pb-3">Code</th>
                    <th className="pb-3">Department Name</th>
                    <th className="pb-3">Designated HOD</th>
                    <th className="pb-3 text-center">Faculty</th>
                    <th className="pb-3 text-center">Students</th>
                    <th className="pb-3 text-center">Attendance</th>
                    <th className="pb-3 text-right">Pass %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-mono font-bold text-blue-600">{dept.code}</td>
                      <td className="py-3 font-bold text-slate-900">{dept.name}</td>
                      <td className="py-3 text-slate-700">{dept.hodName}</td>
                      <td className="py-3 text-center font-mono font-semibold">{dept.facultyCount}</td>
                      <td className="py-3 text-center font-mono font-semibold">{dept.studentCount}</td>
                      <td className="py-3 text-center font-mono font-bold text-blue-600">{dept.averageAttendance}%</td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-600">{dept.passPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. MANAGE STUDENT ACCOUNTS */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Student Account Directory</h2>
                <p className="text-xs text-slate-500">Add, edit, enroll or remove student accounts</p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative w-48 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search name, roll..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>

                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Student</span>
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="pb-3">Roll No</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3 text-center">Semester</th>
                    <th className="pb-3 text-center">CGPA</th>
                    <th className="pb-3 text-center">Attendance</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-mono font-bold text-blue-600">{s.rollNumber}</td>
                      <td className="py-3">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-400">{s.email}</div>
                      </td>
                      <td className="py-3 text-slate-700">{s.department}</td>
                      <td className="py-3 text-center font-mono">Sem {s.semester} ({s.section})</td>
                      <td className="py-3 text-center font-mono font-bold">{s.cgpa}</td>
                      <td className="py-3 text-center font-mono font-bold text-slate-800">
                        {s.attendancePercentage}%
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => deleteStudent(s.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* 3. MANAGE ADVISORS AND HODS */}
      {activeTab === 'advisors' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Academic Leadership & Advisor Allocations</h2>
            <p className="text-xs text-slate-500 mb-6">Assign faculty members to Class Advisor and HOD responsibilities</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faculty.map((f) => (
                <div key={f.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-blue-600">{f.employeeCode}</span>
                      <h4 className="text-sm font-bold text-slate-900">{f.name}</h4>
                      <p className="text-xs text-slate-600">{f.designation} • {f.department}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.isAdvisor ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {f.isAdvisor ? 'Advisor Assigned' : 'Teaching Faculty'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Advised Class: <strong className="text-slate-800">{f.advisedClass || 'None'}</strong>
                    </span>
                    <button
                      onClick={() => alert(`Advisor allocation settings updated for ${f.name}.`)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-[11px]"
                    >
                      Reassign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. DEPARTMENT MANAGEMENT */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Academic Departments</h2>
                <p className="text-xs text-slate-500">Degree programs, faculty distribution, and departmental HODs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map((dept) => (
                <div key={dept.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Dept Code: {dept.code}
                    </span>
                    <span className="text-xs text-emerald-600 font-bold">Pass: {dept.passPercentage}%</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{dept.name}</h3>
                  <p className="text-xs text-slate-600 mt-1">Head of Department: <strong>{dept.hodName}</strong></p>
                  
                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between text-xs text-slate-500">
                    <span>Faculty: <strong className="text-slate-800">{dept.facultyCount}</strong></span>
                    <span>Students: <strong className="text-slate-800">{dept.studentCount}</strong></span>
                    <span>Avg Attendance: <strong className="text-blue-600">{dept.averageAttendance}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. COURSES AND SUBJECTS MANAGEMENT */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Course & Curriculum Master</h2>
                <p className="text-xs text-slate-500">Manage syllabus courses, credits, and faculty allocations</p>
              </div>

              <button
                onClick={() => setShowAddSubModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="pb-3">Code</th>
                    <th className="pb-3">Subject Name</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3 text-center">Semester</th>
                    <th className="pb-3 text-center">Credits</th>
                    <th className="pb-3 text-right">Assigned Faculty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-mono font-bold text-blue-600">{sub.code}</td>
                      <td className="py-3 font-bold text-slate-900">{sub.name}</td>
                      <td className="py-3 text-slate-600">{sub.department}</td>
                      <td className="py-3 text-center font-mono">{sub.semester}</td>
                      <td className="py-3 text-center font-mono font-bold text-slate-800">{sub.credits}</td>
                      <td className="py-3 text-right text-slate-800 font-medium">{sub.facultyName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* 6. COLLEGE ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Institutional Broadcast System</h2>
                <p className="text-xs text-slate-500">Publish college-wide notifications and role-targeted circulars</p>
              </div>

              <button
                onClick={() => setShowAncModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Announcement</span>
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map((anc) => (
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

      {/* 7. ACADEMIC REPORTS & EXPORT */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Academic Reports & CSV Data Exports</h2>
            <p className="text-xs text-slate-500 mb-6">Download verified institutional data files for auditing, accreditation and student files</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Student Directory Master File</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Roll numbers, names, batch, CGPA, and parent phone numbers</p>
                </div>
                <button
                  onClick={exportStudentsCsv}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Semester Internal Marks Report</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Continuous assessment test scores, grades, and pass/fail statistics</p>
                </div>
                <button
                  onClick={exportMarksCsv}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. USER ROLE MANAGEMENT */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1">User Role Access Control Matrix</h2>
            <p className="text-xs text-slate-500 mb-6">Enforced via Supabase Row Level Security (RLS) & Client Guard Policies</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                    <th className="p-3">Feature Capability</th>
                    <th className="p-3 text-center">Student</th>
                    <th className="p-3 text-center">Class Advisor</th>
                    <th className="p-3 text-center">HOD</th>
                    <th className="p-3 text-center">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { feat: 'View Personal Attendance & Marks', s: true, a: true, h: true, adm: true },
                    { feat: 'Mark Period Attendance', s: false, a: true, h: true, adm: true },
                    { feat: 'Enter Internal Marks (IA-1, IA-2)', s: false, a: true, h: true, adm: true },
                    { feat: 'Approve Student Leaves', s: false, a: true, h: true, adm: true },
                    { feat: 'View Department Analytics & Pass %', s: false, a: false, h: true, adm: true },
                    { feat: 'Manage Faculty & Class Advisors', s: false, a: false, h: false, adm: true },
                    { feat: 'Add / Remove Student Accounts', s: false, a: false, h: false, adm: true },
                    { feat: 'CampusAI Study Mentor Access', s: true, a: true, h: true, adm: true },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-900">{row.feat}</td>
                      <td className="p-3 text-center">{row.s ? '✅' : '❌'}</td>
                      <td className="p-3 text-center">{row.a ? '✅' : '❌'}</td>
                      <td className="p-3 text-center">{row.h ? '✅' : '❌'}</td>
                      <td className="p-3 text-center">{row.adm ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Enroll New Student Account</h3>
            <form onSubmit={handleAddStudentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newStdName}
                  onChange={(e) => setNewStdName(e.target.value)}
                  placeholder="e.g. Karthik Rajan"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={newStdRoll}
                    onChange={(e) => setNewStdRoll(e.target.value)}
                    placeholder="22IT088"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Register Number</label>
                  <input
                    type="text"
                    value={newStdReg}
                    onChange={(e) => setNewStdReg(e.target.value)}
                    placeholder="710022205088"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={newStdDept}
                  onChange={(e) => setNewStdDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="Information Technology">Information Technology</option>
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={newStdParent}
                    onChange={(e) => setNewStdParent(e.target.value)}
                    placeholder="Parent / Guardian"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Phone</label>
                  <input
                    type="text"
                    value={newStdParentPhone}
                    onChange={(e) => setNewStdParentPhone(e.target.value)}
                    placeholder="+91 94441 23456"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Add New Syllabus Subject</h3>
            <form onSubmit={handleAddSubjectSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    placeholder="IT3509"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newSubCredits}
                    onChange={(e) => setNewSubCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Distributed Cloud Computing Architecture"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Allocated Faculty</label>
                <select
                  value={newSubFaculty}
                  onChange={(e) => setNewSubFaculty(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  {faculty.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name} ({f.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Announcement Modal */}
      {showAncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Publish College Announcement</h3>
            <form onSubmit={handlePublishCollegeAnnouncement} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={ancTitle}
                  onChange={(e) => setAncTitle(e.target.value)}
                  placeholder="e.g. Semester Exam Fee Deadline & Registration Circular"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Announcement Body</label>
                <textarea
                  rows={4}
                  required
                  value={ancContent}
                  onChange={(e) => setAncContent(e.target.value)}
                  placeholder="Details of the announcement..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={ancCategory}
                    onChange={(e: any) => setAncCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="General">General</option>
                    <option value="Exams">Exams</option>
                    <option value="Placement">Placement</option>
                    <option value="Academic">Academic</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={ancTarget}
                    onChange={(e: any) => setAncTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="all">Entire College (All Roles)</option>
                    <option value="student">Students Only</option>
                    <option value="advisor">Faculty / Advisors Only</option>
                    <option value="hod">HODs Only</option>
                  </select>
                </div>
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
                  Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
