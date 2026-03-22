import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Download,
  FileText,
  Mail,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";
import { downloadDocumentAsTxt, getApplicationById, updateApplicationStatus } from "@/lib/api";
import ApplicationTimeline from "@/components/applications/ApplicationTimeline";

const SkillCharts = lazy(() => import("@/components/applications/SkillCharts"));

const STATUS_OPTIONS = ["analyzed", "applied", "interview", "rejected", "offer"];

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <p className="font-semibold text-sm sm:text-base">{value || "—"}</p>
    </div>
  );
}

function SkillPill({ label, tone = "default" }) {
  const toneClass = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    default: "bg-white/5 text-foreground/90 border-white/10",
  }[tone];

  return <span className={`px-2.5 py-1 rounded-full border text-xs ${toneClass}`}>{typeof label === 'object' ? JSON.stringify(label) : label}</span>;
}

function AssetItem({ icon: Icon, title, documentId, type, onOpen, onDownload }) {
  const exists = Boolean(documentId);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-sky-400" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {exists ? `Document ID: ${documentId}` : `Not generated yet`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          disabled={!exists}
          className="px-3 py-1.5 rounded-lg text-xs border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => exists && onOpen()}
        >
          View
        </button>
        <button
          disabled={!exists}
          className="px-3 py-1.5 rounded-lg text-xs border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => exists && onOpen()}
        >
          Edit
        </button>
        <button
          disabled={!exists}
          className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Download"
          onClick={() => exists && onDownload()}
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getApplicationById(id);
        if (active) setApplication(data);
      } catch (err) {
        if (active) setError(err.message || "Failed to load application");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const createdDate = useMemo(() => {
    if (!application?.createdAt) return "—";
    return new Date(application.createdAt).toLocaleString();
  }, [application?.createdAt]);

  const handleStatusChange = async (event) => {
    const nextStatus = event.target.value;
    if (!application?._id) return;
    setStatusLoading(true);
    try {
      const updated = await updateApplicationStatus(application._id, nextStatus);
      setApplication(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  const openEditor = (documentId, type) => {
    navigate(`/editor?mode=${type}&documentId=${documentId}`);
  };

  const handleDownload = async (documentId, title) => {
    try {
      const safeTitle = `${title || "SmartEAI_Document"}`.replace(/\s+/g, "_");
      await downloadDocumentAsTxt(documentId, `${safeTitle}.txt`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-main pt-28 px-4 sm:px-6 pb-16">
        <div className="max-w-7xl mx-auto space-y-5">
          <div className="h-12 w-40 rounded-xl bg-white/5 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 h-80 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            <div className="h-80 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-main pt-28 px-4 sm:px-6 pb-16">
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-red-400 mb-4">{error || "Application not found"}</p>
          <button onClick={() => navigate("/applications")} className="text-sky-400 hover:underline text-sm">
            Back to applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main pt-28 px-4 sm:px-6 pb-16">
      <div className="max-w-7xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/applications")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to applications
        </button>

        <div className="rounded-3xl border border-white/10 bg-linear-to-br from-white/8 to-white/3 backdrop-blur-sm p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sky-400 mb-2">Application Analytics</p>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{application.jobTitle}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Building2 className="w-4 h-4" />{application.company || "Unknown Company"}</span>
                <span className="inline-flex items-center gap-1"><Sparkles className="w-4 h-4" />{application.matchScore || 0}% match</span>
                <span className="inline-flex items-center gap-1"><FileText className="w-4 h-4" />Created {createdDate}</span>
              </div>
            </div>
            <div className="w-full lg:w-64">
              <label className="block text-xs text-muted-foreground mb-2">Application Status</label>
              <select
                value={application.status}
                onChange={handleStatusChange}
                disabled={statusLoading}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-sky-500/50"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status} className="bg-slate-950">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
              <h2 className="text-xl font-semibold mb-4">Job Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard icon={Briefcase} label="Job Title" value={application.jobTitle} />
                <InfoCard icon={Building2} label="Company" value={application.company} />
                <InfoCard icon={Briefcase} label="Job Type" value={application.jobType} />
                <InfoCard icon={Wallet} label="Stipend" value={application.stipend} />
                <InfoCard icon={MapPin} label="Location" value={application.location} />
                <InfoCard icon={Sparkles} label="Match Score" value={`${application.matchScore || 0}%`} />
              </div>
              <div className="mt-5">
                <h3 className="text-sm font-medium mb-2 text-muted-foreground">Job Description</h3>
                <div className="rounded-xl border border-white/10 bg-black/10 p-4 text-sm leading-6 whitespace-pre-wrap max-h-72 overflow-auto">
                  {application.jobDescription || "No job description available."}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
              <h2 className="text-xl font-semibold mb-4">Match Analysis</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Matched Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {application.matchedSkills?.length
                      ? application.matchedSkills.map((skill) => <SkillPill key={skill} label={skill} tone="success" />)
                      : <SkillPill label="No matched skills found" />}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {application.missingSkills?.length
                      ? application.missingSkills.map((skill) => <SkillPill key={skill} label={skill} tone="warning" />)
                      : <SkillPill label="No missing skills" tone="success" />}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {application.requiredSkills?.length
                      ? application.requiredSkills.map((skill) => <SkillPill key={skill} label={skill} />)
                      : <SkillPill label="No required skills extracted" />}
                  </div>
                </div>
              </div>
            </section>

            <Suspense
              fallback={<div className="rounded-2xl border border-white/10 bg-white/5 p-5 h-85 animate-pulse" />}
            >
              <SkillCharts
                requiredSkills={application.requiredSkills || []}
                matchedSkills={application.matchedSkills || []}
                missingSkills={application.missingSkills || []}
              />
            </Suspense>
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
              <h2 className="text-xl font-semibold mb-4">Generated Assets</h2>
              <div className="space-y-3">
                <AssetItem icon={FileText} title="Resume" documentId={application.assets?.resumeId} type="resume" onOpen={() => openEditor(application.assets?.resumeId, "resume")} onDownload={() => handleDownload(application.assets?.resumeId, `${application.jobTitle}_Resume`)} />
                <AssetItem icon={FileText} title="Cover Letter" documentId={application.assets?.coverLetterId} type="cover-letter" onOpen={() => openEditor(application.assets?.coverLetterId, "cover-letter")} onDownload={() => handleDownload(application.assets?.coverLetterId, `${application.jobTitle}_Cover_Letter`)} />
                <AssetItem icon={Mail} title="Cold Mail" documentId={application.assets?.coldMailId} type="cold-mail" onOpen={() => openEditor(application.assets?.coldMailId, "cold-mail")} onDownload={() => handleDownload(application.assets?.coldMailId, `${application.jobTitle}_Cold_Mail`)} />
              </div>
            </section>

            <ApplicationTimeline timeline={application.timeline || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
