import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { parseResumeFile, updateProfileResume } from "@/lib/api";
import { Button } from "@/components/ui/button";

function Home() {
  const { isLoggedIn, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleUploadResume = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    if (!isLoggedIn) {
      setUploadMessage({ type: "error", text: "Please sign in to save your resume to your profile." });
      return;
    }
    setUploadMessage(null);
    setUploading(true);
    try {
      const text = await parseResumeFile(file);
      await updateProfileResume(text);
      await refreshUser();
      setUploadMessage({ type: "success", text: "Resume saved to your profile. Use it on the Match page." });
    } catch (err) {
      setUploadMessage({ type: "error", text: err.message || "Failed to upload resume." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-main pt-28 px-6">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-4">
          Welcome to <span className="text-sky-600">SmartEAI</span>
        </h1>

        <p className="text-secondary mb-10 max-w-xl">
          Choose what you want to work on. SmartEAI helps you move from
          unstructured input to ready-to-apply documents.
        </p>

        <p className="text-slate-600 mb-6">
          Go to Dashboard to choose a mode, or start matching your resume to a job.
        </p>

        {/* Upload resume to profile */}
        <div className="mb-8 p-6 rounded-xl bg-white border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">📄 Save your resume to your profile</h3>
          <p className="text-slate-600 mb-4 text-sm">
            Upload your resume (PDF, DOCX, or TXT). It will be stored on your profile and used on the Match page when reviewing or matching to job descriptions.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={handleUploadResume}
            disabled={uploading}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[#2369EB] text-white"
          >
            {uploading ? "Uploading..." : "Upload resume to my profile"}
          </Button>
          {!isLoggedIn && (
            <p className="text-amber-600 text-sm mt-2">
              <Link to="/login" className="underline">Sign in</Link> to save your resume to your profile.
            </p>
          )}
          {uploadMessage && (
            <p className={`text-sm mt-2 ${uploadMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {uploadMessage.text}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link to="/dashboard">
            <div className="p-6 rounded-xl bg-white border border-slate-200 hover:border-[#2369EB] hover:shadow-lg transition cursor-pointer">
              <h3 className="text-xl font-semibold mb-2 text-[#2369EB]">📊 Dashboard</h3>
              <p className="text-slate-600">
                Choose Resume, Cover Letter, Cold Mail, or open the Editor.
              </p>
              <span className="text-sm font-medium text-[#2369EB] mt-2 inline-block">Go to Dashboard →</span>
            </div>
          </Link>

          <Link to="/match">
            <div className="p-6 rounded-xl bg-white border border-slate-200 hover:border-[#2369EB] hover:shadow-lg transition cursor-pointer">
              <h3 className="text-xl font-semibold mb-2 text-[#2369EB]">🎯 Resume ↔ Job Match</h3>
              <p className="text-slate-600">
                Paste resume and job description to get match score and suggestions.
              </p>
              <span className="text-sm font-medium text-[#2369EB] mt-2 inline-block">Start Matching →</span>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Home;
