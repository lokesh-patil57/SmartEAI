import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api, getProfile, parseResumeFile } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Toast from "@/components/ui/toast";

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
  const [recipientType, setRecipientType] = useState("Recruiter"); // New for Cold Mail
  const [tone, setTone] = useState(null);
  const [resumeLoadError, setResumeLoadError] = useState(null);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const { isLoggedIn } = useAuth();

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

  const handleAnalyze = async () => {
    setLoading(true);
    setTone(null);
    try {
      // 1. Standard Match Analysis
      const matchPromise = api("/match", {
        method: "POST",
        body: JSON.stringify({ resume, job }),
      });

      // 2. If Cover Letter, also detect tone
      let tonePromise = Promise.resolve(null);
      if (mode === 'cover-letter' || mode === 'cold-mail') {
        tonePromise = api("/improve/detect-tone", {
          method: "POST",
          body: JSON.stringify({ jobDescription: job }),
        }).then(res => res.json()).catch(() => null);
      }

      const [matchRes, toneData] = await Promise.all([matchPromise, tonePromise]);
      const data = await matchRes.json();

      if (!matchRes.ok) throw new Error(data.error || "Match failed");

      setResult(data);
      if (toneData && toneData.tone) {
        setTone(toneData.tone);
      }

      setToast({ type: "success", message: "Analysis complete!" });
    } catch (error) {
      console.error("Analyze error:", error);
      setResult(null);
      setToast({ type: "error", message: error.message || "Analysis failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!resume || !job) return;
    if ((mode === 'cover-letter' || mode === 'cold-mail') && (!role || !company)) {
      setToast({ type: "error", message: "Please enter Role and Company name." });
      return;
    }

    setToast({ type: "info", message: "Generating initial draft..." });
    try {
      let data;
      let res;
      if (mode === 'cold-mail') {
        res = await api("/improve/draft-cold-mail", {
          method: "POST",
          body: JSON.stringify({ resume, context: job, recipientType, role, company }),
        });
      } else {
        res = await api("/improve/draft-cover-letter", {
          method: "POST",
          body: JSON.stringify({ resume, job, tone, role, company, mode }),
        });
      }

      data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      if (data.draft) {
        navigate(`/editor?mode=${mode}`, {
          state: {
            fromMatch: true,
            originalContent: data.draft,
            job: job.trim(),
            suggestions: result?.suggestions || [],
            matchScore: result?.score,
            missingSkills: result?.missing_skills || [],
            matchedSkills: result?.matched_skills || [],
            detectedTone: tone
          }
        });
        setToast({ type: "success", message: "Draft generated! Opening editor..." });
      }
    } catch (err) {
      console.error("Generate Draft Error:", err);
      const isRateLimit = err.message.includes("Rate Limit") || err.message.includes("429") || err.message.includes("Quota");
      setToast({
        type: isRateLimit ? "warning" : "error",
        message: isRateLimit ? "AI Limit Reached. Please wait ~1 min." : "Failed to generate draft."
      });
    }
  };

  /* ================= AUTO-ANALYZE LOGIC ================= */
  useEffect(() => {
    if (location.state?.autoAnalyze) {
      if (location.state.resume) setResume(location.state.resume);
      if (location.state.job) setJob(location.state.job);

      // Need to wait for state to update, or pass values directly?
      // Better to call a function that takes args, or use ref, or just wait.
      // Easiest is to call a variation of analyze that accepts args.
      doAutoAnalyze(location.state.resume, location.state.job);
    }
  }, [location.state]);

  const doAutoAnalyze = async (r, j) => {
    if (!r || !j) return;
    setLoading(true);
    try {
      const response = await api("/match", {
        method: "POST",
        body: JSON.stringify({ resume: r, job: j }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Match failed");
      setResult(data);

      // Replace history to avoid re-triggering? 
      // location.state is immutable, but we handled it. 
      // Replace history to avoid re-triggering? 
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

  const handleApplyToEditor = () => {
    if (!result) return;

    // Ensure we have resume content
    if (!resume.trim()) {
      alert("Please provide resume content before applying suggestions.");
      return;
    }

    navigate(`/editor?mode=${mode}`, {
      state: {
        fromMatch: true,
        originalContent: resume.trim(),
        job: job.trim(),
        suggestions: result.suggestions || [],
        matchScore: result.score,
        missingSkills: result.missing_skills || [],
        matchedSkills: result.matched_skills || [],
      },
      replace: false, // Allow back navigation
    });
    setToast({ type: "success", message: "Redirecting to Editor..." });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-28 px-6">
      <div className="max-w-6xl mx-auto space-y-14">

        {/* Header */}
        <header>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
            Resume ↔ Job Matching
          </h1>
          <p className="text-slate-600 max-w-2xl mt-2">
            Compare your resume with a job description to understand alignment,
            strengths, and missing skills.
          </p>
        </header>

        {/* Analyze Button + Start with new job + Mode Selector */}
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
              onClick={() => {
                setJob("");
                setResult(null);
              }}
              className="px-6 py-6 text-lg border-slate-300 hover:bg-slate-50"
            >
              Start with new job description
            </Button>
          )}

          {/* Mode selector for how to apply suggestions */}
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
                  className={`px-4 py-1.5 text-xs md:text-sm rounded-full transition-all font-medium ${mode === item.key
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

        {/* Results */}
        {result && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Score */}
            <Card className="border-blue-100 shadow-lg shadow-blue-500/5">
              <CardHeader>
                <CardTitle>Match Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-[#2369EB] tracking-tight">
                  {result.score}%
                </p>
                <p className="text-slate-500 mt-2 text-sm font-medium">
                  Overall alignment with the role
                </p>
              </CardContent>
            </Card>

            {/* Matched */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Matched Skills</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600 space-y-2 text-sm">
                {result.matched_skills.length > 0 ? (
                  result.matched_skills.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span> <span>{s}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic">No matches found</p>
                )}
              </CardContent>
            </Card>

            {/* Missing */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Missing Skills</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600 space-y-2 text-sm">
                {result.missing_skills.length > 0 ? (
                  result.missing_skills.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">✕</span> <span>{s}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic">No missing skills</p>
                )}
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card className="border-blue-200 bg-blue-50/50 flex flex-col justify-between shadow-md">
              <CardHeader>
                <CardTitle className="text-[#2369EB]">
                  Improvement Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-slate-700 text-sm leading-relaxed">
                <div className="space-y-3">
                  {result.suggestions && result.suggestions.length > 0 ? (
                    result.suggestions.slice(0, 4).map((s, i) => ( // Limit to 4 to avoid overflow
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span> <span>{s}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic">
                      Your resume already aligns well.
                    </p>
                  )}
                </div>

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
                  onClick={() => navigate("/restructure", { state: { resume: resume } })}
                  className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white w-full shadow-md"
                  disabled={!resume.trim()}
                >
                  Structure Resume (ATS) →
                </Button>
              </CardContent>
            </Card>

          </section>
        )}

        {/* --- COVER LETTER SPECIFIC UI --- */}
        {(mode === 'cover-letter' || mode === 'cold-mail') && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 animate-in fade-in slide-in-from-left-4">
            <Card className="shadow-md border-indigo-100 bg-indigo-50/50">
              <CardHeader className="py-4 border-b border-indigo-100">
                <CardTitle className="text-sm font-semibold text-indigo-900 uppercase">
                  {mode === 'cold-mail' ? "Cold Mail Context" : "Cover Letter Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {mode === 'cold-mail' && (
                  <div>
                    <label className="text-xs font-medium text-indigo-700 block mb-1.5">Recipient Type</label>
                    <div className="flex gap-2">
                      {["Recruiter", "Hiring Manager", "Founder"].map(type => (
                        <button
                          key={type}
                          onClick={() => setRecipientType(type)}
                          className={`px-3 py-1.5 text-xs rounded border transition-colors ${recipientType === type
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-indigo-200 hover:border-indigo-400'
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
                    {mode === 'cold-mail' ? "Opportunity / Role *" : "Target Role *"}
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

                {result && tone && (
                  <div className="bg-white p-3 rounded-md border border-indigo-100 flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Detected Tone:</span>
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{tone}</span>
                  </div>
                )}

                {result && (
                  <Button
                    onClick={handleGenerateDraft}
                    disabled={!role || !company}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 mt-2"
                  >
                    {mode === 'cold-mail' ? "Generate Cold Mail" : "Generate AI Draft"} →
                  </Button>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}

        {/* Inputs */}
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
