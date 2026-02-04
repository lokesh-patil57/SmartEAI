import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Download, CheckCircle2, FileUp, Wand2 } from "lucide-react";
import { api, parseResumeFile } from "@/lib/api";
import Toast from "@/components/ui/toast";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Restructure() {
    const location = useLocation();
    const navigate = useNavigate();
    const templateInputRef = useRef(null);

    const [resumeText, setResumeText] = useState("");
    const [templateText, setTemplateText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFormatting, setIsFormatting] = useState(false);
    const [restructuredText, setRestructuredText] = useState("");
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (location.state?.resume) {
            setResumeText(location.state.resume);
        }
    }, [location.state]);

    const handleRestructure = async () => {
        if (!resumeText) return;
        setIsProcessing(true);
        // don't clear text to allow refinement

        try {
            const res = await api("/improve/restructure", {
                method: "POST",
                body: JSON.stringify({ content: resumeText }),
            });

            const data = await res.json();
            if (res.ok && data.restructured_content) {
                setRestructuredText(data.restructured_content);
                setToast({ type: "success", message: "Resume restructured successfully!" });
            } else {
                throw new Error(data.error || "Failed to restructure");
            }
        } catch (err) {
            console.error(err);
            setToast({ type: "error", message: "Failed to process resume." });
        } finally {
            setIsProcessing(false);
        }
    };

    /*
    const handleUploadTemplate = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await parseResumeFile(file);
        setTemplateText(text);
        setToast({ type: "success", message: "Template loaded! Now click Apply." });
      } catch (err) {
        setToast({ type: "error", message: "Failed to read template file." });
      }
    };
  
    const handleFormat = async () => {
      if (!restructuredText || !templateText) return;
      setIsFormatting(true);
      
      try {
        const res = await api("/improve/format", {
          method: "POST",
          body: JSON.stringify({ content: restructuredText, template: templateText }),
        });
        
        const data = await res.json();
        if (res.ok && data.formatted_content) {
          setRestructuredText(data.formatted_content);
          setToast({ type: "success", message: "Style applied successfully!" });
        } else {
          throw new Error(data.error || "Failed to apply format");
        }
      } catch (err) {
        setToast({ type: "error", message: "Formatting failed." });
      } finally {
        setIsFormatting(false);
      }
    };
  */

    const downloadFile = async (type) => {
        if (!restructuredText.trim()) return;
        try {
            let blob;
            if (type === "txt") {
                blob = new Blob([restructuredText], { type: "text/plain" });
            } else {
                const res = await api(`/download/${type}`, {
                    method: "POST",
                    body: JSON.stringify({ content: restructuredText }),
                });
                blob = await res.blob();
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Formatted_Resume.${type}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            setToast({ type: "error", message: "Export failed" });
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-28 px-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <Button variant="ghost" className="mb-2 -ml-2 text-slate-500 hover:text-slate-900" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-900">Resume Styling Studio</h1>
                        <p className="text-slate-500 mt-1">Structure with ATS standards, then apply any template style you like.</p>
                    </div>

                    <div className="flex gap-3">
                        {/* Step 1 Button */}
                        <Button
                            onClick={handleRestructure}
                            disabled={isProcessing || !resumeText}
                            variant={restructuredText ? "outline" : "default"}
                            className={`${!restructuredText ? 'bg-[#2369EB] text-white' : 'border-blue-200 text-blue-600'} shadow-sm`}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                            )}
                            1. Restructure (ATS)
                        </Button>

                        {/* 
            // Step 2 Inputs 
            {restructuredText && (
               <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  <input 
                    type="file" 
                    ref={templateInputRef}
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    onChange={handleUploadTemplate}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => templateInputRef.current?.click()}
                    className={templateText ? "border-green-200 bg-green-50 text-green-700" : "border-slate-300"}
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    {templateText ? "Template Loaded" : "Upload Template"}
                  </Button>
                  
                  <Button
                    onClick={handleFormat}
                    disabled={!templateText || isFormatting}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20"
                  >
                    {isFormatting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    Apply Style
                  </Button>
               </div>
            )}
            */}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* ORIGINAL */}
                    <Card className="h-[75vh] flex flex-col border-slate-200 shadow-sm">
                        <CardHeader className="py-3 border-b bg-slate-50/50">
                            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source Content</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <Textarea
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                className="w-full h-full p-6 resize-none border-0 focus:ring-0 text-sm font-mono text-slate-600 bg-transparent leading-relaxed"
                                placeholder="Paste your original resume text here..."
                            />
                        </CardContent>
                    </Card>

                    {/* RESULT */}
                    <Card className={`h-[75vh] flex flex-col border-slate-200 shadow-xl transition-all ${restructuredText ? 'ring-2 ring-blue-500/20' : ''}`}>
                        <CardHeader className="py-3 border-b bg-white flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-bold text-[#2369EB] uppercase tracking-wider flex items-center gap-2">
                                {isFormatting ? "Applying Style..." : "Final Output"}
                            </CardTitle>

                            {restructuredText && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                                            <Download className="w-3.5 h-3.5" /> Export Document
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => downloadFile("txt")}>Text (.txt)</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => downloadFile("docx")}>Word (.docx)</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => downloadFile("pdf")}>PDF (.pdf)</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </CardHeader>
                        <CardContent className="flex-1 p-0 bg-white relative">
                            {(isProcessing || isFormatting) ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10">
                                    <Loader2 className={`w-10 h-10 ${isFormatting ? 'text-purple-600' : 'text-blue-600'} animate-spin mb-4`} />
                                    <p className="text-slate-600 font-medium animate-pulse">
                                        {isFormatting ? "Transferring visual style from template..." : "Restructuring logic & sections..."}
                                    </p>
                                </div>
                            ) : (
                                <Textarea
                                    value={restructuredText}
                                    readOnly
                                    className="w-full h-full p-8 resize-none border-0 focus:ring-0 text-sm leading-7 text-slate-800 font-sans"
                                    placeholder="The formatted resume will appear here..."
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
