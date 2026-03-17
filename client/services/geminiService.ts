import { Course, Chapter } from "../types";

const API_BASE = "http://localhost:5000";

export const generateCourseSyllabus = async (topic: string): Promise<Partial<Course>> => {
  const res = await fetch(`${API_BASE}/api/gemini/syllabus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  if (!res.ok) throw new Error("Failed to generate syllabus");
  return res.json();
};

export const generateChapterContent = async (
  chapterTitle: string,
  courseTopic: string
): Promise<Partial<Chapter>> => {
  const res = await fetch(`${API_BASE}/api/gemini/chapter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chapterTitle, courseTopic }),
  });
  if (!res.ok) throw new Error("Failed to generate chapter");
  return res.json();
};