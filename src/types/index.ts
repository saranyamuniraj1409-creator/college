export type UserRole = 'student' | 'advisor' | 'hod' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  departmentCode: string;
  departmentName: string;
  designation?: string;
  employeeCode?: string;
  rollNumber?: string;
  registerNumber?: string;
  semester?: number;
  section?: string;
  batch?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  registerNumber: string;
  department: string;
  semester: number;
  section: string;
  batch: string;
  cgpa: number;
  attendancePercentage: number;
  advisorName: string;
  parentName: string;
  parentPhone: string;
  studentPhone: string;
  avatarUrl?: string;
  status: 'active' | 'detained' | 'graduated';
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  employeeCode: string;
  designation: string;
  department: string;
  phone: string;
  specialization: string;
  isAdvisor: boolean;
  advisedClass?: string;
  experienceYears: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  credits: number;
  facultyName: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  date: string;
  subjectCode: string;
  subjectName: string;
  period: string;
  status: 'present' | 'absent' | 'on_duty' | 'late';
  remarks?: string;
}

export interface MarkRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  subjectCode: string;
  subjectName: string;
  examType: 'IA-1' | 'IA-2' | 'Model Exam' | 'Semester Final';
  marksObtained: number;
  maxMarks: number;
  grade: string;
  semester: number;
  dateRecorded: string;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  roomNumber: string;
  semester: number;
  section: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  section: string;
  dueDate: string;
  maxPoints: number;
  createdByName: string;
  totalStudents: number;
  submittedCount: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  submittedAt: string;
  submissionContent: string;
  fileAttachment?: string;
  status: 'submitted' | 'graded' | 'late';
  score?: number;
  feedback?: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  semester: number;
  leaveType: 'Sick Leave' | 'On Duty (OD)' | 'Personal Leave' | 'Family Emergency' | 'Event Participation';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated_to_hod';
  appliedDate: string;
  advisorRemarks?: string;
  hodRemarks?: string;
  supportingDocUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Academic' | 'Exams' | 'Placement' | 'Events' | 'Emergency' | 'General';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetRole?: UserRole | 'all';
  department?: string;
  authorName: string;
  authorRole: string;
  publishedDate: string;
}

export interface ExamScheduleItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  examName: string;
  date: string;
  timeSlot: string;
  hallNumber: string;
  seatInfo: string;
  semester: number;
}

export interface DepartmentStats {
  id: string;
  code: string;
  name: string;
  hodName: string;
  facultyCount: number;
  studentCount: number;
  averageAttendance: number;
  passPercentage: number;
  averageCgpa: number;
}
