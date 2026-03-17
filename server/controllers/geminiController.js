const { GoogleGenAI, Type } = require("@google/genai");

const cleanJSON = (text) => {
  if (!text) return "{}";
  let clean = text.replace(/```json\s*/g, "").replace(/```\s*$/g, "");
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start !== -1 && end !== -1) clean = clean.substring(start, end + 1);
  return clean.trim();
};



const fetchYouTubeVideoIds = async (query, count = 2) => {
  try {
    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: count,
      key: process.env.YOUTUBE_API_KEY,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    const data = await res.json();
    const ids = data.items?.map(item => item.id?.videoId).filter(Boolean) || [];
    return ids;
  } catch (err) {
    console.error("YouTube API error:", err);
    return [];
  }
};

exports.generateSyllabus = async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ message: "Topic is required" });
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an elite academic curriculum architect. Create a syllabus for "${topic}". Generate 8-10 specific technical module titles.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            chapters: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["title", "description", "chapters"],
        },
      },
    });
    const data = JSON.parse(cleanJSON(response.text || "{}"));
    const chapters = Array.isArray(data?.chapters) && data.chapters.length > 0
      ? data.chapters : ["Core Principles", "Implementation", "Advanced Applications"];
    const courseId = crypto.randomUUID();
    res.json({
      id: courseId,
      title: data?.title || `Mastery of ${topic}`,
      description: data?.description || `A curriculum on ${topic}.`,
      totalChapters: chapters.length,
      completedChapters: 0,
      createdAt: new Date(),
      chapters: chapters.map((title, index) => ({
        id: `${courseId}-ch-${index}`,
        title, order: index + 1, isCompleted: false,
        content_md: "", videoId_1: "", videoId_2: "", external_links: [], quiz: [],
      })),
    });
  } catch (error) {
    console.error("Syllabus Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.generateChapter = async (req, res) => {
  const { chapterTitle, courseTopic } = req.body;
  if (!chapterTitle || !courseTopic)
    return res.status(400).json({ message: "chapterTitle and courseTopic are required" });
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate educational content for "${chapterTitle}" from course "${courseTopic}". Include rich HTML content, 5 quiz questions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content_md: { type: Type.STRING },
            quiz: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.INTEGER }, explanation: { type: Type.STRING } } } },
            external_links: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, url: { type: Type.STRING }, type: { type: Type.STRING } } } },
            },
        },
      },
    });
    const data = JSON.parse(cleanJSON(response.text || "{}"));
    const searchQuery = `${courseTopic} ${chapterTitle} tutorial`;
const youtubeIds = await fetchYouTubeVideoIds(searchQuery, 2);
res.json({
  content_md: data.content_md || "## Content Unavailable",
  quiz: Array.isArray(data.quiz) ? data.quiz : [],
  external_links: Array.isArray(data.external_links) ? data.external_links : [],
  videoId_1: youtubeIds[0] || "",
  videoId_2: youtubeIds[1] || "",
});

  } catch (error) {
    console.error("Chapter Error:", error);
    res.status(500).json({ message: error.message });
  }
};