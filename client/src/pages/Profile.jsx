import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, updateProfile, updateProfileResume, parseResumeFile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, FileText, Upload, Save, Edit2, Check, X } from "lucide-react";

export default function Profile() {
  const { user: contextUser, refreshUser } = useAuth();
  const [user, setUser] = useState(contextUser);
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || "");
  const [message, setMessage] = useState(null);
  const [resumePreview, setResumePreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setNameValue(user.name || "");
      setResumePreview(user.resumeText || "");
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to load profile" });
    }
  };

  const handleSaveName = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const updated = await updateProfile({ name: nameValue });
      setUser(updated);
      await refreshUser();
      setEditingName(false);
      setMessage({ type: "success", text: "Name updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update name" });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadResume = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setLoading(true);
    setMessage(null);
    try {
      const text = await parseResumeFile(file);
      const updated = await updateProfileResume(text);
      setUser(updated);
      await refreshUser();
      setResumePreview(text);
      setMessage({ type: "success", text: "Resume updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to upload resume" });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdateResumeText = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const updated = await updateProfileResume(resumePreview);
      setUser(updated);
      await refreshUser();
      setMessage({ type: "success", text: "Resume updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update resume" });
    } finally {
      setLoading(false);
    }
  };

  const resumeWordCount = resumePreview.split(/\s+/).filter((w) => w.length > 0).length;
  const resumeCharCount = resumePreview.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 lg:pt-32 pb-20 px-6 lg:px-20 relative z-10 overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        <header>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">My Profile</h1>
          <p className="text-slate-600 max-w-2xl mt-2">
            Manage your account details and resume.
          </p>
        </header>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal details and account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email - Read-only */}
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                <Mail size={16} />
                Email
              </label>
              <Input value={user?.email || ""} disabled className="bg-slate-50" />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Name - Editable */}
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                <User size={16} />
                Name
              </label>
              {editingName ? (
                <div className="flex gap-2">
                  <Input
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    placeholder="Enter your name"
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveName}
                    disabled={loading}
                    className="bg-[#2369EB] text-white"
                  >
                    <Check size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNameValue(user?.name || "");
                      setEditingName(false);
                    }}
                    disabled={loading}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={user?.name || "Not set"}
                    disabled
                    className="bg-slate-50 flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingName(true)}
                  >
                    <Edit2 size={16} />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resume Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Resume
            </CardTitle>
            <CardDescription>
              Upload or edit your resume. It will be used for matching with job descriptions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Resume */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Upload Resume File
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Supported formats: PDF, DOCX, DOC, TXT (max 10 MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
                onChange={handleUploadResume}
                disabled={loading}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                variant="outline"
                className="border-slate-300"
              >
                <Upload size={16} />
                {loading ? "Uploading..." : "Upload Resume File"}
              </Button>
            </div>

            {/* Resume Stats */}
            {resumePreview && (
              <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                <p>
                  <span className="font-medium">Word count:</span> {resumeWordCount.toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Character count:</span> {resumeCharCount.toLocaleString()}
                </p>
              </div>
            )}

            {/* Resume Text Editor */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Resume Text
              </label>
              <Textarea
                rows={12}
                value={resumePreview}
                onChange={(e) => setResumePreview(e.target.value)}
                placeholder="Paste or type your resume text here, or upload a file above..."
                className="font-mono text-sm"
                disabled={loading}
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleUpdateResumeText}
                  disabled={loading || !resumePreview.trim()}
                  className="bg-[#2369EB] text-white"
                >
                  <Save size={16} />
                  Save Resume Text
                </Button>
              </div>
            </div>

            {/* Resume Preview Info */}
            {user?.resumeText && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <p className="font-medium">✓ Resume saved on your profile</p>
                <p className="text-xs mt-1">
                  You can use this resume on the Match page by clicking "Use my profile resume"
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>
              <span className="font-medium">Account ID:</span> {user?.id || "N/A"}
            </p>
            <p>
              <span className="font-medium">Resume Status:</span>{" "}
              {user?.resumeText ? (
                <span className="text-green-600">✓ Saved</span>
              ) : (
                <span className="text-amber-600">Not uploaded</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
