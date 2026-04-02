
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { marked } from 'marked';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Play, CheckCircle, Brain,
  ChevronRight, Sparkles, LayoutGrid,
  Video, FileText, MonitorPlay, List, Star, MessageCircle,
  GraduationCap, LogOut, User as UserIcon, Bot, Plus, Trash2, ArrowLeft, ExternalLink as ExternalLinkIcon, Loader2, GripHorizontal,
  Image as ImageIcon, Upload, Maximize2, Minimize2, ArrowRight, AlertCircle, RefreshCcw,
  Search, ArrowUpDown, X as XIcon, ChevronDown
} from 'lucide-react';
import { GlassCard } from './components/GlassCard';
import { AuthPage } from './components/AuthPage';
import ChatBot from './components/ChatBot';
import { generateCourseSyllabus, generateChapterContent } from './services/geminiService';
import { fetchMyCourses, enrollCourse, hideCourse, updateChapterProgress, saveChapterContent } from './services/courseService';
import { Course, Chapter, UserReview, UserProfile, AIStudio, ExternalLink, QuizQuestion } from './types';

// Extend the global Window interface for third-party scripts and platform-injected objects.
declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
    // Fix: Use any and optionality for aistudio to resolve conflicts with platform-injected global declarations
    // Update: Corrected to use the AIStudio interface type.
    aistudio?: AIStudio;
  }
}

// --- Components ---

const Navbar = ({
  user,
  onHome,
  onSignIn,
  onSignOut
}: {
  user: UserProfile | null,
  onHome: () => void,
  onSignIn: () => void,
  onSignOut: () => void
}) => (
  <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/5">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onHome}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Bot className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight">AI Course <span className="text-blue-400">Studio</span></span>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">{user.name}</p>
              <p className="text-xs text-indigo-400">Pro Tier</p>
            </div>
            <button
              onClick={onSignOut}
              className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
              title="Sign Out"
            >
              {user.avatar}
            </button>
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold transition-all shadow-lg shadow-indigo-900/20"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  </nav>
);

const LandingPage = ({ onStart }: { onStart: () => void }) => {
  const heroTextRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.gsap.from(heroTextRef.current, { y: 100, opacity: 0, duration: 1.2, ease: "power4.out", delay: 0.2 });
      if (cardsRef.current) {
        window.gsap.from(cardsRef.current.children, {
          scrollTrigger: { trigger: cardsRef.current, start: "top 85%" },
          y: 80, opacity: 0, duration: 1, stagger: 0.15, ease: "elastic.out(1, 0.75)"
        });
      }
    }
  }, []);

  const reviews: UserReview[] = [
    { id: '1', name: "Aarav Patel", role: "CS Senior, IIT Kharagpur", avatar: "AP", content: "The depth of the generated courses rivals my actual university lectures. The dual-video approach clarifies complex algorithms perfectly.", rating: 5 },
    { id: '2', name: "Priya Sharma", role: "M.Tech, IIT Bombay", avatar: "PS", content: "I used this to fast-track my understanding of Distributed Systems. The smart notes saved me hours of documentation reading.", rating: 5 },
    { id: '3', name: "Rohan Das", role: "SDE II @ Google (Ex-IITD)", avatar: "RD", content: "Finally, an AI that understands context. The quizzes aren't just memory tests; they actually test your reasoning.", rating: 5 },
    { id: '4', name: "Sarah Jenkins", role: "Product Manager, Netflix", avatar: "SJ", content: "I needed to understand high-level system architecture quickly. This tool broke it down into digestible pieces without oversimplifying.", rating: 5 },
    { id: '5', name: "David Chen", role: "Self-Taught Developer", avatar: "DC", content: "The generated roadmaps are insane. It literally built a 4-week curriculum for me to learn Rust from scratch.", rating: 5 },
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-32 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -z-10" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-400 mb-8 backdrop-blur-md tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Learning Architecture</span>
        </div>
        <h1 ref={heroTextRef} className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1]">
          Master Any Skill <br />
          <span className="text-gradient">With AI Precision.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Generate professional curriculums instantly. Deep-dive into specific sub-topics with dual-perspective video learning and adaptive reasoning evaluation.
        </p>
        <button
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-black text-white transition-all duration-200 bg-indigo-600 rounded-2xl hover:bg-indigo-500 shadow-2xl shadow-indigo-900/40"
        >
          Begin Learning Journey
          <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
        </button>
      </div>

      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
        {[
          { icon: Video, title: "Dual-Source Intelligence", desc: "Every module features two distinct human perspectives, ensuring comprehensive grasp of complex topics." },
          { icon: Brain, title: "Reasoning Evaluation", desc: "Adaptive quizzes don't just test memory; they evaluate your ability to apply logic and theory." },
          { icon: LayoutGrid, title: "Deep-Dive Roadmap", desc: "Visual diagrammatic roadmaps break down topics into highly specific, technical milestones." }
        ].map((feature, i) => (
          <GlassCard key={i} className="h-full border-indigo-500/10" hoverEffect>
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center mb-6 border border-indigo-500/20">
              <feature.icon className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-xl font-black mb-3 text-white uppercase tracking-tight">{feature.title}</h3>
            <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
          </GlassCard>
        ))}
      </div>

      <div className="mb-32 relative w-full left-1/2 -translate-x-1/2 max-w-[100vw]">
        <h2 className="text-4xl font-black text-center mb-16">Trusted by Top Achievers</h2>
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none" />
        <div className="overflow-hidden flex">
          <motion.div className="flex gap-8 w-max px-8" animate={{ x: "-50%" }} transition={{ duration: 60, ease: "linear", repeat: Infinity }}>
            {[...reviews, ...reviews].map((review, i) => (
              <GlassCard key={`${review.id}-${i}`} className="w-[450px] shrink-0" hoverEffect>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-lg">{review.avatar}</div>
                  <div>
                    <h4 className="font-bold text-lg">{review.name}</h4>
                    <p className="text-sm text-indigo-300">{review.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-400 text-md italic">"{review.content}"</p>
              </GlassCard>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-black text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "How does the AI generate such specific courses?", a: "We use Google's advanced Gemini models with highly-specific instructions (prompts) that guide the AI to think like a university curriculum designer, avoiding generic topics." },
            { q: "Are the videos AI-generated?", a: "No. We believe in expert human instruction. The AI acts as a curator, finding the best existing YouTube tutorials from top educators for each specific chapter." },
            { q: "Can I create a course on a non-technical subject?", a: "Absolutely. The AI is trained to differentiate between technical and general topics. For subjects like history or art, it will focus on narratives, case studies, and timelines instead of code." },
            { q: "Is this free to use?", a: "The platform is currently in a public beta. We are gathering feedback on our dual-source instructional engine and deep-dive curriculum generation." }
          ].map((item, i) => (
            <GlassCard key={i}><h3 className="font-bold text-lg mb-2 text-indigo-300">{item.q}</h3><p className="text-gray-400 leading-relaxed">{item.a}</p></GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

type SortOption = 'newest' | 'oldest' | 'progress-high' | 'progress-low' | 'a-z' | 'z-a';
type ProgressFilter = 'all' | 'not-started' | 'in-progress' | 'completed';
const SORT_LABELS: Record<SortOption, string> = { 'newest': 'Newest First', 'oldest': 'Oldest First', 'progress-high': 'Most Progress', 'progress-low': 'Least Progress', 'a-z': 'A \u2192 Z', 'z-a': 'Z \u2192 A' };
const SORT_KEYS: SortOption[] = ['newest','oldest','progress-high','progress-low','a-z','z-a'];
const FILTER_KEYS: ProgressFilter[] = ['all','not-started','in-progress','completed'];
const FILTER_LABELS: Record<ProgressFilter, string> = { 'all': 'All Paths', 'not-started': 'Not Started', 'in-progress': 'In Progress', 'completed': 'Completed' };

const getProgress = (c: Course) => c.totalChapters > 0 ? Math.round((c.completedChapters / c.totalChapters) * 100) : 0;

const Dashboard = ({ courses, onCreateNew, onSelectCourse, onHideCourse }: {
  courses: Course[],
  onCreateNew: () => void,
  onSelectCourse: (c: Course) => void,
  onHideCourse: (id: string) => void
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>('all');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredAndSorted = useMemo(() => {
    let r = [...courses];
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase().trim(); r = r.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)); }
    r = r.filter(c => { const p = getProgress(c); if (progressFilter === 'not-started') return p === 0; if (progressFilter === 'in-progress') return p > 0 && p < 100; if (progressFilter === 'completed') return p === 100; return true; });
    r.sort((a, b) => { const pA = getProgress(a), pB = getProgress(b); switch (sortBy) { case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); case 'progress-high': return pB - pA; case 'progress-low': return pA - pB; case 'a-z': return a.title.localeCompare(b.title); case 'z-a': return b.title.localeCompare(a.title); default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); } });
    return r;
  }, [courses, searchQuery, sortBy, progressFilter]);

  const hasFilters = !!(searchQuery.trim()) || progressFilter !== 'all' || sortBy !== 'newest';
  const clearAll = () => { setSearchQuery(''); setSortBy('newest'); setProgressFilter('all'); };
  const filterIcons: Record<ProgressFilter, React.ReactNode> = { 'all': <LayoutGrid className="w-3.5 h-3.5" />, 'not-started': <BookOpen className="w-3.5 h-3.5" />, 'in-progress': <Play className="w-3.5 h-3.5" />, 'completed': <CheckCircle className="w-3.5 h-3.5" /> };

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
        <div>
          <h2 className="text-4xl font-black mb-2">My Learning Paths</h2>
          <p className="text-gray-500 font-medium">Active masterclass curriculums in progress.</p>
        </div>
        <button onClick={onCreateNew} className="bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl shadow-white/10 shrink-0">
          <Sparkles className="w-4 h-4" /> New Journey
        </button>
      </div>

      {courses.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search courses by title or description..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-12 pr-10 py-3.5 text-sm font-medium text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all" id="dashboard-search" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"><XIcon className="w-4 h-4" /></button>}
            </div>
            <div className="relative" ref={sortRef}>
              <button onClick={() => setShowSortDropdown(!showSortDropdown)} className={`flex items-center gap-2.5 px-5 py-3.5 rounded-xl border text-sm font-bold transition-all whitespace-nowrap ${sortBy !== 'newest' ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-300' : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:text-white hover:border-white/20'}`} id="dashboard-sort">
                <ArrowUpDown className="w-4 h-4" />{SORT_LABELS[sortBy]}<ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }} className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 rounded-xl border border-white/10 bg-[#0c0e1a]/95 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden">
                    {SORT_KEYS.map(k => <button key={k} onClick={() => { setSortBy(k); setShowSortDropdown(false); }} className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${sortBy === k ? 'bg-indigo-600/15 text-indigo-300' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>{SORT_LABELS[k]}{sortBy === k && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}</button>)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_KEYS.map(f => {
              const active = progressFilter === f;
              const count = f === 'all' ? courses.length : courses.filter(c => { const p = getProgress(c); if (f === 'not-started') return p === 0; if (f === 'in-progress') return p > 0 && p < 100; if (f === 'completed') return p === 100; return true; }).length;
              return <button key={f} onClick={() => setProgressFilter(f)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${active ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-300 shadow-lg shadow-indigo-900/10' : 'bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/15'}`}>{filterIcons[f]}{FILTER_LABELS[f]}<span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-black ${active ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-gray-600'}`}>{count}</span></button>;
            })}
            {hasFilters && <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={clearAll} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400/80 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all ml-1"><XIcon className="w-3.5 h-3.5" />Clear filters</motion.button>}
          </div>
          {(searchQuery.trim() || progressFilter !== 'all') && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-gray-600 uppercase tracking-widest">Showing {filteredAndSorted.length} of {courses.length} course{courses.length !== 1 ? 's' : ''}{searchQuery.trim() && <span className="text-indigo-400"> matching "{searchQuery.trim()}"</span>}</motion.p>}
        </motion.div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-32 opacity-20 border-2 border-dashed border-white/5 rounded-3xl">
          <Bot className="w-24 h-24 mx-auto mb-6 text-gray-500" />
          <p className="text-2xl font-black tracking-widest">NO ACTIVE PATHS FOUND</p>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24 border-2 border-dashed border-white/5 rounded-3xl">
          <Search className="w-16 h-16 mx-auto mb-6 text-gray-700" />
          <p className="text-xl font-black tracking-wider text-gray-600 mb-2">No matching courses found</p>
          <p className="text-sm text-gray-700 font-medium mb-6">Try adjusting your search or filters</p>
          <button onClick={clearAll} className="px-6 py-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-600/20 transition-all">Clear All Filters</button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSorted.map(course => {
            const progress = getProgress(course);
            return (
              <motion.div key={(course as any)._id || course.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <GlassCard onClick={() => onSelectCourse(course)} hoverEffect className="h-72 flex flex-col justify-between cursor-pointer relative overflow-hidden group border-white/5">
                  <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onHideCourse((course as any)._id || course.id); }} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/40 transition-colors backdrop-blur-md" title="Hide Course"><Trash2 className="w-5 h-5" /></button>
                  </div>
                  {course.coverImage && (<><div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110 opacity-30" style={{ background: course.coverImage.startsWith('linear') ? course.coverImage : `url(${course.coverImage}) center/cover no-repeat` }} /><div className="absolute inset-0 z-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" /></>)}
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <span className="text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase mb-4 block">Certified Curriculum</span>
                      <h3 className="text-2xl font-black mb-2 line-clamp-2 leading-tight">{course.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2 font-medium italic">"{course.description}"</p>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-black mb-2 text-gray-500 tracking-widest uppercase"><span>MASTERY PROGRESS</span><span>{progress}%</span></div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5, ease: "easeOut" }} /></div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

type CreatorStep = 'input' | 'generating' | 'review';

const CourseCreator = ({ onGenerate, onClose }: { onGenerate: (course: Course) => void, onClose: () => void }) => {
  const [step, setStep] = useState<CreatorStep>('input');
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("Analyzing request...");
  const [draftCourse, setDraftCourse] = useState<Partial<Course> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'generating') {
      const msgs = ["Consulting Gemini AI...", "Architecting Syllabus...", "Validating Modules...", "Finalizing Deep-Dive Path..."];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingMsg(msgs[i % msgs.length]);
        i++;
      }, 1800);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setError(null);
    setStep('generating');
    try {
      const courseData = await generateCourseSyllabus(topic);
      setDraftCourse(courseData);
      setStep('review');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please check your API key configuration.");
      setStep('input');
    }
  };

  const handleUpdateChapter = (idx: number, newVal: string) => {
    if (!draftCourse?.chapters) return;
    const newChapters = [...draftCourse.chapters];
    newChapters[idx] = { ...newChapters[idx], title: newVal };
    setDraftCourse({ ...draftCourse, chapters: newChapters });
  };

  const handleAddChapter = () => {
    if (!draftCourse?.chapters) return;
    const newChapter: Chapter = {
      id: `new-${Date.now()}`, title: "New Specialized Module", order: draftCourse.chapters.length + 1,
      isCompleted: false, content_md: "", videoId_1: "", videoId_2: "", external_links: [], quiz: []
    };
    setDraftCourse({ ...draftCourse, chapters: [...draftCourse.chapters, newChapter] });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4">
      <GlassCard className="w-full max-w-4xl p-0 overflow-hidden flex flex-col max-h-[95vh] border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all"><ArrowLeft className="w-5 h-5 text-gray-500" /></button>
          <h2 className="text-xs font-black tracking-[0.4em] uppercase text-indigo-400">Roadmap Architect</h2>
          <div className="w-11" />
        </div>

        <div className="flex-1 overflow-y-auto relative bg-[#01030d]">
          {step === 'input' && (
            <div className="p-12 flex flex-col items-center justify-center h-full min-h-[400px]">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full max-w-lg">
                <h1 className="text-4xl font-black mb-4 leading-tight">What do you want to master today?</h1>
                <p className="text-gray-500 font-medium mb-12">Enter any niche topic and we'll generate a university-grade specific curriculum.</p>
                {error && (
                  <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4 text-left">
                    <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                    <div><p className="text-red-400 font-bold text-sm mb-1">Generation Failed</p><p className="text-red-400/70 text-xs leading-relaxed">{error}</p></div>
                  </div>
                )}
                <form onSubmit={handleGenerate} className="space-y-6">
                  <input autoFocus type="text" placeholder="e.g. LLM Reasoning, Zero-Knowledge Proofs..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-lg font-bold text-white focus:outline-none focus:border-indigo-500 transition-all text-center"
                    value={topic} onChange={(e) => setTopic(e.target.value)}
                  />
                  <button type="submit" disabled={!topic} className="w-full bg-white text-black font-black py-5 rounded-2xl transition-all disabled:opacity-20 flex items-center justify-center gap-3 uppercase tracking-widest text-sm">Generate Technical Path</button>
                </form>
              </motion.div>
            </div>
          )}

          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center h-full py-20 min-h-[400px]">
              <Loader2 className="w-20 h-20 text-indigo-500 animate-spin mb-12" />
              <h3 className="text-2xl font-black mb-4 tracking-tight animate-pulse">{loadingMsg}</h3>
              <p className="text-gray-500 text-sm max-w-xs text-center leading-relaxed">Gemini is synthesizing academic modules and curating instructional assets.</p>
            </div>
          )}

          {step === 'review' && draftCourse?.chapters && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12">
              <div className="text-center mb-16"><h2 className="text-4xl font-black mb-4">{draftCourse.title}</h2><p className="text-gray-400 text-sm font-medium italic">"{draftCourse.description}"</p></div>
              <div className="mb-20 p-8 bg-white/5 rounded-3xl border border-white/10 max-w-3xl mx-auto shadow-2xl">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                  <div className="w-full md:w-56 h-36 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden bg-black shadow-inner relative" style={{ background: draftCourse.coverImage?.startsWith('linear') ? draftCourse.coverImage : `url(${draftCourse.coverImage}) center/cover no-repeat` }}>
                    {!draftCourse.coverImage && <ImageIcon className="w-10 h-10 text-white/10" />}
                  </div>
                  <div className="flex-1 space-y-6 w-full">
                    <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2"><Upload className="w-3.5 h-3.5" /> Upload Custom Art</button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setDraftCourse({ ...draftCourse, coverImage: ev.target?.result as string });
                        reader.readAsDataURL(file);
                      }
                    }} />
                    <div className="flex gap-4">
                      {["linear-gradient(to right, #4f46e5, #9333ea)", "linear-gradient(to right, #2563eb, #06b6d4)", "linear-gradient(to right, #059669, #10b981)"].map((g, i) => <button key={i} className="w-12 h-12 rounded-full border-2 border-transparent hover:border-white transition-all shadow-xl" style={{ background: g }} onClick={() => setDraftCourse({ ...draftCourse, coverImage: g })} />)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative max-w-3xl mx-auto py-12 px-6">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent hidden md:block" />
                <div className="space-y-16 relative">
                  {draftCourse.chapters.map((ch, idx) => (
                    <div key={ch.id} className={`flex flex-col md:flex-row items-center gap-10 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                      <div className="flex-1 w-full">
                        <GlassCard className="p-0 overflow-hidden border-white/5 group hover:border-indigo-500/30 transition-all shadow-2xl"><div className="px-5 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center"><span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">MODULE {idx + 1}</span><button onClick={() => setDraftCourse({ ...draftCourse, chapters: draftCourse.chapters?.filter((_, i) => i !== idx) })} className="text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button></div><div className="p-6"><input className="w-full bg-transparent text-xl font-black text-white focus:outline-none focus:text-indigo-300 transition-colors" value={ch.title} onChange={(e) => handleUpdateChapter(idx, e.target.value)} /></div></GlassCard>
                      </div>
                      <div className="relative flex items-center justify-center shrink-0"><div className="w-12 h-12 rounded-full bg-[#050505] border-4 border-indigo-500 flex items-center justify-center text-sm font-black text-indigo-400 z-10 shadow-[0_0_20px_rgba(99,102,241,0.4)]">{idx + 1}</div><div className={`absolute top-1/2 -translate-y-1/2 w-10 h-[2px] bg-indigo-500/20 hidden md:block ${idx % 2 === 0 ? '-left-10' : '-right-10'}`} /></div>
                      <div className="flex-1 hidden md:block" />
                    </div>
                  ))}
                  <div className="flex justify-center pt-8"><button onClick={handleAddChapter} className="group flex items-center gap-4 px-8 py-5 rounded-3xl bg-white/5 border border-dashed border-white/10 hover:border-indigo-500/30 hover:bg-white/10 transition-all"><Plus className="w-5 h-5 text-indigo-400" /><span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-indigo-300">Add Specialized Chapter</span></button></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {step === 'review' && <div className="p-8 border-t border-white/5 bg-[#01030d] flex gap-4 shrink-0"><button onClick={() => setStep('input')} className="flex-1 py-5 rounded-2xl border border-white/5 hover:bg-white/5 transition-all font-black text-xs uppercase tracking-[0.2em] text-gray-500">Discard Path</button><button onClick={async () => {
          try {
            const savedCourse = await enrollCourse(draftCourse as Course);
            onGenerate(savedCourse);
          } catch (e) {
            console.error(e);
            alert("Error enrolling course");
          }
        }} className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-indigo-900/40 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"><CheckCircle className="w-5 h-5" /> Initialize Curriculum</button></div>}
      </GlassCard>
    </div>
  );
};

const CoursePlayer = ({ course, onBack, onCompleteChapter }: { course: Course, onBack: () => void, onCompleteChapter: (id: string) => void }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [tab, setTab] = useState<'notes' | 'resources' | 'quiz'>('notes');
  const [vSource, setVSource] = useState<'primary' | 'alternative'>('primary');
  const [data, setData] = useState<Record<string, Partial<Chapter>>>({});
  const [loading, setLoading] = useState(false);
  const [height, setHeight] = useState(50);
  const isResizing = useRef(false);

  const activeChapter = course.chapters[activeIdx];
  const chapterDetails = data[activeChapter.id];

  useEffect(() => {
    // Only fetch if we don't already have data for this chapter in the player's local state
    if (activeChapter && !data[activeChapter.id]) {
      // Check if it's already generated and saved in the database
      if (activeChapter.videoId_1 || activeChapter.content_md) {
        setData(prev => ({ ...prev, [activeChapter.id]: activeChapter }));
      } else {
        setLoading(true);
        generateChapterContent(activeChapter.title, course.title)
          .then(res => {
            // Background save to MongoDB so it persists
            const cId = (course as any)._id || course.id;
            if (cId) {
              saveChapterContent(cId, activeChapter.id, res).catch(console.error);
            }
            // Update the local in-memory reference too
            Object.assign(activeChapter, res);
            setData(prev => ({ ...prev, [activeChapter.id]: res }));
          })
          .catch(err => {
            console.error("Effect generation error:", err);
            setData(prev => ({
              ...prev,
              [activeChapter.id]: {
                content_md: "## Loading Error\nFailed to fetch content. Check console for details."
              }
            }));
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [activeChapter?.id, course.title, course.id, data]); // added missing deps

  return (
    <div className="pt-20 h-screen flex flex-col md:flex-row bg-[#010208] overflow-hidden">
      <div className="w-full md:w-80 border-r border-white/5 bg-black/40 flex flex-col h-full overflow-y-auto shrink-0 scrollbar-hide">
        <div className="p-8 border-b border-white/5">
          <button onClick={onBack} className="text-xs font-black text-gray-600 hover:text-white transition-colors uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </button>
          <h2 className="text-lg font-black leading-tight mb-6">{course.title}</h2>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(course.completedChapters / course.totalChapters) * 100}%` }} />
          </div>
        </div>
        <div className="flex-1 pb-10">
          {course.chapters.map((ch, i) => (
            <button key={ch.id} onClick={() => setActiveIdx(i)} className={`w-full text-left px-8 py-5 border-b border-white/5 flex items-center gap-5 transition-all ${i === activeIdx ? 'bg-indigo-600/10 border-l-4 border-l-indigo-500' : 'opacity-40 border-l-4 border-l-transparent'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${ch.isCompleted ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-500'}`}>
                {ch.isCompleted ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{ch.title}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col h-full relative" onMouseMove={(e) => { if (!isResizing.current) return; const h = (e.clientY / window.innerHeight) * 100; if (h > 20 && h < 80) setHeight(h); }} onMouseUp={() => isResizing.current = false}>
        <div style={{ height: `${height}%` }} className="bg-black relative shrink-0 shadow-2xl">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Architecting Educational Assets</p>
            </div>
          ) : (
            <iframe src={`https://www.youtube.com/embed/${vSource === 'primary' ? chapterDetails?.videoId_1 : chapterDetails?.videoId_2}?rel=0`} className="w-full h-full object-contain" allowFullScreen />
          )}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-2xl rounded-2xl p-1.5 flex gap-1.5 border border-white/10">
            <button onClick={() => setVSource('primary')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${vSource === 'primary' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>Perspective A</button>
            <button onClick={() => setVSource('alternative')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${vSource === 'alternative' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>Perspective B</button>
          </div>
        </div>
        <div onMouseDown={() => isResizing.current = true} className="h-1.5 bg-[#0a0a0a] hover:bg-indigo-600/40 cursor-row-resize flex items-center justify-center transition-colors border-y border-white/5">
          <GripHorizontal className="w-4 h-4 text-gray-700" />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-10 border-b border-white/5 bg-black/40 shrink-0 flex gap-10">
            {['notes', 'resources', 'quiz'].map(t => (
              <button key={t} onClick={() => setTab(t as any)} className={`py-6 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${tab === t ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-600'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
            <AnimatePresence mode="wait">
              {tab === 'notes' && (
                <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto prose-custom">
                  {loading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-8 bg-white/5 rounded w-3/4" />
                      <div className="h-4 bg-white/5 rounded w-full" />
                      <div className="h-4 bg-white/5 rounded w-5/6" />
                    </div>
                  ) : (
                    <div className="prose-custom" dangerouslySetInnerHTML={{ __html: marked.parse(chapterDetails?.content_md || "") as string }} />
                  )}
                </motion.div>
              )}
              {tab === 'resources' && (
                <motion.div key="resources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                  {chapterDetails?.external_links?.map((link: ExternalLink, i: number) => (
                    <GlassCard key={i} className="hover:border-indigo-500/50 flex flex-col justify-between">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                        <h4 className="font-bold mb-2">{link.title}</h4>
                        <p className="text-xs text-indigo-400 uppercase tracking-widest">{link.type}</p>
                      </a>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-white transition-colors mt-4 pt-2 border-t border-white/5 flex items-center justify-between">
                        Visit <ArrowRight className="w-4 h-4" />
                      </a>
                    </GlassCard>
                  ))}
                </motion.div>
              )}
              {tab === 'quiz' && (
                <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-10 pb-20">
                  {chapterDetails?.quiz?.map((q: QuizQuestion, i: number) => (
                    <GlassCard key={i} className="border-l-4 border-l-indigo-500">
                      <h4 className="font-bold text-lg mb-8 leading-relaxed"><span className="text-indigo-400 font-black mr-4">Q{i + 1}</span>{q.question}</h4>
                      <div className="grid gap-3">
                        {q.options.map((o, oi) => (
                          <button
                            key={oi}
                            className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-sm font-medium"
                            onClick={e => {
                              const b = e.currentTarget;
                              b.parentElement?.querySelectorAll('button').forEach(btn => {
                                btn.classList.remove("bg-emerald-500/10", "border-emerald-500", "text-emerald-300", "bg-red-500/10", "border-red-500", "text-red-300");
                              });
                              if (oi === q.correctAnswer) b.classList.add("bg-emerald-500/10", "border-emerald-500", "text-emerald-300");
                              else b.classList.add("bg-red-500/10", "border-red-500", "text-red-300");
                            }}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                      <details className="mt-6 group">
                        <summary className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white cursor-pointer list-none flex items-center gap-2">Reveal AI Explanation</summary>
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-300 text-sm leading-relaxed">
                          {q.explanation}
                        </motion.div>
                      </details>
                    </GlassCard>
                  ))}
                  {!activeChapter.isCompleted && (
                    <div className="flex justify-center pt-8">
                      <button onClick={() => onCompleteChapter(activeChapter.id)} className="px-10 py-5 bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all hover:scale-105">
                        Verify Mastery & Complete
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard' | 'course' | 'verified'>('landing');
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Helper: decode JWT payload to extract user info
  const decodeToken = (token: string): { id: string; name: string } | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.id || payload._id || 'u1', name: payload.name || 'Scholar' };
    } catch {
      return null;
    }
  };

  // Handle email verification redirect from backend
  useEffect(() => {
    // Handle email verification
    if (window.location.pathname === '/verified') {
      setView('verified');
      window.history.replaceState({}, '', '/');
      return;
    }


    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get('token');
    if (googleToken) {
      handleLogin(googleToken);
      window.history.replaceState({}, '', '/');
    }
  }, []);
  // Auto-login from stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      const decoded = decodeToken(storedToken);
      if (decoded) {
        const initials = decoded.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        setUser({ id: decoded.id, name: decoded.name, email: '', avatar: initials });
        setView('dashboard');
      }
    }
  }, []);

  useEffect(() => {
    if (user && view === 'dashboard') {
      fetchMyCourses().then(c => setCourses(c)).catch(console.error);
    }
  }, [user, view]);

  const handleLogin = async (token: string) => {
    localStorage.setItem('authToken', token);
    const decoded = decodeToken(token);
    const userName = decoded?.name || 'Scholar';
    const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    setUser({ id: decoded?.id || 'u1', name: userName, email: '', avatar: initials });
    setView('dashboard');
  };

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setView('landing');
  };

  return (
    <div className="min-h-screen text-white font-sans bg-[#010208]">
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="orb w-[800px] h-[800px] bg-indigo-900/10 top-[-300px] left-[-300px] animate-pulse" />
        <div className="orb w-[600px] h-[600px] bg-purple-900/10 bottom-[-200px] right-[-200px] animate-pulse" style={{ animationDelay: '5s' }} />
      </div>
      {view !== 'auth' && view !== 'course' && <Navbar user={user} onHome={() => setView('landing')} onSignIn={() => setView('auth')} onSignOut={handleSignOut} />}
      {view === 'landing' && <LandingPage onStart={() => user ? setView('dashboard') : setView('auth')} />}
      {view === 'auth' && <AuthPage onLogin={handleLogin} />}
      {view === 'verified' && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-6 px-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-black">Email Verified! 🎉</h2>
            <p className="text-gray-400">Your account is now active. You can sign in.</p>
            <button
              onClick={() => setView('auth')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
            >
              Sign In Now
            </button>
          </div>
        </div>
      )}
      {view === 'dashboard' && <Dashboard courses={courses} onCreateNew={() => setShowCreator(true)} onHideCourse={async (id) => {
        try {
          await hideCourse(id);
          setCourses(courses.filter((c: any) => (c._id || c.id) !== id));
        } catch (e) { console.error(e); alert("Failed to hide"); }
      }} onSelectCourse={(c) => { setActiveCourse(c); setView('course'); }} />}
      {view === 'course' && activeCourse && <CoursePlayer course={activeCourse} onBack={() => { setView('dashboard'); fetchMyCourses().then(setCourses).catch(console.error); }} onCompleteChapter={async (id) => {
        try {
          const updatedCourse = await updateChapterProgress((activeCourse as any)._id || activeCourse.id, id);
          setActiveCourse(updatedCourse);
          setCourses(courses.map((c: any) => (c._id || c.id) === (updatedCourse as any)._id ? updatedCourse : c));
        } catch (e) {
          console.error(e);
          // Fallback static update if server fails, though rarely recommended
          const updated = activeCourse.chapters.map(c => c.id === id ? { ...c, isCompleted: true } : c);
          const nc = { ...activeCourse, chapters: updated, completedChapters: updated.filter(u => u.isCompleted).length };
          setActiveCourse(nc);
          setCourses(courses.map((c: any) => (c._id || c.id) === (nc as any)._id ? nc : c));
        }
      }} />}
      {showCreator && <CourseCreator onClose={() => setShowCreator(false)} onGenerate={(c) => { setCourses([c, ...courses]); setShowCreator(false); }} />}
      {view !== 'auth' && <ChatBot />}
    </div>
  );
}
