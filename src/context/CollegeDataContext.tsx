import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  Faculty,
  Subject,
  AttendanceRecord,
  MarkRecord,
  TimetableSlot,
  Assignment,
  AssignmentSubmission,
  LeaveRequest,
  Announcement,
  ExamScheduleItem,
  DepartmentStats,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_FACULTY,
  INITIAL_SUBJECTS,
  INITIAL_MARKS,
  INITIAL_TIMETABLE,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_EXAMS,
  INITIAL_DEPARTMENTS,
} from '../data/initialData';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

interface CollegeDataContextType {
  // Data
  students: Student[];
  faculty: Faculty[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  marks: MarkRecord[];
  timetable: TimetableSlot[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  leaveRequests: LeaveRequest[];
  announcements: Announcement[];
  examSchedule: ExamScheduleItem[];
  departments: DepartmentStats[];
  
  // Handlers
  markAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => Promise<void>;
  updateStudentAttendance: (studentId: string, percentage: number) => void;
  addMarkRecord: (record: Omit<MarkRecord, 'id'>) => Promise<void>;
  applyLeave: (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => Promise<void>;
  reviewLeaveRequest: (
    id: string,
    status: 'approved' | 'rejected' | 'escalated_to_hod',
    remarks: string,
    byRole: 'advisor' | 'hod'
  ) => Promise<void>;
  createAssignment: (assignment: Omit<Assignment, 'id' | 'submittedCount' | 'totalStudents'>) => Promise<void>;
  submitAssignment: (assignmentId: string, content: string) => Promise<void>;
  gradeSubmission: (submissionId: string, score: number, feedback: string) => Promise<void>;
  publishAnnouncement: (announcement: Omit<Announcement, 'id' | 'publishedDate'>) => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  
  // Helpers
  lowAttendanceStudents: Student[];
  refreshData: () => Promise<void>;
  isSyncing: boolean;
}

const CollegeDataContext = createContext<CollegeDataContextType | undefined>(undefined);

export const CollegeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('campus_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [faculty, setFaculty] = useState<Faculty[]>(() => {
    const saved = localStorage.getItem('campus_faculty');
    return saved ? JSON.parse(saved) : INITIAL_FACULTY;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('campus_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('campus_attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [marks, setMarks] = useState<MarkRecord[]>(() => {
    const saved = localStorage.getItem('campus_marks');
    return saved ? JSON.parse(saved) : INITIAL_MARKS;
  });

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem('campus_timetable');
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('campus_assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => {
    const saved = localStorage.getItem('campus_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('campus_leaves');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('campus_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [examSchedule, setExamSchedule] = useState<ExamScheduleItem[]>(() => {
    const saved = localStorage.getItem('campus_exams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });

  const [departments, setDepartments] = useState<DepartmentStats[]>(() => {
    const saved = localStorage.getItem('campus_departments');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('campus_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('campus_faculty', JSON.stringify(faculty));
  }, [faculty]);

  useEffect(() => {
    localStorage.setItem('campus_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('campus_marks', JSON.stringify(marks));
  }, [marks]);

  useEffect(() => {
    localStorage.setItem('campus_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('campus_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('campus_leaves', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('campus_announcements', JSON.stringify(announcements));
  }, [announcements]);

  // Try fetching from Supabase if configured
  const refreshData = async () => {
    if (!isSupabaseConfigured()) return;
    const client = getSupabaseClient();
    if (!client) return;

    setIsSyncing(true);
    try {
      // Fetch announcements
      const { data: ancData } = await client.from('announcements').select('*').order('created_at', { ascending: false });
      if (ancData && ancData.length > 0) {
        setAnnouncements(
          ancData.map((a: any) => ({
            id: a.id,
            title: a.title,
            content: a.content,
            category: a.category || 'General',
            priority: a.priority || 'normal',
            targetRole: a.target_role || 'all',
            authorName: a.published_by_name || 'Administration',
            authorRole: 'Admin',
            publishedDate: a.created_at ? a.created_at.split('T')[0] : '2026-10-15',
          }))
        );
      }
    } catch (err) {
      console.warn('Supabase fetch error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Low attendance calculation (< 75%)
  const lowAttendanceStudents = students.filter((s) => s.attendancePercentage < 75);

  // Attendance recording
  const markAttendance = async (records: Omit<AttendanceRecord, 'id'>[]) => {
    const newRecords: AttendanceRecord[] = records.map((r, idx) => ({
      ...r,
      id: `att-${Date.now()}-${idx}`,
    }));

    setAttendanceRecords((prev) => [...newRecords, ...prev]);

    // Recalculate each student's attendance percentage slightly based on this entry
    setStudents((prev) =>
      prev.map((student) => {
        const studentRecord = records.find((r) => r.studentId === student.id);
        if (!studentRecord) return student;

        let delta = 0;
        if (studentRecord.status === 'present' || studentRecord.status === 'on_duty') {
          delta = 0.4;
        } else if (studentRecord.status === 'absent') {
          delta = -0.6;
        }

        const newPct = Math.min(100, Math.max(0, +(student.attendancePercentage + delta).toFixed(1)));
        return { ...student, attendancePercentage: newPct };
      })
    );
  };

  const updateStudentAttendance = (studentId: string, percentage: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, attendancePercentage: percentage } : s))
    );
  };

  // Marks entry
  const addMarkRecord = async (record: Omit<MarkRecord, 'id'>) => {
    const newRecord: MarkRecord = {
      ...record,
      id: `mrk-${Date.now()}`,
    };
    setMarks((prev) => [newRecord, ...prev]);
  };

  // Leave requests
  const applyLeave = async (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => {
    const newLeave: LeaveRequest = {
      ...leave,
      id: `lev-${Date.now()}`,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };
    setLeaveRequests((prev) => [newLeave, ...prev]);
  };

  const reviewLeaveRequest = async (
    id: string,
    status: 'approved' | 'rejected' | 'escalated_to_hod',
    remarks: string,
    byRole: 'advisor' | 'hod'
  ) => {
    setLeaveRequests((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (byRole === 'advisor') {
          return {
            ...item,
            status,
            advisorRemarks: remarks,
          };
        } else {
          return {
            ...item,
            status: status === 'escalated_to_hod' ? 'approved' : status,
            hodRemarks: remarks,
          };
        }
      })
    );
  };

  // Assignments
  const createAssignment = async (
    assignment: Omit<Assignment, 'id' | 'submittedCount' | 'totalStudents'>
  ) => {
    const newAsg: Assignment = {
      ...assignment,
      id: `asg-${Date.now()}`,
      totalStudents: students.length,
      submittedCount: 0,
    };
    setAssignments((prev) => [newAsg, ...prev]);
  };

  const submitAssignment = async (assignmentId: string, content: string) => {
    const sub: AssignmentSubmission = {
      id: `subm-${Date.now()}`,
      assignmentId,
      studentId: 'std-22it045',
      studentName: 'Aravind Sharma',
      rollNumber: '22IT045',
      submittedAt: new Date().toISOString(),
      submissionContent: content,
      status: 'submitted',
    };
    setSubmissions((prev) => [sub, ...prev]);
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? { ...a, submittedCount: a.submittedCount + 1 } : a))
    );
  };

  const gradeSubmission = async (submissionId: string, score: number, feedback: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId ? { ...s, score, feedback, status: 'graded' } : s
      )
    );
  };

  // Announcements
  const publishAnnouncement = async (
    announcement: Omit<Announcement, 'id' | 'publishedDate'>
  ) => {
    const newAnc: Announcement = {
      ...announcement,
      id: `anc-${Date.now()}`,
      publishedDate: new Date().toISOString().split('T')[0],
    };
    setAnnouncements((prev) => [newAnc, ...prev]);
  };

  // Admin student management
  const addStudent = async (student: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...student,
      id: `std-${Date.now()}`,
    };
    setStudents((prev) => [newStudent, ...prev]);
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStudent = async (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const addSubject = async (subject: Omit<Subject, 'id'>) => {
    const newSub: Subject = {
      ...subject,
      id: `sub-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, newSub]);
  };

  return (
    <CollegeDataContext.Provider
      value={{
        students,
        faculty,
        subjects,
        attendanceRecords,
        marks,
        timetable,
        assignments,
        submissions,
        leaveRequests,
        announcements,
        examSchedule,
        departments,
        markAttendance,
        updateStudentAttendance,
        addMarkRecord,
        applyLeave,
        reviewLeaveRequest,
        createAssignment,
        submitAssignment,
        gradeSubmission,
        publishAnnouncement,
        addStudent,
        updateStudent,
        deleteStudent,
        addSubject,
        lowAttendanceStudents,
        refreshData,
        isSyncing,
      }}
    >
      {children}
    </CollegeDataContext.Provider>
  );
};

export const useCollegeData = () => {
  const context = useContext(CollegeDataContext);
  if (!context) {
    throw new Error('useCollegeData must be used within a CollegeDataProvider');
  }
  return context;
};
