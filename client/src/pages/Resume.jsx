import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function Resume() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    api("/api/documents")
      .then((res) => {
        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return [];
        }
        return res.json();
      })
      .then(setResumes)
      .catch(() => setResumes([]))
      .finally(() => setLoading(false));
  }, [logout, navigate]);

  const createResume = async () => {
    const res = await api("/api/documents", {
      method: "POST",
      body: JSON.stringify({ title: "Untitled Resume", type: "resume" }),
    });
    const data = await res.json();
    if (!res.ok) return;
    navigate(`/editor?mode=resume&resumeId=${data.id}`);
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-main pt-28 px-6"
    >
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            My Resumes
          </h1>
          <p className="text-secondary mt-1">
            Manage and refine your resumes.
          </p>
        </div>

        {/* Resume Grid */}
        {loading && <p className="text-slate-500">Loading your documents…</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {resumes.map((resume) => (
            <Card
              key={resume.id}
              className="bg-white/80 backdrop-blur border border-sky-100"
            >
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-medium text-slate-900">
                    {resume.title}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Last edited: {resume.updated_at}
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`/editor?mode=resume&resumeId=${resume.id}`)
                  }
                >
                  Open →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create */}
        <Button
          onClick={createResume}
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white"
        >
          + Create New Resume
        </Button>
      </div>
    </motion.main>
  );
}
