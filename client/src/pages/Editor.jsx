import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = "http://127.0.0.1:5000";

const steps = [
  "Understanding Resume",
  "Analyzing Job Description",
  "Matching Skills",
  "Choosing Tone",
  "Generating Content",
];

function Editor() {
  // ✅ Hooks at top (RULES OF HOOKS)
  const [activeStep, setActiveStep] = useState(2);
  const [content, setContent] = useState("");

  // ✅ TXT download
  const handleTXTDownload = () => {
    if (!content.trim()) {
      alert("Nothing to download!");
      return;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "SmartEAI_Content.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  // ✅ PDF download
  const handlePDFDownload = async () => {
    if (!content.trim()) {
      alert("Nothing to download!");
      return;
    }

    const response = await fetch(`${API_BASE}/download/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "SmartEAI_Content.pdf";
    a.click();

    URL.revokeObjectURL(url);
  };

  // ✅ DOCX download
  const handleDOCXDownload = async () => {
    if (!content.trim()) {
      alert("Nothing to download!");
      return;
    }

    const response = await fetch(`${API_BASE}/download/docx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "SmartEAI_Content.docx";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-main pt-28 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Panel */}
        <Card className="lg:col-span-1 bg-white/80 backdrop-blur border border-sky-100">
          <CardHeader>
            <CardTitle>AI Writing Process</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="relative mt-6 pl-4">
              <div className="absolute left-[6px] top-1 bottom-1 w-px bg-sky-200" />

              {steps.map((step, index) => {
                const isActive = index <= activeStep;

                return (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-center gap-3 mb-4"
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isActive
                          ? "bg-gradient-to-r from-sky-500 to-blue-600"
                          : "bg-slate-300"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        isActive
                          ? "text-slate-900 font-medium"
                          : "text-slate-400"
                      }`}
                    >
                      {step}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel */}
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur border border-blue-100">
          <CardHeader>
            <CardTitle>Generated Content (Editable)</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Textarea
              rows={14}
              className="resize-none"
              placeholder="AI-generated cover letter or cold mail will appear here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                onClick={() =>
                  setActiveStep((prev) =>
                    prev < steps.length - 1 ? prev + 1 : prev
                  )
                }
              >
                Simulate Next Step
              </Button>

              <Button variant="outline" className="flex-1" onClick={handleTXTDownload}>
                TXT
              </Button>

              <Button variant="outline" className="flex-1" onClick={handlePDFDownload}>
                PDF
              </Button>

              <Button variant="outline" className="flex-1" onClick={handleDOCXDownload}>
                DOCX
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default Editor;
