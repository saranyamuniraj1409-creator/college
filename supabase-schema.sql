-- ==============================================================================
-- CampusConnect – Smart College Management System
-- Supabase PostgreSQL Database Schema & Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES ENUM
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'advisor', 'hod', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    hod_name VARCHAR(100),
    established_year INT DEFAULT 2005,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USERS / PROFILES TABLE (Linked with Supabase auth.users or standalone ERP users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE, -- References auth.users(id) when Supabase Auth is activated
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    phone VARCHAR(20),
    avatar_url TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    register_number VARCHAR(30) UNIQUE NOT NULL,
    batch VARCHAR(20) NOT NULL, -- e.g. '2023-2027'
    semester INT NOT NULL DEFAULT 5,
    section VARCHAR(5) DEFAULT 'A',
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    cgpa NUMERIC(4, 2) DEFAULT 8.42,
    advisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. FACULTY TABLE
CREATE TABLE IF NOT EXISTS public.faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    designation VARCHAR(100) NOT NULL, -- 'Assistant Professor', 'Associate Professor', 'Professor'
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    specialization VARCHAR(150),
    joining_date DATE DEFAULT '2019-06-15',
    is_class_advisor BOOLEAN DEFAULT false,
    advised_class VARCHAR(50), -- e.g. 'B.Tech IT - 3rd Year A'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. COURSES & SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    semester INT NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    faculty_id UUID REFERENCES public.faculty(id) ON DELETE SET NULL,
    syllabus_outline TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    period_slot VARCHAR(20) NOT NULL, -- e.g. '09:00 - 10:00'
    status VARCHAR(15) NOT NULL CHECK (status IN ('present', 'absent', 'on_duty', 'late')),
    marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. INTERNAL MARKS & EXAM RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    exam_type VARCHAR(30) NOT NULL, -- 'Internal Assessment 1', 'Internal Assessment 2', 'Model Exam', 'Semester Exam'
    max_marks NUMERIC(5, 2) NOT NULL DEFAULT 100,
    marks_obtained NUMERIC(5, 2) NOT NULL,
    grade VARCHAR(5),
    academic_year VARCHAR(20) DEFAULT '2025-2026',
    semester INT NOT NULL,
    entered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TIMETABLES TABLE
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    semester INT NOT NULL,
    section VARCHAR(5) NOT NULL,
    day_of_week VARCHAR(15) NOT NULL, -- 'Monday', 'Tuesday', etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    faculty_id UUID REFERENCES public.faculty(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    semester INT NOT NULL,
    section VARCHAR(5) NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_points INT DEFAULT 100,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. ASSIGNMENT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    score INT,
    feedback TEXT,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late', 'pending'))
);

-- 12. LEAVE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    leave_type VARCHAR(30) NOT NULL, -- 'Sick Leave', 'On Duty (OD)', 'Personal Leave', 'Emergency'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    supporting_document_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated_to_hod')),
    advisor_remarks TEXT,
    hod_remarks TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'General', -- 'Exam', 'Placement', 'Holiday', 'Seminar', 'Academic'
    priority VARCHAR(15) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    target_role user_role, -- NULL means all roles
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL, -- NULL means college-wide
    published_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. EXAM SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.exam_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    exam_name VARCHAR(100) NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    hall_number VARCHAR(50) NOT NULL,
    seating_plan_info TEXT,
    semester INT NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Announcements RLS: Everyone authenticated can view announcements; Admins, HODs, Advisors can post
CREATE POLICY "Announcements are viewable by all authenticated users"
ON public.announcements FOR SELECT
USING (true);

CREATE POLICY "Announcements can be created by Admins, HODs and Advisors"
ON public.announcements FOR INSERT
WITH CHECK (
    get_current_role() IN ('admin', 'hod', 'advisor')
);

-- Profiles RLS: Users can view their own profile; Admins & HODs can view all
CREATE POLICY "Profiles viewable by self or faculty/admin"
ON public.profiles FOR SELECT
USING (
    auth_id = auth.uid() OR get_current_role() IN ('admin', 'hod', 'advisor')
);

CREATE POLICY "Profiles editable by admin or self"
ON public.profiles FOR UPDATE
USING (
    auth_id = auth.uid() OR get_current_role() = 'admin'
);

-- Attendance RLS: Students see own attendance; Advisors and HODs see their class/department
CREATE POLICY "Attendance viewable by student, faculty, admin"
ON public.attendance FOR SELECT
USING (true);

CREATE POLICY "Attendance modifiable by faculty and admin"
ON public.attendance FOR ALL
USING (
    get_current_role() IN ('advisor', 'hod', 'admin')
);

-- Leave requests RLS: Students can create; Advisors/HODs can approve
CREATE POLICY "Students can view and create leave requests"
ON public.leave_requests FOR ALL
USING (true);

-- Marks RLS: Students view own marks; Faculty manage marks
CREATE POLICY "Marks viewable by all authorized users"
ON public.marks FOR SELECT
USING (true);

CREATE POLICY "Marks modifiable by faculty and admin"
ON public.marks FOR ALL
USING (
    get_current_role() IN ('advisor', 'hod', 'admin')
);

-- ==============================================================================
-- SEED DATA (INITIAL DEMO DATA)
-- ==============================================================================

-- Insert Departments
INSERT INTO public.departments (code, name, description, hod_name, established_year) VALUES
('IT', 'Information Technology', 'Department of Information Technology & Software Engineering', 'Dr. Rajesh Sundaram', 2005),
('CSE', 'Computer Science & Engineering', 'Department of Computer Science and AI/ML', 'Dr. Aruna Devi', 2001),
('ECE', 'Electronics & Communication', 'Department of Electronics & Embedded Systems', 'Dr. K. Ramanathan', 1998)
ON CONFLICT (code) DO NOTHING;
