import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gemini SDK on the server side
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Route: AI Study Assistant (Q&A, concept explanations, study guidance)
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { prompt, subject, studentContext, conversationHistory } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ 
        error: 'Gemini API Key is not configured on the server. Please check your environment variables.',
        fallbackAvailable: true
      });
    }

    const systemInstruction = `You are "CampusAI", an elite academic mentor and study assistant for engineering and college students (B.Tech IT, CS, ECE, Mechanical, etc.).
Your goal is to provide clear, structured, encouraging, and syllabus-aligned explanations.
When answering:
1. Explain core concepts clearly with real-world computer science or engineering examples.
2. Break down mathematical or algorithmic steps with pseudo-code or code snippets where applicable.
3. Include high-yield exam tips, common viva questions, and memory mnemonics.
4. Keep tone respectful, highly academic, engaging, and professional.
${subject ? `The user is specifically asking in the context of subject: "${subject}".` : ''}
${studentContext ? `Student Profile Context: ${JSON.stringify(studentContext)}` : ''}`;

    let fullPrompt = prompt;
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const historyContext = conversationHistory
        .slice(-6)
        .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`)
        .join('\n');
      fullPrompt = `Recent context:\n${historyContext}\n\nCurrent Question: ${prompt}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Unable to generate response at this time.';
    res.json({ reply, model: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Error calling Gemini Assistant:', error);
    res.status(500).json({ 
      error: error?.message || 'Failed to generate study assistant response',
      fallbackAvailable: true 
    });
  }
});

// API Route: AI Performance Insights (for Advisors & HODs)
app.post('/api/ai/insights', async (req, res) => {
  try {
    const { role, department, studentsData, attendanceRate, passRate, targetFocus } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ 
        error: 'Gemini API Key is not configured on the server.',
        fallbackAvailable: true 
      });
    }

    const systemInstruction = `You are a Senior Academic Analytics Advisor for college administrators, HODs, and Class Advisors in Higher Education (B.Tech/College ERP).
Analyze the provided batch performance, attendance trends, and marks to provide:
1. Executive summary of academic health.
2. At-risk student identification with root-cause categorization (Attendance drop vs Concept difficulty vs Assignment negligence).
3. 3-4 actionable intervention strategies (e.g. remedial classes, peer tutoring, parent-advisor meeting schedule).
4. Subject-wise improvement pointers.
Format the response with crisp bullet points, bold headings, and clear metrics.`;

    const prompt = `Academic Performance Analysis Request:
Role: ${role || 'Faculty / HOD'}
Department: ${department || 'Information Technology'}
Average Attendance: ${attendanceRate || '82%'}
Average Pass Percentage: ${passRate || '88%'}
Focus Area: ${targetFocus || 'Semester 5 Mid-term evaluation & Low attendance intervention'}
Data Sample: ${JSON.stringify(studentsData || [])}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({ insights: response.text || 'No insights generated.', model: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Error calling Gemini Insights:', error);
    res.status(500).json({ 
      error: error?.message || 'Failed to generate academic insights',
      fallbackAvailable: true 
    });
  }
});

// API Route: AI Personalized Study Timetable Suggestion
app.post('/api/ai/timetable', async (req, res) => {
  try {
    const { subjects, examDate, availableHoursPerDay, weakSubjects, targetCgpa } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ 
        error: 'Gemini API Key is not configured on the server.',
        fallbackAvailable: true 
      });
    }

    const prompt = `Generate a realistic, high-efficiency weekly study timetable for a B.Tech student with the following parameters:
- Subjects: ${JSON.stringify(subjects || ['Data Structures & Algorithms', 'Operating Systems', 'Database Management Systems', 'Computer Networks', 'Software Engineering'])}
- Weak subjects needing focus: ${JSON.stringify(weakSubjects || ['Computer Networks', 'Algorithms'])}
- Available study hours per day: ${availableHoursPerDay || 4} hours
- Target CGPA / Score: ${targetCgpa || '8.5+'}
- Upcoming Exam Target: ${examDate || 'Next month semester exams'}

Please provide:
1. A structured day-by-day (Monday to Sunday) schedule breakdown.
2. Spaced repetition & active recall slots.
3. Rest & revision buffer sessions.
4. Top 3 exam scoring strategies for engineering subjects.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.6,
      },
    });

    res.json({ schedule: response.text || 'Schedule unavailable.', model: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Error calling Gemini Timetable:', error);
    res.status(500).json({ 
      error: error?.message || 'Failed to generate timetable',
      fallbackAvailable: true 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'CampusConnect API Server',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    supabaseConfigured: !!(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
    timestamp: new Date().toISOString()
  });
});

// Vite Middleware for development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 CampusConnect ERP Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});
