import { useState, useEffect } from "react";
import { FileText, PenLine, Briefcase, Download, Brain, Target, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Toast from "@/components/ui/toast";

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
  const [mode, setMode] = useState("cover-letter");
  const [toast, setToast] = useState(null);
  const [skillHistory, setSkillHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) return;
    setHistoryLoading(true);
    api("/api/job/history")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.history)) setSkillHistory(data.history.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [isLoggedIn]);

  const latestAnalysis = skillHistory[0] || null;

  const handleNavigate = (path, message, options = {}) => {
    setToast({ type: "success", message: message || "Redirecting..." });
    setTimeout(() => {
      navigate(path, options);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-28 px-6">
      <div className="max-w-6xl mx-auto space-y-14">
        {/* ================= HEADER ================= */}
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-600 max-w-xl">
            Choose what you want to create and continue your application
            process.
          </p>
        </header>

        {/* ================= MODE SWITCHER ================= */}
        <section className="flex flex-wrap gap-3">
          {[
            { key: "cover-letter", label: "Cover Letter" },
            { key: "cold-mail", label: "Cold Mail" },
            { key: "resume", label: "Resume" },
          ].map((item) => (
            <Button
              key={item.key}
              variant={mode === item.key ? "default" : "outline"}
              className={
                mode === item.key
                  ? "bg-[#2369EB] text-white"
                  : "border-slate-300 text-slate-700"
              }
              onClick={() => setMode(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </section>

        {/* ================= SKILL GAP ANALYSIS WIDGET ================= */}
        {isLoggedIn && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Brain size={20} className="text-[#2369EB]" />
                Skill Gap Analysis
              </h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/match")}
                className="text-[#2369EB] border-blue-200 hover:bg-blue-50 text-xs"
              >
                Run New Analysis
              </Button>
            </div>

            {historyLoading && (
              <p className="text-slate-500 text-sm">Loading analysis history…</p>
            )}

            {!historyLoading && !latestAnalysis && (
              <div
                onClick={() => navigate("/match")}
                className="p-6 rounded-2xl bg-white border border-dashed border-blue-200 cursor-pointer hover:border-blue-400 transition text-center"
              >
                <Target size={28} className="text-blue-400 mx-auto mb-2" />
                <p className="text-slate-600 font-medium">No analysis yet</p>
                <p className="text-slate-400 text-sm mt-1">Click Analyze Match to see your skill gap report here.</p>
              </div>
            )}

            {!historyLoading && latestAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Latest Score */}
                <Card className="border-blue-100 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-500 font-medium">Latest Match</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <MiniScoreBar score={latestAnalysis.matchScore} />
                    {latestAnalysis.job && (
                      <div className="text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{latestAnalysis.job.title || "Role"}</span>
                        {latestAnalysis.job.company ? ` @ ${latestAnalysis.job.company}` : ""}
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="w-full bg-[#2369EB] text-white text-xs"
                      onClick={() => navigate("/match")}
                    >
                      Improve Match →
                    </Button>
                  </CardContent>
                </Card>

                {/* Missing Skills */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                      <Target size={14} className="text-red-400" /> Missing Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {latestAnalysis.missingSkills?.length > 0 ? (
                      latestAnalysis.missingSkills.slice(0, 5).map((skill, index) => (
                        <div key={`${skill}-${index}`} className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="text-red-400">✕</span>
                          <span>{skill}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic text-xs">No gaps detected</p>
                    )}
                  </CardContent>
                </Card>

                {/* Learning Path */}
                <Card className="border-emerald-100 bg-emerald-50/40 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-emerald-700 font-medium flex items-center gap-1.5">
                      <BookOpen size={14} /> Learning Path
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {latestAnalysis.learningPlan?.length > 0 ? (
                      latestAnalysis.learningPlan.slice(0, 3).map((item, index) => (
                        <div key={`${item}-${index}`} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <span className="text-emerald-600 font-bold mt-0.5">•</span>
                          <span className="leading-snug">{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic text-xs">Run a match to get learning recommendations.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </section>
        )}

        {/* ================= PRIMARY ACTIONS ================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Editor */}
          <div onClick={() => handleNavigate(`/editor?mode=${mode}`, "Opening Editor...")}>
            <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-[#2369EB] transition cursor-pointer">
              <div className="flex items-center gap-3 mb-4 text-[#2369EB]">
                <PenLine size={22} />
                <h3 className="text-xl font-semibold text-slate-900">
                  Open Editor
                </h3>
              </div>
              <p className="text-slate-600">
                Create and refine a {mode.replace("-", " ")} using AI
                assistance.
              </p>
            </div>
          </div>

          <div onClick={() => handleNavigate("/match", "Opening Match tool...", { state: { mode } })}>
            <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-[#2369EB] transition cursor-pointer">
              <div className="flex items-center gap-3 mb-4 text-[#2369EB]">
                <Briefcase size={22} />
                <h3 className="text-xl font-semibold text-slate-900">
                  Resume Matching
                </h3>
              </div>
              <p className="text-slate-600">
                Analyze your resume against job descriptions.
              </p>
            </div>
          </div>



          {/* Exports */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200">
            <div className="flex items-center gap-3 mb-4 text-[#2369EB]">
              <Download size={22} />
              <h3 className="text-xl font-semibold text-slate-900">Exports</h3>
            </div>
            <p className="text-slate-600">
              Access previously generated documents.
            </p>
          </div>
        </section>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
