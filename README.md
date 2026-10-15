# CampusConnect – Smart College Management System

> A comprehensive, responsive **Web ERP Application** designed for higher education institutions, engineering colleges, and universities. Built for B.Tech Information Technology mini projects and production deployment on Vercel.

---

## 🌟 Key Features & Role-Based Access

CampusConnect provides four distinct portals with secure role-based access control:

### 1. Student Dashboard
- **Academic Profile:** Roll number, university register number, semester, section, and designated Class Advisor contact.
- **Attendance Percentage Tracker:** Real-time percentage with color-coded safety indicators (Green $\ge 85\%$, Blue $75\%-84\%$, Red Critical Alert $< 75\%$).
- **Internal Assessment Marks:** Continuous Assessment Test (IA-1, IA-2, Model Exam) scores, grades, and pass/fail tracking.
- **Interactive CGPA Calculator:** Real-time simulator to project future GPA based on anticipated grades.
- **Weekly Timetable:** Period-by-period daily schedule with room numbers and faculty details.
- **Course Assignments:** View pending lab and theory assignments, upload code solutions, and receive faculty feedback.
- **Leave & On-Duty (OD) Application:** Submit medical leaves or symposium OD requests with status tracking.
- **College Announcements:** Categorized circulars for exams, placements, and departmental symposiums.
- **End Semester Exam Schedule:** Examination dates, sessions, hall numbers, and seat numbers.
- **CampusAI Study Assistant:** Powered by **Google Gemini 3.8 Flash** for syllabus question answering, algorithm breakdowns, and personalized revision timetables.

### 2. Class Advisor Dashboard
- **Class Roster Management:** Complete student directory for the advised class.
- **Daily Attendance Entry:** Period-by-period attendance recording with 1-click "Mark All Present" and automatic percentage updates.
- **Low Attendance Alerts:** Real-time alert list highlighting all students below the $75\%$ regulatory threshold with instant parent advisory notifications.
- **Internal Marks Entry:** Grade entry portal with automatic calculation of letter grades ($O, A+, A, B+, B, U$).
- **Student Leave Approvals:** Approve, reject, or escalate leave requests to the HOD with custom advisor remarks.
- **Assignment Management:** Create new assignments and evaluate student submissions.
- **AI Class Diagnostic:** Generates batch performance and intervention insights via Gemini AI.

### 3. HOD (Head of Department) Dashboard
- **Department Overview:** Comprehensive metrics on student-to-faculty ratio ($15.8:1$), aggregate attendance, and pass percentage ($92.1\%$).
- **Faculty Directory & Allocations:** Faculty specializations, designations, and assigned class advisorships.
- **Academic Performance Analytics:** CGPA distribution cohorts (Distinction, First Class, Borderline) and top departmental rank holders.
- **Year-Wise Attendance Breakdown:** Attendance distribution across 1st, 2nd, 3rd, and 4th year batches.
- **Leave Escalation Endorsements:** Review and endorse extended student leave requests escalated by Class Advisors.
- **Department Circulars Publisher:** Publish official departmental circulars.
- **Gemini AI Departmental Analytics:** AI-generated SWOT and NAAC/NBA accreditation preparation reports.

### 4. Admin Dashboard
- **College Overview:** Central statistics across all engineering departments, active faculty, and students.
- **Manage Student Accounts:** Enroll new students, update records, and remove student accounts.
- **Manage Advisors & HODs:** Assign faculty to advisor roles and designate department heads.
- **Department Master:** Manage engineering branches and view metrics.
- **Course & Subject Master:** Curriculum setup, credit allocations, and faculty assignments.
- **College-Wide Broadcasts:** Institutional announcements filtered by role or branch.
- **Academic Reports & Data Export:** One-click CSV export of Student Directory and Internal Marks records.
- **User Role Access Control:** Matrix of role permissions enforced by client guards and Supabase Row Level Security (RLS).

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Plus Jakarta Sans typography.
- **Backend & Database:** Supabase (PostgreSQL with Row Level Security).
- **AI Engine:** Google Gemini API (`gemini-3.8-flash` via `@google/genai`).
- **Server:** Node.js Express server with Vite middleware integration.
- **Deployment:** Vercel (standard Vite SPA build).

---

## 📂 Project Structure

```text
├── index.html                  # HTML entry point with meta tags & Google fonts
├── metadata.json               # Applet metadata & server-side Gemini capability
├── package.json                # Standard npm scripts and dependencies
├── server.ts                   # Full-stack Express server with Gemini API routes
├── supabase-schema.sql         # Complete PostgreSQL schema, RLS, and seed data
├── tsconfig.json               # TypeScript compiler configuration
├── vercel.json                 # Vercel SPA routing rewrites configuration
├── vite.config.ts              # Vite configuration with Tailwind CSS plugin
├── .env.example                # Example environment variables
└── src/
    ├── App.tsx                 # Main application component & role dashboard routing
    ├── main.tsx                # React entry point
    ├── index.css               # Global styling & Tailwind CSS imports
    ├── types/
    │   └── index.ts            # TypeScript interfaces for ERP entities
    ├── data/
    │   └── initialData.ts      # Seed data for demo accounts and initial state
    ├── lib/
    │   └── supabase.ts         # Supabase client, credentials tester, & connection helpers
    ├── context/
    │   ├── AuthContext.tsx     # Role authentication & user profile state
    │   └── CollegeDataContext.tsx # Central ERP state & CRUD actions
    ├── services/
    │   └── ai.ts               # Gemini AI assistant & insights client service
    └── components/
        ├── auth/
        │   └── LoginPortal.tsx # 4 separate login options with 1-click demo access
        ├── common/
        │   ├── Navbar.tsx      # Navy blue header with role switcher & DB status
        │   └── DatabaseSetupModal.tsx # Supabase setup & SQL copy dialog
        └── dashboards/
            ├── StudentDashboard.tsx
            ├── AdvisorDashboard.tsx
            ├── HODDashboard.tsx
            └── AdminDashboard.tsx
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### 2. Installation
```bash
git clone <your-repository-url>
cd campusconnect
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (based on `.env.example`):
```env
# Gemini API Key (Required for AI Study Assistant & Academic Insights)
GEMINI_API_KEY="your_gemini_api_key_here"

# Supabase PostgreSQL Configuration
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_public_key"
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase PostgreSQL Setup

1. Create a free account at [supabase.com](https://supabase.com) and start a new project.
2. In your Supabase dashboard, click **SQL Editor** from the left navigation.
3. Click **New Query**, open the included `supabase-schema.sql` file in this repository, copy all contents, paste it into the editor, and click **Run**.
4. Navigate to **Project Settings > API**:
   - Copy **Project URL** into `VITE_SUPABASE_URL`
   - Copy **anon / public key** into `VITE_SUPABASE_ANON_KEY`
5. Click the **Database Settings** badge in the CampusConnect header and use the built-in **Test & Save** tool to verify live connectivity!

> **Note on Interactive Demo Mode:**
> When Supabase credentials are not yet entered, CampusConnect operates seamlessly in **Interactive Demo Mode** with pre-seeded data stored locally. You can evaluate and demonstrate all 4 dashboards immediately.

---

## 🧠 Google Gemini AI Integration

CampusConnect features server-side AI integration through `server.ts`:
- **`POST /api/ai/assistant`**: Evaluates student questions in context with their engineering branch, generates algorithm pseudocode, and provides exam scoring tips.
- **`POST /api/ai/insights`**: Ingests class attendance rates, pass percentages, and at-risk student cohorts to output tailored faculty intervention strategies.
- **`POST /api/ai/timetable`**: Generates a personalized 7-day study and spaced-repetition revision timetable.

The Gemini API key is kept securely on the server side (`process.env.GEMINI_API_KEY`) and is never exposed to browser bundles.

---

## 🌐 Vercel Deployment Guide

CampusConnect is pre-configured for one-click deployment on [Vercel](https://vercel.com):

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CampusConnect Smart College Management System"
   git branch -M main
   git remote add origin https://github.com/<your-username>/campusconnect.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
   - Select your GitHub repository `campusconnect`.
   - Vercel automatically detects the **Vite** framework:
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
   - Under **Environment Variables**, add:
     - `GEMINI_API_KEY`: Your Google Gemini API key
     - `VITE_SUPABASE_URL`: Your Supabase Project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - Click **Deploy**.

3. **Routing Verification:**
   - The included `vercel.json` ensures that all single-page application routes redirect to `/index.html`.

---

## 🔑 Demo Login Accounts

| Role | Name | Identifier / Email | Demo Password |
|---|---|---|---|
| **Student** | Aravind Sharma | `22IT045` / `aravind.sharma@campusconnect.edu` | `campus123` |
| **Class Advisor** | Dr. Priya Natarajan | `FAC-IT-104` / `priya.natarajan@campusconnect.edu` | `campus123` |
| **HOD** | Dr. Rajesh Sundaram | `HOD-IT-001` / `rajesh.sundaram@campusconnect.edu` | `campus123` |
| **Admin** | Mr. Suresh Varma | `ADM-SYS-001` / `admin.erp@campusconnect.edu` | `campus123` |

*(Each login option on the portal also features a 1-click **Instant Evaluator Access** button for rapid evaluation).*

---

## 📜 License & Academic Project Details

- **Academic Branch:** B.Tech Information Technology (IT)
- **Course:** Mini Project / Final Semester Project
- **Accreditation Standard:** Compliant with NAAC Criterion 2 (Teaching-Learning & Evaluation) and NBA Outcome-Based Education (OBE) metrics.
