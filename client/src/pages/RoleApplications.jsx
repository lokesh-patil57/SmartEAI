import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Briefcase, Building2, Calendar,
  ChevronDown, ChevronUp, Download, FileText,
  Mail, Sparkles, Target, TrendingUp,
} from "lucide-react";
import { getApplications, downloadDocumentAsTxt } from "@/lib/api";

const STATUS_CONFIG = {
  analyzed: { label: "Analyzed", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  applied:  { label: "Applied",  color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
  interview:{ label: "Interview",color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  offer:    { label: "Offer 🎉", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
};

function ScoreRing({ score = 0 }) {
  const n = Math.max(0, Math.min(100, Number(score) || 0));
  const r = 22; const circ = 2 * Math.PI * r;
  const offset = circ - (n / 100) * circ;
  const color = n >= 70 ? "#22c55e" : n >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative shrink-0" style={{ width: 56, height: 56 }}>
      <svg width={56} height={56} viewBox="0 0 56 56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} stroke="#334155" strokeWidth="5" fill="none" />
        <circle cx="28" cy="28" r={r} stroke={color} strokeWidth="5" fill="none"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold" style={{ color }}>{n}%</div>
    </div>
  );
}

function AssetButton({ label, icon: Icon, documentId, onOpen, onDownload }) {
  const exists = Boolean(documentId);
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all
      ${exists ? "border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 cursor-pointer" : "border-white/10 bg-white/5 text-slate-500 opacity-50 cursor-not-allowed"}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
      {exists && (
        <div className="flex gap-1 ml-auto">
          <button onClick={(e) => { e.stopPropagation(); onOpen(); }} className="hover:text-white transition-colors">View</button>
          <span className="text-slate-600">·</span>
          <button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="hover:text-white transition-colors">↓</button>
        </div>
      )}
    </div>
  );
}

function ApplicationRow({ app, index }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.analyzed;
  const date = app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  const openEditor = (documentId, type) => navigate(`/editor?mode=${type}&documentId=${documentId}`);
  const handleDownload = async (documentId, name) => {
    try { await downloadDocumentAsTxt(documentId, `${name}.txt`); } catch { /* silent */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
    >
      {/* Row header */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <ScoreRing score={app.matchScore} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{app.jobTitle}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Building2 className="w-3 h-3 shrink-0" />{app.company || "Unknown"}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`hidden sm:inline text-xs font-medium px-2.5 py-0.5 rounded-full border ${status.color}`}>{status.label}</span>
          <span className="text-xs text-slate-500 hidden md:flex items-center gap-1"><Calendar className="w-3 h-3" />{date}</span>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/applications/${app._id}`); }}
            className="text-xs text-sky-400 border border-sky-500/30 px-3 py-1 rounded-lg hover:bg-sky-500/10 transition-colors"
          >Details</button>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expanded assets */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="border-t border-white/10 px-4 py-4 space-y-3"
          >
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Generated Assets</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <AssetButton
                label="Resume" icon={FileText} documentId={app.assets?.resumeId}
                onOpen={() => openEditor(app.assets?.resumeId, "resume")}
                onDownload={() => handleDownload(app.assets?.resumeId, `${app.jobTitle}_Resume`)}
              />
              <AssetButton
                label="Cover Letter" icon={FileText} documentId={app.assets?.coverLetterId}
                onOpen={() => openEditor(app.assets?.coverLetterId, "cover-letter")}
                onDownload={() => handleDownload(app.assets?.coverLetterId, `${app.jobTitle}_Cover_Letter`)}
              />
              <AssetButton
                label="Cold Mail" icon={Mail} documentId={app.assets?.coldMailId}
                onOpen={() => openEditor(app.assets?.coldMailId, "cold-mail")}
                onDownload={() => handleDownload(app.assets?.coldMailId, `${app.jobTitle}_Cold_Mail`)}
              />
            </div>
            {/* Skill chips */}
            {app.matchedSkills?.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {app.matchedSkills.slice(0, 6).map((s) => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">{s}</span>
                ))}
                {app.matchedSkills.length > 6 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">+{app.matchedSkills.length - 6}</span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RoleApplications() {
  const { roleName } = useParams();
  const navigate = useNavigate();
  const decodedRole = decodeURIComponent(roleName || "");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApps = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // Fetch all apps for this role (large limit)
      const data = await getApplications(1, 50, decodedRole === "General" ? "" : decodedRole);
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }, [decodedRole]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const avgScore = applications.length > 0
    ? Math.round(applications.reduce((s, a) => s + (a.matchScore || 0), 0) / applications.length) : 0;
  const totalAssets = applications.reduce((s, a) =>
    s + (a.assets?.resumeId ? 1 : 0) + (a.assets?.coverLetterId ? 1 : 0) + (a.assets?.coldMailId ? 1 : 0), 0);

  return (
    <div className="min-h-screen bg-main pt-24 lg:pt-32 pb-20 px-6 lg:px-20 relative z-10 overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Back */}
        <button
          onClick={() => navigate("/applications")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Applications
        </button>

        {/* Header */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-sm p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-400 mb-2">Target Role</p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-sky-400 shrink-0" />
            {decodedRole}
          </h1>
          {!loading && (
            <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{applications.length} application{applications.length !== 1 ? "s" : ""}</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" />Avg score: <strong className="text-sky-400">{avgScore}%</strong></span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" />{totalAssets} asset{totalAssets !== 1 ? "s" : ""} generated</span>
            </div>
          )}
        </div>

        {/* Applications list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-3">{error}</p>
            <button onClick={fetchApps} className="text-sky-400 hover:underline text-sm">Try again</button>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No applications found for this role.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app, i) => (
              <ApplicationRow key={app._id} app={app} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
