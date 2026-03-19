import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api, getProfile, parseResumeFile } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Toast from "@/components/ui/toast";

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
    <div className="min-h-screen bg-[#F8FAFC] pt-28 px-6">
      <div className="max-w-6xl mx-auto space-y-14">
        <header>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Resume ↔ Job Matching</h1>
          <p className="text-slate-600 max-w-2xl mt-2">
            Compare your resume with a job description to understand alignment, skill gaps, and targeted learning paths.
          </p>
        </header>

        {/* Sticky action bar */}
        <div className="sticky top-24 z-10 bg-[#F8FAFC]/95 backdrop-blur-sm py-4 border-b border-slate-200/50 flex flex-col md:flex-row items-start md:items-center gap-4 flex-wrap transition-all">
          <Button
            disabled={!resume.trim() || !job.trim() || loading}
            onClick={handleAnalyze}
            className="bg-[#2369EB] text-white px-8 py-6 text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
          >
            {loading ? "Analyzing..." : "Analyze Match"}
          </Button>

          {(job.trim() || result) && (
            <Button
              variant="outline"
              onClick={() => { setJob(""); setResult(null); }}
              className="px-6 py-6 text-lg border-slate-300 hover:bg-slate-50"
            >
              Start with new job description
            </Button>
          )}

          <div className="flex items-center gap-3 text-sm text-slate-600 ml-auto bg-white p-1.5 rounded-full border border-slate-200 shadow-sm">
            <span className="whitespace-nowrap pl-3 font-medium">Apply as:</span>
            <div className="inline-flex">
              {[
                { key: "resume", label: "Resume" },
                { key: "cover-letter", label: "Cover Letter" },
                { key: "cold-mail", label: "Cold Mail" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setMode(item.key)}
                  className={`px-4 py-1.5 text-xs md:text-sm rounded-full transition-all font-medium ${
                    mode === item.key
                      ? "bg-[#2369EB] text-white shadow-md"
                      : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
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

        {/* Cover Letter / Cold Mail section */}
        {(mode === "cover-letter" || mode === "cold-mail") && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 animate-in fade-in slide-in-from-left-4">
            <Card className="shadow-md border-indigo-100 bg-indigo-50/50">
              <CardHeader className="py-4 border-b border-indigo-100">
                <CardTitle className="text-sm font-semibold text-indigo-900 uppercase">
                  {mode === "cold-mail" ? "Cold Mail Context" : "Cover Letter Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {mode === "cold-mail" && (
                  <div>
                    <label className="text-xs font-medium text-indigo-700 block mb-1.5">Recipient Type</label>
                    <div className="flex gap-2">
                      {["Recruiter", "Hiring Manager", "Founder"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setRecipientType(type)}
                          className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                            recipientType === type
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-slate-600 border-indigo-200 hover:border-indigo-400"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-indigo-700 block mb-1.5">
                    {mode === "cold-mail" ? "Opportunity / Role *" : "Target Role *"}
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full text-sm p-3 rounded-md border border-indigo-200 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-indigo-700 block mb-1.5">Target Company *</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full text-sm p-3 rounded-md border border-indigo-200 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                </div>

                {result && (
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDetectTone}
                      disabled={processLoading.tone || !job.trim()}
                      className="w-full"
                    >
                      {processLoading.tone ? "Detecting Tone..." : "Detect Job Tone"}
                    </Button>

                    {tone && (
                      <div className="bg-white p-3 rounded-md border border-indigo-100 flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500 uppercase">Detected Tone:</span>
                        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{tone}</span>
                      </div>
                    )}
                  </div>
                )}

                {result && (
                  <Button
                    onClick={handleGenerateDraft}
                    disabled={!role || !company}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 mt-2"
                  >
                    {mode === "cold-mail" ? "Generate Cold Mail" : "Generate AI Draft"} →
                  </Button>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}

        {/* Input section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <Card className="shadow-md border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
              <CardTitle className="text-base text-slate-700">Resume Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap gap-2 mb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseProfileResume}
                  className="bg-white hover:bg-slate-50 text-slate-600 text-xs"
                >
                  Load Profile Resume
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={handleUploadResumeFile}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-slate-50 text-slate-600 text-xs"
                >
                  Upload File
                </Button>
              </div>
              {resumeLoadError && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">{resumeLoadError}</p>
              )}
              <Textarea
                rows={16}
                placeholder="Paste your resume text here, use your profile resume, or upload a file…"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                className="font-mono text-sm leading-relaxed bg-slate-50/30 focus:bg-white transition-colors resize-none"
              />
            </CardContent>
          </Card>

          <Card className="shadow-md border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
              <CardTitle className="text-base text-slate-700">Job Description</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                rows={18}
                placeholder="Paste the job or internship description here…"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                className="font-mono text-sm leading-relaxed bg-slate-50/30 focus:bg-white transition-colors resize-none h-full"
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
