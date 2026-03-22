import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  LayoutDashboard,
  Target,
  ArrowRight,
  Upload,
  Sparkles,
  ChevronLeft,
  PenTool,
  Download,
  Mail,
  Briefcase,
  Layers,
  Wand2,
  Send,
  Clock,
  FileSearch,
  Brain,
  BookOpen
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Toast from "@/components/ui/toast";

// --- Reusable Interactive Glass Card Component ---
const GlassCard = ({ card, idx, isHovered, onHover, onLeave, onClick }) => {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
    onLeave();
  };

  // Unified Brand Theme (#2369EB) calibrated for a white background
  const theme = {
    text: 'text-[#2369EB]',
    bg: 'bg-[#2369EB]',
    bgSubtle: 'bg-[#2369EB]/10',
    border: 'border-[#2369EB]/30',
    shadow: 'shadow-[#2369EB]/15',
    glow: 'rgba(35, 105, 235, 0.08)', // Softened for white background
    ambient: 'bg-[#2369EB]',
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => onHover(idx)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`group relative rounded-3xl p-6 md:p-8 cursor-pointer overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
        animate-[staggerUp_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0
        bg-white border shadow-sm
        ${isHovered ? `border-[#2369EB]/40 shadow-lg ${theme.shadow}` : 'border-slate-200'}
      `}
      style={{ animationDelay: `${idx * 0.15}s` }}
    >
      {/* Interactive Mouse Follow Glow */}
      <div
        className="absolute pointer-events-none rounded-full blur-[50px] transition-opacity duration-300 z-0"
        style={{
          width: '350px',
          height: '350px',
          left: mousePos.x - 175,
          top: mousePos.y - 175,
          background: theme.glow,
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Static Ambient Glow */}
      <div className={`absolute -bottom-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-[0.03] pointer-events-none ${theme.ambient} z-0 transition-all duration-700`} />

      <div className="relative z-10 flex flex-col h-full min-h-[160px]">
        {/* Header (Icon + Title) */}
        <div className="flex items-center gap-4 mb-5">
          <div className={`w-12 h-12 rounded-[0.9rem] flex items-center justify-center transition-colors duration-300 border
            ${isHovered ? `${theme.bg} text-white border-transparent` : `bg-white ${theme.text} border-slate-200`}
          `}>
            <card.icon size={22} className="stroke-[2]" />
          </div>
          <h3 className={`text-xl font-bold tracking-tight transition-colors duration-300
            ${isHovered ? theme.text : 'text-slate-800'}
          `}>
            {card.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-slate-500 text-base leading-relaxed flex-grow font-medium transition-transform duration-500">
          {card.desc}
        </p>

        {/* Animated Arrow Button */}
        <div className={`mt-6 inline-flex items-center justify-between w-full p-3 rounded-xl transition-all duration-500
          ${isHovered ? `${theme.bgSubtle} shadow-sm translate-y-0 opacity-100` : 'bg-transparent translate-y-4 opacity-0'}
        `}>
          <span className={`font-bold text-sm ${theme.text}`}>Launch Tool</span>
          <div className={`w-7 h-7 rounded-full bg-white flex items-center justify-center ${theme.text} transition-transform duration-500 group-hover:translate-x-1 shadow-sm`}>
            <ArrowRight size={14} className="stroke-[3]" />
          </div>
        </div>
      </div>
    </div>
  );
};

function MiniScoreBar({ score = 0 }) {
  const normalizedScore = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>Match Score</span>
        <span className="font-semibold text-[#2369EB]">{normalizedScore}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${normalizedScore}%`,
            background: normalizedScore >= 70 ? "#22c55e" : normalizedScore >= 50 ? "#f59e0b" : "#ef4444",
          }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Cover Letter');
  const [toast, setToast] = useState(null);
  const [skillHistory, setSkillHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const tabsRef = useRef([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    setHistoryLoading(true);
    api("/api/job/history")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.history)) setSkillHistory(data.history.slice(0, 3));
      })
      .catch(() => { })
      .finally(() => setHistoryLoading(false));
  }, [isLoggedIn]);

  const latestAnalysis = skillHistory[0] || null;

  const handleNavigate = (path, message, options = {}) => {
    setToast({ type: "success", message: message || "Redirecting..." });
    setTimeout(() => {
      navigate(path, options);
    }, 500);
  };

  const tabs = ['Cover Letter', 'Cold Mail', 'Resume'];
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeIndex = tabs.indexOf(activeTab);
    const activeElement = tabsRef.current[activeIndex];
    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      });
    }
  }, [activeTab]);

  // Unified the cards to all leverage the same layout and hover mechanics
  const getDashboardCards = () => {
    switch (activeTab) {
      case 'Cover Letter': return [
        { title: 'Open Editor', desc: 'Create and refine a cover letter using AI assistance.', icon: PenTool, action: () => handleNavigate(`/editor?mode=cover-letter`, "Opening Editor...") },
        { title: 'Resume Matching', desc: 'Analyze your resume against job descriptions.', icon: Briefcase, action: () => handleNavigate("/match", "Opening Match tool...", { state: { mode: 'cover-letter' } }) },
        { title: 'Exports', desc: 'Access previously generated documents.', icon: Download, action: () => handleNavigate("/applications", "Opening Exports...") }
      ];
      case 'Cold Mail': return [
        { title: 'Email Editor', desc: 'Draft personalized cold outreach emails with AI.', icon: Mail, action: () => handleNavigate(`/editor?mode=cold-mail`, "Opening Email Editor...") },
        { title: 'Contact Match', desc: 'Analyze job roles to tailor your email tone.', icon: Target, action: () => handleNavigate("/match", "Opening Match tool...", { state: { mode: 'cold-mail' } }) },
        { title: 'Saved Drafts', desc: 'Access your previous email templates.', icon: FileText, action: () => handleNavigate("/applications", "Opening Saved Drafts...") }
      ];
      case 'Resume': return [
        { title: 'Resume Builder', desc: 'Create a new ATS-friendly resume from scratch.', icon: Layers, action: () => handleNavigate(`/editor?mode=resume`, "Opening Resume Builder...") },
        { title: 'ATS Scanner', desc: 'Score your resume against a target job description.', icon: FileSearch, action: () => handleNavigate("/match", "Opening ATS Scanner...", { state: { mode: 'resume' } }) },
        { title: 'PDF Exports', desc: 'Download your resumes in clean formats.', icon: Download, action: () => handleNavigate("/applications", "Opening PDF Exports...") }
      ];
      default: return [];
    }
  };

  return (
    <main className="flex-1 w-full pt-24 lg:pt-32 pb-20 px-6 lg:px-20 relative z-10 overflow-hidden bg-[#F8FAFC] selection:bg-[#2369EB]/20 selection:text-[#2369EB]">
      {/* Removed mesh overlays for pure white background */}
      <div className="max-w-6xl mx-auto space-y-10 relative z-10">

        {/* Modern Header Layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-[fadeInDown_0.6s_ease-out]">
          <div className="space-y-6">
            <button
              onClick={() => navigate('/')}
              className="group inline-flex items-center gap-2 text-slate-500 hover:text-[#2369EB] transition-colors text-sm font-semibold tracking-wide uppercase"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200 group-hover:border-[#2369EB]/30 group-hover:scale-110 transition-all">
                <ChevronLeft size={16} />
              </div>
              Return Home
            </button>

            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-4">
                Workspace
              </h2>
              <p className="text-slate-500 text-xl font-medium max-w-2xl">
                Design, build, and optimize your application materials with AI.
              </p>
            </div>
          </div>

          {/* Floating Island Tab Indicator */}
          <div className="relative inline-flex p-2 bg-slate-50 rounded-[2rem] border border-slate-200/60 shadow-inner">
            {/* Sliding Pill */}
            <div
              className="absolute top-2 bottom-2 bg-white rounded-full shadow-md border border-slate-100 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
              style={indicatorStyle}
            />

            {tabs.map((tab, idx) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  ref={(el) => (tabsRef.current[idx] = el)}
                  onClick={() => setActiveTab(tab)}
                  className={`relative z-10 px-8 py-3 font-bold text-sm transition-colors duration-300 rounded-full
                    ${isActive ? 'text-[#2369EB]' : 'text-slate-500 hover:text-slate-800'}
                  `}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skill Gap Analysis Section */}
        {isLoggedIn && (
          <div className="animate-[fadeInDown_0.7s_ease-out]">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Brain size={22} className="text-[#2369EB]" />
                Skill Gap Analysis
              </h2>
              <button
                onClick={() => navigate("/match")}
                className="px-5 py-2 text-sm font-semibold text-[#2369EB] bg-white border border-[#2369EB]/20 rounded-xl hover:bg-[#2369EB]/5 hover:border-[#2369EB]/40 transition-all shadow-sm"
              >
                Run New Analysis
              </button>
            </div>

            {historyLoading && (
              <p className="text-slate-500 text-sm">Loading analysis history…</p>
            )}

            {!historyLoading && !latestAnalysis && (
              <div
                onClick={() => navigate("/match")}
                className="w-full border border-dashed border-[#2369EB]/40 bg-white/40 backdrop-blur-xl rounded-[2rem] p-12 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-white/70 cursor-pointer"
              >
                <Target size={36} className="text-[#2369EB] mb-4 stroke-[1.5]" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">No analysis yet</h3>
                <p className="text-slate-500 text-sm font-medium">
                  Click Analyze Match to see your skill gap report here.
                </p>
              </div>
            )}

            {!historyLoading && latestAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Latest Score */}
                <div className="p-6 rounded-2xl bg-white border border-blue-100 shadow-md">
                  <div className="pb-2">
                    <h4 className="text-sm text-slate-500 font-medium">Latest Match</h4>
                  </div>
                  <div className="space-y-3">
                    <MiniScoreBar score={latestAnalysis.matchScore} />
                    {latestAnalysis.job && (
                      <div className="text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{latestAnalysis.job.title || "Role"}</span>
                        {latestAnalysis.job.company ? ` @ ${latestAnalysis.job.company}` : ""}
                      </div>
                    )}
                    <button
                      className="w-full bg-[#2369EB] text-white text-xs py-2 px-4 rounded-lg hover:bg-[#1c55c0] transition-colors"
                      onClick={() => navigate("/match")}
                    >
                      Improve Match →
                    </button>
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="pb-2">
                    <h4 className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                      <Target size={14} className="text-red-400" /> Missing Skills
                    </h4>
                  </div>
                  <div className="space-y-1.5">
                    {latestAnalysis.missingSkills?.length > 0 ? (
                      latestAnalysis.missingSkills.slice(0, 5).map((skill, index) => (
                        <div key={`${skill}-${index}`} className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="text-red-400">✕</span>
                          <span>{typeof skill === 'object' ? JSON.stringify(skill) : skill}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic text-xs">No gaps detected</p>
                    )}
                  </div>
                </div>

                {/* Learning Path */}
                <div className="p-6 rounded-2xl bg-white border border-emerald-100 bg-emerald-50/40 shadow-sm">
                  <div className="pb-2">
                    <h4 className="text-sm text-emerald-700 font-medium flex items-center gap-1.5">
                      <BookOpen size={14} /> Learning Path
                    </h4>
                  </div>
                  <div className="space-y-1.5">
                    {latestAnalysis.learningPlan?.length > 0 ? (
                      latestAnalysis.learningPlan.slice(0, 3).map((item, index) => (
                        <div key={`${item}-${index}`} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <span className="text-emerald-600 font-bold mt-0.5">•</span>
                          <span className="leading-snug">{typeof item === 'object' ? item.action || JSON.stringify(item) : item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic text-xs">Run a match to get learning recommendations.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Cards Grid - Bento Layout Styling */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10"
          key={activeTab} // Forces re-mount for animation
        >
          {getDashboardCards().map((card, idx) => (
            <GlassCard
              key={idx}
              idx={idx}
              card={card}
              isHovered={hoveredIdx === idx}
              onHover={setHoveredIdx}
              onLeave={() => setHoveredIdx(null)}
              onClick={card.action}
            />
          ))}
        </div>

      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes staggerUp {
          from { opacity: 0; transform: translateY(50px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes revealLetter {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes drift {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        .animate-drift { animation: drift 20s ease-in-out infinite alternate; }
        .animate-pulse-slow { animation: pulseSlow 8s ease-in-out infinite; }
        
        .letter-anim {
          display: inline-block;
          opacity: 0;
          animation: revealLetter 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}} />
    </main>
  );
}
