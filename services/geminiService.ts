
import { GoogleGenAI, Type } from "@google/genai";
import { Course, Chapter, QuizQuestion, ExternalLink } from "../types";

const PRIMARY_MODEL = "gemini-flash-latest"; 
const FALLBACK_MODEL = "gemini-flash-latest"; // Using the same flash model for consistency and throughput

/**
 * Enhanced helper to extract JSON from model responses.
 * Handles cases where the model wraps JSON in markdown blocks or adds conversational noise.
 */
const cleanJSON = (text: string) => {
  if (!text) return "{}";
  // Remove markdown code blocks if present
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
  // Find the first '{' and last '}' to strip any leading/trailing text
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    clean = clean.substring(start, end + 1);
  }
  return clean.trim();
};

const extractYouTubeID = (urlOrId: string | undefined): string | null => {
    if (!urlOrId) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlOrId.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const getFallbackVideoId = (query: string): string => {
  const genericPool = ["pQN-pnXPaVg", "kUmC1P588e0", "W6NZfCO5SIk", "8ndxrZz4F_Y", "QFaFIcGhPoM"];
  const index = Math.abs(query.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % genericPool.length;
  return genericPool[index];
};

const generateWithFallback = async (ai: GoogleGenAI, prompt: string, schema: any = null) => {
  const config: any = { 
    responseMimeType: "application/json",
    temperature: 0.7, // Add a bit of creativity but stay grounded
  };
  if (schema) config.responseSchema = schema;

  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: config
    });
    return response;
  } catch (error: any) {
    console.warn(`Primary model failed. Attempting with fallback model ${FALLBACK_MODEL}.`, error);
    try {
      const response = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: prompt,
        config: config
      });
      return response;
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
};

export const generateCourseSyllabus = async (topic: string): Promise<Partial<Course>> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      You are an elite academic curriculum architect.
      Create a high-fidelity syllabus for a masterclass on "${topic}".
      
      **CRITICAL REQUIREMENTS**:
      1. Title: Create a compelling, professional title.
      2. Description: A brief, professional overview.
      3. Chapters: Generate 8-10 hyper-specific technical module titles. Do NOT use generic names like "Introduction" or "Basics".
      4. Ensure the flow is logical from foundational to expert.
    `;

    const response = await generateWithFallback(ai, prompt, {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        chapters: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["title", "description", "chapters"]
    });

    const data = JSON.parse(cleanJSON(response.text || "{}"));
    const chapters = Array.isArray(data?.chapters) && data.chapters.length > 0 ? data.chapters : ["Core Principles", "Implementation Strategies", "Advanced Applications"];
    const courseId = crypto.randomUUID();
    
    return {
      id: courseId,
      title: data?.title || `Mastery of ${topic}`,
      description: data?.description || `An advanced, deep-dive curriculum focused on ${topic}.`,
      totalChapters: chapters.length,
      completedChapters: 0,
      createdAt: new Date(),
      chapters: chapters.map((title: string, index: number) => ({
        id: `${courseId}-ch-${index}`,
        title: title,
        order: index + 1,
        isCompleted: false,
        content_md: "",
        videoId_1: "",
        videoId_2: "",
        external_links: [],
        quiz: []
      }))
    };
  } catch (error: any) {
    console.error("Gemini Syllabus Error:", error);
    throw error;
  }
};

export const generateChapterContent = async (chapterTitle: string, courseTopic: string): Promise<Partial<Chapter>> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      You are a world-class instructional designer and expert mentor. 
      Generate comprehensive, humanized educational materials for the module "${chapterTitle}" from the course "${courseTopic}".

      **INSTRUCTIONAL TONE**:
      - Avoid robotic, list-only content.
      - Speak like a senior industry mentor: insightful, encouraging, and clear.
      - Use transitional phrases to connect ideas naturally.

      **CONTENT STRUCTURE (content_md)**:
      Return rich HTML content that follows this exact pedagogical structure:
      1. **<h2 class="text-gradient">The Core Concept</h2>**: A high-level, humanized introduction to the topic. Explain *why* this matters in the real world.
      2. **<h2 class="text-gradient">Deep Dive Exploration</h2>**: A technical or conceptual breakdown. Use <h3> for sub-headings.
      3. **<h2 class="text-gradient">Practical Application</h2>** (or "Let's Code It" if technical): Hands-on examples, code blocks (if relevant), or case studies.
      4. **<h2 class="text-gradient">Mastery Summary</h2>**: Key takeaways and "pro-tips" from a mentor's perspective.

      **OTHER REQUIREMENTS**:
      - quiz: 5 challenging multiple-choice questions testing logic and reasoning.
      - external_links: 3 valid, reputable links for further reading.
      - videoId_1 & videoId_2: 2 relevant 11-character YouTube IDs.

      You MUST return valid JSON. The "content_md" field should contain the rich HTML described above.
    `;

    const chapterContentSchema = {
      type: Type.OBJECT,
      properties: {
        content_md: { type: Type.STRING, description: "Detailed educational content in Rich HTML with gradient headings" },
        quiz: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER, description: "0-based index of the correct option" },
              explanation: { type: Type.STRING, description: "Why this answer is correct" },
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          },
        },
        external_links: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              url: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["article", "video", "documentation"] },
            },
            required: ["title", "url", "type"]
          },
        },
        videoId_1: { type: Type.STRING, description: "YouTube ID string" },
        videoId_2: { type: Type.STRING, description: "YouTube ID string" },
      },
      required: ["content_md", "quiz", "external_links", "videoId_1", "videoId_2"]
    };

    const response = await generateWithFallback(ai, prompt, chapterContentSchema);
    const data = JSON.parse(cleanJSON(response.text || "{}"));

    let v1 = extractYouTubeID(data.videoId_1) || getFallbackVideoId(`${courseTopic} ${chapterTitle} 1`);
    let v2 = extractYouTubeID(data.videoId_2) || getFallbackVideoId(`${courseTopic} ${chapterTitle} 2`);

    return {
      content_md: data.content_md || "## Content Unavailable\n\nThe AI was unable to generate the full guide for this module. Please refresh to try again.",
      quiz: Array.isArray(data.quiz) ? data.quiz : [],
      external_links: Array.isArray(data.external_links) ? data.external_links : [],
      videoId_1: v1,
      videoId_2: v2
    };
  } catch (error) {
    console.error("Gemini Content Error:", error);
    return { 
      content_md: "## Connection Timeout\n\nThere was an issue reaching the content engine. Ensure your API key is active and refresh the chapter.", 
      quiz: [], 
      external_links: [], 
      videoId_1: "kUmC1P588e0", 
      videoId_2: "pQN-pnXPaVg" 
    };
  }
};
