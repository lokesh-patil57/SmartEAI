import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function Dashboard() {
  return (
    <div className="min-h-screen bg-main pt-28 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-slate-900">
            Smart<span className="text-sky-600">EAI</span> Dashboard
          </h1>
          <p className="text-secondary max-w-xl">
            Analyze your resume, match it with internships, and generate
            job-ready application content using AI.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Resume Upload */}
          <Card className="
            md:col-span-1
            bg-white/80 backdrop-blur
            border border-sky-100
            hover:border-sky-300
            hover:shadow-xl
            transition-all duration-300
            hover:-translate-y-1
          ">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                📄 Upload Resume
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="file" />
              <Button
                className="
                  w-full
                  bg-gradient-to-r from-sky-500 to-blue-600
                  hover:from-sky-600 hover:to-blue-700
                  text-white
                "
              >
                Upload Resume
              </Button>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="
            md:col-span-2
            bg-white/80 backdrop-blur
            border border-blue-100
            hover:border-blue-300
            hover:shadow-xl
            transition-all duration-300
            hover:-translate-y-1
          ">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                📝 Job Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                rows={6}
                placeholder="Paste internship or job description here..."
              />
              <Button
                className="
                  w-full
                  bg-gradient-to-r from-sky-500 to-blue-600
                  hover:from-sky-600 hover:to-blue-700
                  text-white
                "
              >
                Analyze Job
              </Button>
            </CardContent>
          </Card>

          {/* Match Overview */}
          <Card className="
            md:col-span-3
            bg-white/80 backdrop-blur
            border border-indigo-100
            hover:shadow-xl
            transition-all duration-300
          ">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                📊 Match Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                {/* Skill Match */}
                <div className="
                  p-6 rounded-xl
                  bg-gradient-to-br from-sky-50 to-blue-50
                  border border-sky-100
                  text-center
                  hover:shadow-md transition
                ">
                  <p className="text-sm text-secondary mb-1">
                    Skill Match
                  </p>
                  <h3 className="text-3xl font-bold text-sky-600">
                    — %
                  </h3>
                </div>

                {/* ATS Score */}
                <div className="
                  p-6 rounded-xl
                  bg-gradient-to-br from-blue-50 to-indigo-50
                  border border-blue-100
                  text-center
                  hover:shadow-md transition
                ">
                  <p className="text-sm text-secondary mb-1">
                    ATS Score
                  </p>
                  <h3 className="text-3xl font-bold text-blue-600">
                    — / 100
                  </h3>
                </div>

                {/* Missing Skills */}
                <div className="
                  p-6 rounded-xl
                  bg-gradient-to-br from-slate-50 to-slate-100
                  border border-slate-200
                  text-center
                  hover:shadow-md transition
                ">
                  <p className="text-sm text-secondary mb-1">
                    Missing Skills
                  </p>
                  <h3 className="text-base font-semibold text-slate-800">
                    —
                  </h3>
                </div>

              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
