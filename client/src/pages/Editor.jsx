import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Loader2, Undo2, CheckCircle2, X, Download, Edit3, ArrowRight } from "lucide-react";
import Toast from "@/components/ui/toast";
import ImprovementPanel from "@/components/editor/ImprovementPanel";
import TimelinePanel from "@/components/editor/TimelinePanel";
import DiffViewer from "@/components/editor/DiffViewer";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

/* ================= MODE CONFIG ================= */
const MODE_CONFIG = {
  "cover-letter": {
    title: "Cover Letter Editor",
    placeholder: "AI-generated cover letter content will appear here…",
    sections: ["Opening", "Skills Alignment", "Motivation", "Closing"]
  },
  "cold-mail": {
    title: "Cold Mail Editor",
    placeholder: "AI-generated cold email content will appear here…",
    sections: ["Subject Line", "Opening", "Value Prop", "Call to Action"]
  },
  resume: {
    title: "Resume Editor",
    placeholder: "AI-generated resume content will appear here…",
    sections: ["Summary", "Experience", "Projects", "Skills"]
  },
};

function Editor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  const mode = searchParams.get("mode") || "resume";
  const documentId = searchParams.get("resumeId") || searchParams.get("documentId");
  const config = MODE_CONFIG[mode] || MODE_CONFIG["resume"];

  // Editor State
  const [originalContent, setOriginalContent] = useState("");
  const [editableContent, setEditableContent] = useState("");
  const [history, setHistory] = useState([]); // For Undo

  // AI Flow State
  const [activeSectionIndex, setActiveSectionIndex] = useState(-1); // -1 = Not started
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [matchInsights, setMatchInsights] = useState(null);
  const [isFlowComplete, setIsFlowComplete] = useState(false);

  // Review Mode (Diffing)
  const [reviewMode, setReviewMode] = useState(false); // TRUE when user should review AI changes
  const [preAiContent, setPreAiContent] = useState("");

  // General UI State
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [toast, setToast] = useState(null);

  /* ================= LOAD INITIAL STATE ================= */
  useEffect(() => {
    // 1. Check for Match Insights from Navigation State
    if (location.state?.fromMatch) {
      setOriginalContent(location.state.originalContent || "");
      setEditableContent(location.state.originalContent || "");
      setMatchInsights({
        score: location.state.matchScore,
        missingSkills: location.state.missingSkills,
        suggestions: location.state.suggestions,
        job: location.state.job,
        detectedTone: location.state.detectedTone
      });
      return;
    }

    // 2. Load from Document ID if exists
    if (documentId && isLoggedIn) {
      api(`/api/documents/${documentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.content) {
            setOriginalContent(data.content);
            setEditableContent(data.content);
            setHistory([data.content]);
          }
        })
        .catch(() => { });
      return;
    }
  }, [documentId, isLoggedIn, location.state]);

  /* ================= SAVE LOGIC ================= */
  const saveVersionToBackend = useCallback(async (text) => {
    if (!documentId || !isLoggedIn || !text) return;
    setSaveStatus("Saving…");
    try {
      const res = await api(`/api/documents/${documentId}/versions`, {
        method: "POST",
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) setSaveStatus("Saved");
      else setSaveStatus("Error");
    } catch {
      setSaveStatus("Error");
    }
  }, [documentId, isLoggedIn]);

  useEffect(() => {
    if (!editableContent.trim()) return;
    setSaveStatus("Saving…");
    const timeout = setTimeout(() => {
      setSaveStatus("Saved");
      if (documentId && isLoggedIn) saveVersionToBackend(editableContent);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [editableContent, documentId, isLoggedIn, saveVersionToBackend]);


  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);

  useEffect(() => {
    if (rateLimitCooldown > 0) {
      const timer = setInterval(() => setRateLimitCooldown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [rateLimitCooldown]);

  /* ================= AI SECTION FLOW ================= */
  const handleBatchImprovement = async () => {
    if (rateLimitCooldown > 0) return;

    setToast({ type: "info", message: "Improving entire resume (Batch Mode)..." });
    setIsAiProcessing(true);
    setPreAiContent(editableContent);
    setHistory(prev => [...prev, editableContent]);

    try {
      const res = await api("/improve", {
        method: "POST",
        body: JSON.stringify({
          content: editableContent,
          job: matchInsights?.job || "",
          suggestions: matchInsights?.suggestions || [],
          mode: mode
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          const waitTime = data.retryAfter || 60;
          setRateLimitCooldown(waitTime);
          throw new Error(`Rate Limit Hit. Please wait ${waitTime}s.`);
        }
        throw new Error(data.error || "Request failed");
      }

      if (data.improved_content) {
        setEditableContent(data.improved_content);
        setToast({ type: "success", message: "Resume fully optimized!" });
        setIsFlowComplete(true); // Mark as done so they can see full analysis
      } else {
        throw new Error("No content returned");
      }
    } catch (err) {
      console.error("Batch AI Error:", err);
      const isRateLimit = err.message.includes("Rate Limit") || err.message.includes("429");
      setToast({
        type: isRateLimit ? "warning" : "error",
        message: err.message || "Failed to improve resume"
      });
      // Revert
      if (history.length > 0) {
        setEditableContent(history[history.length - 1]);
        setHistory(h => h.slice(0, -1));
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  const startAiImprovement = () => {
    if (rateLimitCooldown > 0) return;

    // Resume if already started specific section, else start from 0
    const startIndex = activeSectionIndex >= 0 ? activeSectionIndex : 0;

    setToast({ type: "info", message: `Starting improvements for ${config.sections[startIndex]}...` });
    setActiveSectionIndex(startIndex);
    setIsFlowComplete(false);
    processSection(startIndex, editableContent);
  };

  const processSection = async (index, currentText) => {
    if (index >= config.sections.length) {
      setToast({ type: "success", message: "All sections processed!" });
      setActiveSectionIndex(-1); // Done
      setIsFlowComplete(true);
      return;
    }

    setIsAiProcessing(true);
    setReviewMode(false);
    const sectionName = config.sections[index];

    // Store state before AI for diffing and undo
    setPreAiContent(currentText);
    setHistory(prev => [...prev, currentText]);

    try {
      const res = await api("/improve/section", {
        method: "POST",
        body: JSON.stringify({
          sectionText: currentText, // Sending FULL text now
          sectionName: sectionName,
          job: matchInsights?.job || "",
          improvements: [
            ...(matchInsights?.suggestions || []),
            ...(matchInsights?.missingSkills?.map(skill => `Missing Requirement: ${skill}`) || [])
          ],
          mode: mode
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle Rate Limit with cooldown
        if (res.status === 429) {
          const waitTime = data.retryAfter || 60;
          setRateLimitCooldown(waitTime);
          throw new Error(`Rate Limit Hit. Please wait ${waitTime}s.`);
        }
        throw new Error(data.error || "Request failed");
      }

      if (data.rewritten_section) {
        setEditableContent(data.rewritten_section);
        setReviewMode(true); // Switch to Review Mode to show diff
      } else {
        throw new Error("No content returned");
      }
    } catch (err) {
      console.error("AI Error:", err);

      const isRateLimit = err.message.includes("Rate Limit") || err.message.includes("429");
      setToast({
        type: isRateLimit ? "warning" : "error",
        message: err.message || `Failed to improve ${sectionName}`
      });

      // Revert if failed (unless it was just a rate limit check before changing text? 
      // Actually if it failed, we haven't changed text yet usually, but we pushed history.
      // Let's pop history to be safe so user is back to pre-request state)
      if (history.length > 0) {
        setEditableContent(history[history.length - 1]);
        setHistory(h => h.slice(0, -1));
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAcceptSection = async () => {
    setToast({ type: "success", message: "Section accepted!" });
    setReviewMode(false); // Commit changes
    const nextIndex = activeSectionIndex + 1;

    if (nextIndex < config.sections.length) {
      // Manual Mode: Just move to next section, user must click "Improve"
      setActiveSectionIndex(nextIndex);
    } else {
      // Flow Complete: Trigger Re-analysis
      setIsFlowComplete(true);
      setActiveSectionIndex(-1);

      if (matchInsights?.job) {
        setToast({ type: "info", message: "Re-analyzing your new resume..." });
        try {
          const res = await api("/match", {
            method: "POST",
            body: JSON.stringify({ resume: editableContent, job: matchInsights.job }),
          });
          const data = await res.json();
          if (res.ok && data.score) {
            setMatchInsights(prev => ({
              ...prev,
              score: data.score,
              missingSkills: data.missing_skills || [],
              suggestions: data.suggestions || []
            }));
            setToast({ type: "success", message: `Analysis complete! New Score: ${data.score}%` });
          }
        } catch (err) {
          console.error("Re-analysis failed", err);
          setToast({ type: "warning", message: "Could not refresh match score" });
        }
      } else {
        setToast({ type: "success", message: "AI improvements complete!" });
      }
    }
  };

  const handleRevertSection = () => {
    setReviewMode(false);
    // Undo last change
    setEditableContent(preAiContent);
    setHistory(h => h.slice(0, -1));
    setToast({ type: "info", message: "Changes reverted." });
  };

  const handleEditManually = () => {
    setReviewMode(false);
    setToast({ type: "info", message: "Manual edit mode." });
    // Just basically hides the DiffViewer, user sees Textarea with new content
  };

  const handleExitAi = () => {
    setActiveSectionIndex(-1);
    setReviewMode(false);
    setToast({ type: "info", message: "Exited AI mode" });
  };

  const downloadFile = async (type) => {
    if (!editableContent.trim()) return;
    try {
      let blob;
      if (type === "txt") {
        blob = new Blob([editableContent], { type: "text/plain" });
      } else {
        const res = await api(`/download/${type}`, {
          method: "POST",
          body: JSON.stringify({ content: editableContent }),
        });
        blob = await res.blob();
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SmartEAI_Resume.${type}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setToast({ type: "error", message: "Export failed" });
    }
  };

  const handleFullAnalysis = () => {
    if (!editableContent) return;
    navigate("/match", {
      state: {
        autoAnalyze: true,
        resume: editableContent,
        job: matchInsights?.job || ""
      }
    });
    setToast({ type: "success", message: "Redirecting to Full Analysis..." });
  };

  const handleCreateCoverLetter = () => {
    if (!editableContent) return;
    navigate("/restructure", {
      state: {
        resume: editableContent,
        job: matchInsights?.job || "",
        mode: "cover-letter"
      }
    });
    setToast({ type: "success", message: "Redirecting to Cover Letter Studio..." });
  };

  const handleCreateColdMail = () => {
    if (!editableContent) return;
    navigate("/restructure", {
      state: {
        resume: editableContent,
        job: matchInsights?.job || "",
        mode: "cold-mail",
        role: "Role",       // Ideally parse from job if available
        company: "Company"  // Ideally parse from job if available
      }
    });
    setToast({ type: "success", message: "Opening Cold Mail Studio..." });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#F8FAFC] pt-24 px-6 md:px-10 pb-12"
    >
      <div className="max-w-[1700px] mx-auto space-y-8">

        {/* TOP IMPROVEMENT PANEL */}
        {matchInsights && (
          <ImprovementPanel
            matchScore={matchInsights.score}
            missingSkills={matchInsights.missingSkills}
            suggestions={matchInsights.suggestions}
            onApplyAI={startAiImprovement}
            onBatchImprove={handleBatchImprovement}
            onFullAnalysis={handleFullAnalysis}
            onCreateCoverLetter={handleCreateCoverLetter}
            onCreateColdMail={handleCreateColdMail}
            isApplying={isAiProcessing}
            isComplete={isFlowComplete}
            currentSectionName={activeSectionIndex >= 0 ? config.sections[activeSectionIndex] : null}
            cooldown={rateLimitCooldown}
          />
        )}

        {/* 3-COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-8 items-start h-[80vh]">

          {/* 1. TIMELINE SIDEBAR */}
          <TimelinePanel
            steps={config.sections}
            activeStepIndex={activeSectionIndex}
            isComplete={isFlowComplete}
          />

          {/* 2. CENTER PANEL: ORIGINAL (Hidden on small screens) */}
          <Card className="hidden xl:flex flex-col w-[35%] h-full border border-slate-200 bg-white/50 shadow-sm">
            <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Original Version
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden min-h-0">
              <textarea
                readOnly
                className="w-full h-full p-6 resize-none bg-transparent border-0 focus:ring-0 text-slate-500 text-sm leading-relaxed font-mono overflow-y-auto [&::-webkit-scrollbar]:hidden"
                value={originalContent}
              />
            </CardContent>
          </Card>

          {/* 3. RIGHT PANEL: EDITABLE */}
          <Card
            className={`flex-1 flex flex-col h-full shadow-xl transition-all duration-300
              ${activeSectionIndex >= 0
                ? 'border-blue-500 ring-1 ring-blue-500/20 shadow-blue-500/10'
                : 'border-slate-200'}
            `}
          >
            {/* TOOLBAR HEADER */}
            <CardHeader className={`py-4 px-6 border-b flex flex-row items-center justify-between
               ${activeSectionIndex >= 0 ? 'bg-blue-50/40' : 'bg-white'}
            `}>
              {/* ... existing header logic ... */}
              <div className="flex items-center gap-3">
                {/* ... existing title ... */}
                <CardTitle className={`text-sm font-bold uppercase tracking-widest ${activeSectionIndex >= 0 ? 'text-blue-700' : 'text-slate-800'}`}>
                  {activeSectionIndex >= 0 ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      Editing: {config.sections[activeSectionIndex]}
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      Final Document
                      {matchInsights?.detectedTone && (
                        <span className="text-xs font-normal bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wide">
                          Tone: {matchInsights.detectedTone}
                        </span>
                      )}
                    </span>
                  )}
                </CardTitle>
                {isAiProcessing && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
              </div>

              {/* ... existing actions ... */}
              <div className="flex items-center gap-2">
                {/* Save Status Indicator */}
                <div className="flex items-center gap-1.5 mr-2 text-xs font-medium text-slate-400">
                  {saveStatus === "Saved" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : saveStatus === "Saving…" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                  <span>{saveStatus}</span>
                </div>

                {/* AI Review Actions */}
                {reviewMode ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRevertSection}
                      className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Undo2 className="w-3.5 h-3.5 mr-1.5" />
                      Revert
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditManually}
                      className="h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAcceptSection}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Accept & Next
                    </Button>
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => downloadFile("pdf")}>
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadFile("docx")}>
                        Export as DOCX
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadFile("txt")}>
                        Export as TXT
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>

            {/* COLD MAIL SUBJECT LINE (New) */}
            {mode === 'cold-mail' && !reviewMode && (
              <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/30">
                <input
                  type="text"
                  placeholder="Subject Line..."
                  className="w-full bg-transparent font-medium text-slate-800 placeholder:text-slate-400 outline-none text-base"
                  defaultValue="Subject: "
                />
              </div>
            )}

            <CardContent className="flex-1 p-0 relative bg-white min-h-0 overflow-hidden">
              {reviewMode ? (
                <DiffViewer oldText={preAiContent} newText={editableContent} />
              ) : (
                <Textarea
                  className="w-full h-full p-6 resize-none bg-transparent border-0 focus:ring-0 text-slate-800 text-base leading-relaxed font-sans overflow-y-auto [&::-webkit-scrollbar]:hidden"
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  placeholder={config.placeholder}
                />
              )}
            </CardContent>

            {/* Bottom Tools/Info (Optional) */}
            <div className="py-2 px-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-slate-500" onClick={() => {
                  if (history.length > 0) {
                    setEditableContent(history[history.length - 1]);
                    setHistory(h => h.slice(0, -1));
                  }
                }} disabled={history.length === 0}>
                  <Undo2 className="w-3 h-3 mr-1" />
                  Undo Last
                </Button>
              </div>
              <div className="font-mono">
                {editableContent.length} chars
              </div>
            </div>
          </Card>

        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </motion.div >
  );
}

export default Editor;
