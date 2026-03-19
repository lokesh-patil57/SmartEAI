import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Building2, Calendar, ChevronLeft, ChevronRight,
  Download, FileText, RefreshCw, Search, Sparkles, TrendingUp,
} from "lucide-react";
import { getApplications, exportApplicationsCsv } from "@/lib/api";

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

function StatsRow({ applications }) {
  const avg = applications.length > 0
    ? Math.round(applications.reduce((s, a) => s + (a.matchScore || 0), 0) / applications.length) : 0;
  const offers = applications.filter((a) => a.status === "offer").length;
  const interviews = applications.filter((a) => a.status === "interview").length;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {[
        { label: "Total", value: applications.length, icon: Briefcase, color: "text-sky-400" },
        { label: "Avg Score", value: `${avg}%`, icon: TrendingUp, color: "text-violet-400" },
        { label: "Interviews", value: interviews, icon: Sparkles, color: "text-amber-400" },
        { label: "Offers", value: offers, icon: Sparkles, color: "text-emerald-400" },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex items-center gap-3">
          <Icon className={`w-5 h-5 ${color} shrink-0`} />
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ApplicationCard({ app, index }) {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.analyzed;
  const assetCount = (app.assets?.resumeId ? 1 : 0) + (app.assets?.coverLetterId ? 1 : 0) + (app.assets?.coldMailId ? 1 : 0);
  const date = app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
  const isLarge = index % 5 === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }} whileHover={{ y: -4, scale: 1.01 }}
      onClick={() => navigate(`/applications/${app._id}`)}
      className={`group cursor-pointer relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/8 to-white/3 backdrop-blur-sm hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 p-5 flex flex-col gap-3 ${isLarge ? "sm:col-span-2" : ""}`}
    >
      <div className="absolute inset-0 bg-linear-to-br from-sky-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base leading-snug truncate">{app.jobTitle}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
            <Building2 className="w-3 h-3 shrink-0" /><span className="truncate">{app.company}</span>
          </p>
        </div>
        <ScoreRing score={app.matchScore} />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${status.color}`}>{status.label}</span>
        {app.matchScore >= 70 && (
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Strong Match</span>
        )}
      </div>
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{app.matchedSkills?.length || 0} matched</span>
          <span>{app.missingSkills?.length || 0} missing</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${app.matchScore || 0}%` }}
            transition={{ duration: 0.8, delay: index * 0.05 + 0.2 }}
            className="h-full bg-linear-to-r from-sky-500 to-violet-500 rounded-full" />
        </div>
      </div>
      {app.matchedSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {app.matchedSkills.slice(0, 4).map((s) => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">{s}</span>
          ))}
          {app.matchedSkills.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">+{app.matchedSkills.length - 4}</span>
          )}
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2 border-t border-white/5">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{date}</span>
        <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{assetCount} asset{assetCount !== 1 ? "s" : ""}</span>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4">
        <Briefcase className="w-8 h-8 text-sky-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
      <p className="text-muted-foreground max-w-sm mb-6">Run an ATS match analysis to automatically create your first application record.</p>
      <button onClick={() => navigate("/match")} className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-colors">
        Run ATS Match
      </button>
    </motion.div>
  );
}

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft className="w-4 h-4" />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onPageChange(p)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-sky-600 text-white" : "border border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"}`}>{p}</button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= pages} className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchApplications = useCallback(async (p = 1) => {
    setLoading(true); setError(null);
    try {
      const data = await getApplications(p, 12);
      setApplications(data.applications || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchApplications(page); }, [fetchApplications, page]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await exportApplicationsCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "applications.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error(err); } finally { setExporting(false); }
  };

  const filtered = search.trim()
    ? applications.filter((a) => a.jobTitle?.toLowerCase().includes(search.toLowerCase()) || a.company?.toLowerCase().includes(search.toLowerCase()))
    : applications;

  return (
    <div className="min-h-screen bg-main pt-28 px-4 sm:px-6 pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-1">Your <span className="text-sky-400">Applications</span></h1>
            <p className="text-muted-foreground text-sm">Every ATS analysis automatically creates a tracked record here.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => fetchApplications(page)} className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleExportCsv} disabled={exporting || applications.length === 0} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium">
              <Download className="w-4 h-4" />{exporting ? "Exporting…" : "Export CSV"}
            </button>
          </div>
        </div>
        {!loading && !error && applications.length > 0 && <StatsRow applications={applications} />}
        {applications.length > 0 && (
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search by title or company…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-sky-500/50 placeholder:text-muted-foreground" />
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-52 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => fetchApplications(page)} className="text-sky-400 hover:underline text-sm">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((app, i) => <ApplicationCard key={app._id} app={app} index={i} />)}
            </div>
          </AnimatePresence>
        )}
        {!search && <Pagination pagination={pagination} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />}
      </div>
    </div>
  );
}
