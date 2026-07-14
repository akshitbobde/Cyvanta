import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { sendWelcomeEmail } from "./email";

const app = express();

app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development flexibility
}));
app.use(morgan("dev"));
app.use(express.json());

// Mock Assessment Data/Storage for MVP if Supabase is disconnected
let assessments: any[] = [];

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/send-welcome", async (req, res) => {
  try {
    const { email, fullName } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const result = await sendWelcomeEmail({ email, fullName });
    res.json(result);
  } catch (error: any) {
    console.error("Error in welcome email endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to process welcome email." });
  }
});

app.get("/api/assessments", (req, res) => {
  res.json(assessments);
});

app.post("/api/assessments", (req, res) => {
  const newAssessment = {
    id: Math.random().toString(36).substring(2, 11),
    ...req.body,
    created_at: new Date().toISOString(),
  };
  assessments.push(newAssessment);
  res.status(201).json(newAssessment);
});

app.get("/api/assessments/latest", (req, res) => {
  const latest = assessments[assessments.length - 1];
  res.json(latest || null);
});

export { app };
