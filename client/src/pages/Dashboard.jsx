import { useState } from "react";
import { FileText, PenLine, Briefcase, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Toast from "@/components/ui/toast";

export default function Dashboard() {
  const [mode, setMode] = useState("cover-letter");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

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
