import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Download, FileText, Mail, RefreshCw,
  Search, Sparkles, Target, TrendingUp,
} from "lucide-react";
import { getApplicationsByRole, exportApplicationsCsv } from "@/lib/api";

const STATUS_CONFIG = {
  analyzed: { label: "Analyzed", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  applied:  { label: "Applied",  color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
  interview:{ label: "Interview",color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  offer:    { label: "Offer 🎉", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
};

function ScoreRing({ score = 0, size = 48 }) {
  const n = Math.max(0, Math.min(100, Number(score) || 0));
  const r = 16; const circ = 2 * Math.PI * r;
  const offset = circ - (n / 100) * circ;
  const color = n >= 70 ? "#22c55e" : n >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 40 40" className="-rotate-90">
        <circle cx="20" cy="20" r={r} stroke="#334155" strokeWidth="4" fill="none" />
        <circle cx="20" cy="20" r={r} stroke={color} strokeWidth="4" fill="none"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color }}>{n}%</div>
    </div>
  );
}

function StatsRow({ roles }) {
  const allApps = roles.flatMap((r) => r.applications || []);
  const avg = allApps.length > 0 ? Math.round(allApps.reduce((s, a) => s + (a.matchScore || 0), 0) / allApps.length) : 0;
  const offers = allApps.filter((a) => a.status === "offer").length;
  const interviews = allApps.filter((a) => a.status === "interview").length;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {[
        { label: "Target Roles", value: roles.length, icon: Target, color: "text-sky-400" },
        { label: "Total Apps", value: allApps.length, icon: Briefcase, color: "text-violet-400" },
        { label: "Avg Score", value: `${avg}%`, icon: TrendingUp, color: "text-amber-400" },
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

function RoleCard({ role, index }) {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[role.latestStatus] || STATUS_CONFIG.analyzed;
  const totalAssets = role.assetCounts.resume + role.assetCounts.coverLetter + role.assetCounts.coldMail;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }} whileHover={{ y: -4, scale: 1.01 }}
      onClick={() => navigate(`/applications/role/${encodeURIComponent(role.targetRole)}`)}
      className="group cursor-pointer relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-sm hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 p-5 flex flex-col gap-4"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-sky-400 shrink-0" />
            <h3 className="font-bold text-base leading-snug truncate">{role.targetRole}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {role.count} application{role.count !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${status.color}`}>{status.label}</span>
        </div>
      </div>

      {/* Average score bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Avg Match Score</span>
          <span className="font-semibold text-sky-400">{role.averageScore}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${role.averageScore}%` }}
            transition={{ duration: 0.8, delay: index * 0.06 + 0.2 }}
            className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full"
          />
        </div>
      </div>

      {/* Individual score rings */}
      {role.applications?.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Individual Scores</p>
          <div className="flex flex-wrap gap-2 items-center">
            {role.applications.slice(0, 6).map((app) => (
              <div key={app._id} className="flex flex-col items-center gap-0.5">
                <ScoreRing score={app.matchScore} size={40} />
                <span className="text-[9px] text-slate-500 truncate max-w-[52px] text-center leading-tight">
                  {app.company?.split(" ")[0] || "—"}
                </span>
              </div>
            ))}
            {role.applications.length > 6 && (
              <span className="text-[10px] text-slate-400 px-2 py-1 border border-white/10 rounded-lg">
                +{role.applications.length - 6}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Asset counts */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-white/5 pt-3 mt-auto">
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3" />{role.assetCounts.resume} resume{role.assetCounts.resume !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3" />{role.assetCounts.coverLetter} cover letter{role.assetCounts.coverLetter !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Mail className="w-3 h-3" />{role.assetCounts.coldMail} cold mail{role.assetCounts.coldMail !== 1 ? "s" : ""}
        </span>
        <span className="ml-auto text-sky-400 font-medium">{totalAssets} asset{totalAssets !== 1 ? "s" : ""} →</span>
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
        <Target className="w-8 h-8 text-sky-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        Run an ATS match analysis to create your first application record. You'll be asked for a target role to group them.
      </p>
      <button onClick={() => navigate("/match")} className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-colors">
        Run ATS Match
      </button>
    </motion.div>
  );
}

export default function Applications() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getApplicationsByRole();
      setRoles(data.roles || []);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

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
    ? roles.filter((r) => r.targetRole.toLowerCase().includes(search.toLowerCase()))
    : roles;

  return (
    <div className="min-h-screen bg-main pt-24 lg:pt-32 pb-20 px-6 lg:px-20 relative z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-1">Your <span className="text-sky-400">Applications</span></h1>
            <p className="text-muted-foreground text-sm">Grouped by target role. Click a card to see all applications and resources.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={fetchRoles} className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleExportCsv} disabled={exporting || roles.length === 0} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium">
              <Download className="w-4 h-4" />{exporting ? "Exporting…" : "Export CSV"}
            </button>
          </div>
        </div>

        {!loading && !error && roles.length > 0 && <StatsRow roles={roles} />}

        {roles.length > 0 && (
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Filter by role name…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-sky-500/50 placeholder:text-muted-foreground" />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchRoles} className="text-sky-400 hover:underline text-sm">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((role, i) => <RoleCard key={role.targetRole} role={role} index={i} />)}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
