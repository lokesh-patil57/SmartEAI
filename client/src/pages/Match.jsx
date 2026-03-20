import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api, getProfile, parseResumeFile } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Toast from "@/components/ui/toast";
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
  FileSearch,
  Brain,
  Undo2,
  CheckCircle2,
  Check,
  ArrowLeft,
  Building2,
  UserCircle
} from 'lucide-react';

function ScoreRing({ score = 0 }) {
  const normalizedScore = Math.max(0, Math.min(100, Number(score) || 0));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} stroke="#E2E8F0" strokeWidth="8" fill="none" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#2369EB"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-[#2369EB]">
        {normalizedScore}%
      </div>
    </div>
  );
}

// --- Sleek Input Component ---
const CleanInput = ({ label, placeholder, icon: Icon, delay = "0s", value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0" style={{ animationDelay: delay }}>
      <label className={`block text-[12px] font-bold mb-1.5 transition-colors duration-200 ${isFocused ? 'text-[#2369EB]' : 'text-slate-500'}`}>
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <div className={`absolute left-3 transition-colors duration-200 ${isFocused ? 'text-[#2369EB]' : 'text-slate-400'}`}>
            <Icon size={16} />
          </div>
        )}
        <input
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          type="text"
          value={value}
          onChange={onChange}
          className={`w-full bg-white border outline-none transition-all duration-200 text-[14px] text-slate-800 placeholder:text-slate-300 rounded-lg
            ${Icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5'}
            ${isFocused ? 'border-[#2369EB] ring-4 ring-[#2369EB]/10' : 'border-slate-200 hover:border-slate-300'}
          `}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default function Match() {
  const navigate = useNavigate();
  const location = useLocation();
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState(location.state?.mode || "resume");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [recipientType, setRecipientType] = useState("Recruiter");
  const [tone, setTone] = useState(null);
  const [resumeLoadError, setResumeLoadError] = useState(null);
  const [toast, setToast] = useState(null);
  const [processLoading, setProcessLoading] = useState({ related: false, roadmap: false, insights: false, tone: false });
  const fileInputRef = useRef(null);
  const { isLoggedIn } = useAuth();

  // Base `/api/match` is lightweight; Gemini-powered enrichments are loaded only after the user clicks each process.
  const matchedSkills = result?.atsResult?.matchedSkills || result?.matchedSkills || result?.matched_skills || [];
  const missingSkills = result?.atsResult?.missingSkills || result?.missingSkills || result?.missing_skills || [];
  const relatedSkills = result?.atsResult?.relatedSkills || result?.relatedSkills || result?.related_skills || [];
  const score = result?.atsResult?.score ?? result?.score ?? 0;
  const applicationId = result?.applicationId || result?.atsResult?.applicationId || null;
  const ragSummary = result?.ragInsights?.summary || "";
  const ragSuggestions = result?.ragInsights?.suggestions || [];
  const ragQuickWins = result?.ragInsights?.quickWins || [];
  const suggestions = [...(result?.atsResult?.suggestions || result?.suggestions || []), ...ragSuggestions];
  const learningPlan =
    result?.atsResult?.learningPlan ||
    result?.atsResult?.learning_plan ||
    result?.recommendations?.learningPlan ||
    result?.learningPlan ||
    result?.learning_plan ||
    [];

  const handleUseProfileResume = async () => {
    setResumeLoadError(null);
    if (!isLoggedIn) {
      setResumeLoadError("Sign in to use your saved profile resume.");
      return;
    }
    try {
      const profile = await getProfile();
      if (profile?.resumeText) {
        setResume(profile.resumeText);
      } else {
        setResumeLoadError("No resume saved on your profile. Upload one on the Home page.");
      }
    } catch (err) {
      setResumeLoadError(err.message || "Failed to load profile resume.");
      setToast({ type: "error", message: "Failed to load profile resume." });
    }
  };

  const handleUploadResumeFile = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setResumeLoadError(null);
    try {
      const text = await parseResumeFile(file);
      setResume(text);
    } catch (err) {
      setResumeLoadError(err.message || "Failed to parse file.");
      setToast({ type: "error", message: "Failed to upload file." });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const mergeResult = (patch) => {
    setResult((previous) => ({ ...(previous || {}), ...patch }));
  };

  const runGeminiProcess = async (key, endpoint, successMessage) => {
    if (!resume.trim() || !job.trim()) return;

    setProcessLoading((previous) => ({ ...previous, [key]: true }));
    try {
      const response = await api(endpoint, {
        method: "POST",
        body: JSON.stringify({ resume, job }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI process failed");
      mergeResult(data);
      setToast({ type: "success", message: successMessage });
    } catch (error) {
      setToast({ type: "error", message: error.message || "AI process failed." });
    } finally {
      setProcessLoading((previous) => ({ ...previous, [key]: false }));
    }
  };

  const handleLoadRelatedSkills = () => runGeminiProcess("related", "/api/match/related-skills", "Related skills loaded.");
  const handleLoadLearningPath = () => runGeminiProcess("roadmap", "/api/match/learning-path", "Learning roadmap generated.");
  const handleLoadInsights = () => runGeminiProcess("insights", "/api/match/insights", "AI insights generated.");

  const handleDetectTone = async () => {
    if (!job.trim()) return;

    setProcessLoading((previous) => ({ ...previous, tone: true }));
    try {
      const response = await api("/api/improve/detect-tone", {
        method: "POST",
        body: JSON.stringify({ jobDescription: job }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Tone detection failed");
      setTone(data.tone || null);
      setToast({ type: "success", message: "Tone detected." });
    } catch (error) {
      setToast({ type: "error", message: error.message || "Tone detection failed." });
    } finally {
      setProcessLoading((previous) => ({ ...previous, tone: false }));
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setTone(null);
    try {
      const analyzeRes = await api("/api/match", {
        method: "POST",
        body: JSON.stringify({ resume, job }),
      });
      const data = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(data.error || "Analysis failed");

      setResult(data);
      setProcessLoading({ related: false, roadmap: false, insights: false, tone: false });
      setToast({ type: "success", message: "Base analysis complete. Run AI steps one by one." });
    } catch (error) {
      console.error("Analyze error:", error);
      setResult(null);
      setToast({ type: "error", message: error.message || "Analysis failed." });
    } finally {
      setLoading(false);
    }
  };

  const createTrackedDocument = async ({ title, type, content }) => {
    try {
      const createRes = await api("/api/documents", {
        method: "POST",
        body: JSON.stringify({ title, type, applicationId }),
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData?.id) throw new Error(createData.error || "Document creation failed");

      if (content?.trim()) {
        await api(`/api/documents/${createData.id}/versions`, {
          method: "POST",
          body: JSON.stringify({ content, isOriginal: true }),
        });
      }

      return createData.id;
    } catch (error) {
      console.error("Tracked document creation failed:", error);
      return null;
    }
  };

  const handleGenerateDraft = async () => {
    if (!resume || !job) return;
    if ((mode === "cover-letter" || mode === "cold-mail") && (!role || !company)) {
      setToast({ type: "error", message: "Please enter Role and Company name." });
      return;
    }
    setToast({ type: "info", message: "Generating initial draft..." });
    try {
      let data;
      let res;
      if (mode === "cold-mail") {
        res = await api("/api/improve/draft-cold-mail", {
          method: "POST",
          body: JSON.stringify({ resume, context: job, recipientType, role, company }),
        });
      } else {
        res = await api("/api/improve/draft-cover-letter", {
          method: "POST",
          body: JSON.stringify({ resume, job, tone, role, company, mode }),
        });
      }
      data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      if (data.draft) {
        const documentType = mode === "cold-mail" ? "cold-mail" : "cover-letter";
        const documentTitle = `${role || "Untitled"} ${documentType === "cover-letter" ? "Cover Letter" : "Cold Mail"}`;
        const documentId = await createTrackedDocument({
          title: documentTitle,
          type: documentType,
          content: data.draft,
        });

        navigate(`/editor?mode=${mode}${documentId ? `&documentId=${documentId}` : ""}`, {
          state: {
            fromMatch: true,
            originalContent: data.draft,
            documentId,
            applicationId,
            job: job.trim(),
            suggestions,
            matchScore: score,
            missingSkills,
            matchedSkills,
            relatedSkills,
            detectedTone: tone,
          },
        });
        setToast({ type: "success", message: "Draft generated! Opening editor..." });
      }
    } catch (err) {
      console.error("Generate Draft Error:", err);
      const isRateLimit = err.message.includes("Rate Limit") || err.message.includes("429") || err.message.includes("Quota");
      setToast({
        type: isRateLimit ? "warning" : "error",
        message: isRateLimit ? "AI Limit Reached. Please wait ~1 min." : "Failed to generate draft.",
      });
    }
  };

  useEffect(() => {
    if (location.state?.autoAnalyze) {
      if (location.state.resume) setResume(location.state.resume);
      if (location.state.job) setJob(location.state.job);
      doAutoAnalyze(location.state.resume, location.state.job);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const doAutoAnalyze = async (r, j) => {
    if (!r || !j) return;
    setLoading(true);
    try {
      const response = await api("/api/match", {
        method: "POST",
        body: JSON.stringify({ resume: r, job: j }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      navigate(location.pathname, { replace: true, state: {} });
      setToast({ type: "success", message: "Auto-Analysis complete!" });
    } catch (error) {
      console.error("Auto-Analyze error:", error);
      setResult(null);
      setToast({ type: "error", message: "Auto-Analysis failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToEditor = async () => {
    if (!result) return;
    if (!resume.trim()) {
      alert("Please provide resume content before applying suggestions.");
      return;
    }
    const documentId = await createTrackedDocument({
      title: `${role || "Targeted"} Resume`,
      type: "resume",
      content: resume.trim(),
    });

    navigate(`/editor?mode=${mode}${documentId ? `&documentId=${documentId}` : ""}`, {
      state: {
        fromMatch: true,
        originalContent: resume.trim(),
        documentId,
        applicationId,
        job: job.trim(),
        suggestions,
        matchScore: score,
        missingSkills,
        matchedSkills,
        relatedSkills,
      },
      replace: false,
    });
    setToast({ type: "success", message: "Redirecting to Editor..." });
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 selection:bg-[#2369EB]/20 selection:text-[#2369EB] flex flex-col bg-white" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      <main className="flex-1 w-full bg-[#F8FAFC] min-h-screen pt-24 lg:pt-32 pb-20 px-6 lg:px-20 relative z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-10 relative z-10">

          {/* Header */}
          <div className="mt-3 animate-[fadeInDown_0.5s_ease-out]">
            <div className="flex gap-4 mb-6">

              <button
                onClick={() => navigate('/dashboard')}
                className="group inline-flex items-center gap-2 text-slate-500 hover:text-[#2369EB] transition-colors text-sm font-semibold tracking-wide uppercase"
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200 group-hover:border-[#2369EB]/30 group-hover:scale-110 transition-all">
                  <ChevronLeft size={16} />
                </div>
                Return to Workspace
              </button>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  Resume ↔ Job Matching
                </h2>
                <p className="text-slate-400 mt-4 text-xl font-medium max-w-3xl">Design, build, and optimize your application materials with AI.</p>
              </div>

              <div className="flex gap-3">
                <button
                  disabled={!resume.trim() || !job.trim() || loading}
                  onClick={handleAnalyze}
                  className="bg-[#2369EB] text-white px-8 py-3 rounded-xl text-[14px] font-bold shadow-[0_4px_14px_rgba(35,105,235,0.25)] hover:shadow-[0_6px_20px_rgba(35,105,235,0.4)] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? "Analyzing..." : "Analyze Match"}
                </button>
                <button
                  onClick={() => { setJob(""); setResult(null); }}
                  className="bg-white border border-slate-200 px-8 py-3 rounded-xl text-[14px] font-semibold text-slate-700 hover:border-[#2369EB] transition-all"
                >
                  Start with new job description
                </button>
              </div>
            </div>
          </div>

          {/* Segmented Control */}
          <div className="flex items-center p-1 bg-slate-200/50 rounded-lg w-fit animate-[fadeIn_0.6s_ease-out]">
            {[
              { key: "cover-letter", label: "Cover Letter" },
              { key: "cold-mail", label: "Cold Mail" },
              { key: "resume", label: "Resume" },
            ].map(type => (
              <button
                key={type.key}
                onClick={() => setMode(type.key)}
                className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-200 ${mode === type.key ? 'bg-white text-[#2369EB] shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* ===== RESULTS ===== */}
          {result && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Row 1: Score + Process Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-blue-100 shadow-lg shadow-blue-500/5">
                  <CardHeader><CardTitle>Match Score</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <ScoreRing score={score} />
                    <p className="text-slate-500 text-sm text-center">Overall alignment with the role</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm md:col-span-2">
                  <CardHeader><CardTitle>AI Process Controls</CardTitle></CardHeader>
                  <CardContent className="space-y-4 text-sm text-slate-700">
                    <p className="text-slate-500">
                      Gemini tasks now run only after you click each process. Start with base ATS analysis, then trigger the AI steps you want.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Button type="button" variant="outline" onClick={handleLoadRelatedSkills} disabled={processLoading.related}>
                        {processLoading.related ? "Loading..." : "Find Related Skills"}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleLoadLearningPath} disabled={processLoading.roadmap}>
                        {processLoading.roadmap ? "Loading..." : "Build Learning Roadmap"}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleLoadInsights} disabled={processLoading.insights}>
                        {processLoading.insights ? "Loading..." : "Generate AI Insights"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Row 2: Matched / Missing / Related */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm">
                  <CardHeader><CardTitle>Matched Skills</CardTitle></CardHeader>
                  <CardContent className="text-slate-600 space-y-2 text-sm max-h-64 overflow-auto">
                    {matchedSkills.length > 0 ? (
                      matchedSkills.map((item, index) => (
                        <div key={`${item}-${index}`} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span><span>{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic">No matches found</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader><CardTitle>Missing Skills</CardTitle></CardHeader>
                  <CardContent className="text-slate-600 space-y-2 text-sm max-h-64 overflow-auto">
                    {missingSkills.length > 0 ? (
                      missingSkills.map((item, index) => (
                        <div key={`${item}-${index}`} className="flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">✕</span><span>{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic">No missing skills</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader><CardTitle>Related Skills</CardTitle></CardHeader>
                  <CardContent className="text-slate-600 space-y-2 text-sm max-h-64 overflow-auto">
                    {relatedSkills.length > 0 ? (
                      relatedSkills.map((item, index) => (
                        <div key={`${item}-${index}`} className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">≈</span><span>{item}</span>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-3">
                        <p className="text-slate-400 italic">Click “Find Related Skills” to run this Gemini-powered step.</p>
                        <Button type="button" size="sm" variant="outline" onClick={handleLoadRelatedSkills} disabled={processLoading.related}>
                          {processLoading.related ? "Loading..." : "Find Related Skills"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Row 3: Suggestions + Learning Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-blue-200 bg-blue-50/50 flex flex-col justify-between shadow-md">
                  <CardHeader>
                    <CardTitle className="text-[#2369EB]">Improvement Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 text-slate-700 text-sm leading-relaxed">
                    {ragSummary && (
                      <p className="text-xs text-blue-700 bg-blue-100/70 border border-blue-200 rounded-md p-2">
                        {ragSummary}
                      </p>
                    )}
                    <div className="space-y-3">
                      {suggestions.length > 0 ? (
                        suggestions.slice(0, 6).map((item, index) => (
                          <div key={`${item}-${index}`} className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">•</span><span>{item}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 italic">Run “Generate AI Insights” for Gemini suggestions.</p>
                      )}
                    </div>

                    {!ragSummary && ragQuickWins.length === 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleLoadInsights}
                        disabled={processLoading.insights}
                      >
                        {processLoading.insights ? "Loading..." : "Generate AI Insights"}
                      </Button>
                    )}

                    <Button
                      type="button"
                      onClick={handleApplyToEditor}
                      className="mt-2 bg-[#2369EB] hover:bg-blue-700 text-white w-full shadow-md"
                      disabled={!resume.trim()}
                    >
                      Apply Suggestions to Editor →
                    </Button>

                    <Button
                      type="button"
                      onClick={() => navigate("/restructure", { state: { resume } })}
                      className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white w-full shadow-md"
                      disabled={!resume.trim()}
                    >
                      Structure Resume (ATS) →
                    </Button>

                    {ragQuickWins.length > 0 && (
                      <div className="mt-2 border border-blue-200 rounded-md bg-white p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-2">Quick Wins</p>
                        <div className="space-y-1">
                          {ragQuickWins.slice(0, 3).map((item, index) => (
                            <p key={`${item}-${index}`} className="text-xs text-slate-600">• {item}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-emerald-200 bg-emerald-50/40 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-emerald-700">Learning Roadmap</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-700 text-sm leading-relaxed space-y-3">
                    {learningPlan.length > 0 ? (
                      learningPlan.slice(0, 6).map((item, index) => (
                        <div key={`${item}-${index}`} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span><span>{item}</span>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-3">
                        <p className="text-slate-400 italic">Click “Build Learning Roadmap” to request this Gemini step.</p>
                        <Button type="button" size="sm" variant="outline" onClick={handleLoadLearningPath} disabled={processLoading.roadmap}>
                          {processLoading.roadmap ? "Loading..." : "Build Learning Roadmap"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>
          )}


          <div className="flex flex-col lg:flex-row gap-6 items-stretch">

            {/* Left Column */}
            <div className="flex flex-col gap-6 flex-1 min-w-[50%]">

              {/* Dynamic Details Panel */}
              {(mode === "cover-letter" || mode === "cold-mail") && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-[fadeInDown_0.4s_ease-out]">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    {mode === "cover-letter" ? <PenTool size={16} className="text-[#2369EB]" /> : <Mail size={16} className="text-[#2369EB]" />}
                    <h3 className="text-[12px] font-bold text-slate-700 tracking-widest uppercase">{mode === "cover-letter" ? "Cover Letter Context" : "Cold Mail Context"}</h3>
                  </div>
                  <div className="p-6 space-y-5">
                    {mode === "cold-mail" && (
                      <div className="animate-[fadeInUp_0.4s_ease-out_forwards]">
                        <label className="block text-[12px] font-bold text-slate-500 mb-2">Recipient Target</label>
                        <div className="flex flex-wrap gap-2">
                          {['Recruiter', 'Hiring Manager', 'Founder'].map(type => (
                            <button
                              key={type}
                              onClick={() => setRecipientType(type)}
                              className={`px-4 py-2 rounded-lg text-[12px] font-bold transition-all duration-200 border ${recipientType === type ? 'bg-[#2369EB]/10 border-[#2369EB] text-[#2369EB]' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CleanInput
                        label="Target Role *"
                        placeholder="e.g. Senior Designer"
                        icon={Briefcase}
                        delay="0.1s"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      />
                      <CleanInput
                        label="Target Company *"
                        placeholder="e.g. Stripe"
                        icon={Building2}
                        delay="0.2s"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>
                    {result && (
                      <div className="space-y-3 animate-[fadeInUp_0.3s_ease-out_forwards]">
                        <button
                          onClick={handleDetectTone}
                          disabled={processLoading.tone || !job.trim()}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-600 hover:text-[#2369EB] hover:border-[#2369EB]/30 transition-colors disabled:opacity-50"
                        >
                          {processLoading.tone ? "Detecting Tone..." : "Detect Job Tone"}
                        </button>
                        {tone && (
                          <div className="bg-[#2369EB]/5 border border-[#2369EB]/20 p-3 rounded-lg flex items-center gap-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Detected Tone:</span>
                            <span className="text-[13px] font-bold text-[#2369EB] bg-[#2369EB]/10 px-2 py-0.5 rounded-full">{tone}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {result && (
                      <button
                        onClick={handleGenerateDraft}
                        disabled={!role || !company}
                        className="w-full bg-[#2369EB] text-white px-4 py-3 rounded-xl text-[14px] font-bold shadow-[0_4px_14px_rgba(35,105,235,0.25)] hover:shadow-[0_6px_20px_rgba(35,105,235,0.4)] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      >
                        {mode === "cold-mail" ? "Generate Cold Mail" : "Generate AI Draft"} →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Resume Input Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 flex flex-col flex-1 shadow-sm overflow-hidden animate-[fadeInUp_0.6s_ease-out]">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="text-[12px] font-bold text-slate-700 tracking-widest uppercase flex items-center gap-2">
                    <UserCircle size={16} className="text-[#2369EB]" /> Base Resume
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUseProfileResume}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-600 hover:text-[#2369EB] hover:border-[#2369EB]/30 transition-colors"
                    >
                      Load Profile
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      className="hidden"
                      onChange={handleUploadResumeFile}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-600 hover:text-[#2369EB] hover:border-[#2369EB]/30 transition-colors"
                    >
                      Upload
                    </button>
                  </div>
                </div>
                <div className="p-6 flex-1 min-h-[250px]">
                  {resumeLoadError && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mb-4">{resumeLoadError}</p>
                  )}
                  <textarea
                    className="w-full h-full bg-slate-50 rounded-xl p-5 border border-slate-100 resize-none outline-none focus:bg-white focus:border-[#2369EB]/50 focus:ring-4 focus:ring-[#2369EB]/10 transition-all text-[14px] text-slate-700 placeholder:text-slate-400 leading-relaxed"
                    placeholder="Paste your source resume content here..."
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                  ></textarea>
                </div>
              </div>

            </div>

            {/* Job Description Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 flex flex-col flex-1 shadow-sm overflow-hidden animate-[fadeInUp_0.7s_ease-out]">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-[12px] font-bold text-slate-700 tracking-widest uppercase flex items-center gap-2">
                  <Target size={16} className="text-emerald-500" /> Job Description
                </h3>
              </div>
              <div className="p-6 flex-1 min-h-[400px]">
                <textarea
                  className="w-full h-full bg-slate-50 rounded-xl p-5 border border-slate-100 resize-none outline-none focus:bg-white focus:border-[#2369EB]/50 focus:ring-4 focus:ring-[#2369EB]/10 transition-all text-[14px] text-slate-700 placeholder:text-slate-400 leading-relaxed"
                  placeholder="Paste the target job description here..."
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                ></textarea>
              </div>
            </div>

          </div>

          {toast && <Toast {...toast} onClose={() => setToast(null)} />}

        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes staggerUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
