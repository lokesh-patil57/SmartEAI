import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Download, CheckCircle2, Wand2, Edit3, Save, Mail, Send } from "lucide-react";
import { api } from "@/lib/api";
import Toast from "@/components/ui/toast";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

export default function Restructure() {
    const location = useLocation();
    const navigate = useNavigate();

    const [sourceText, setSourceText] = useState("");
    const [outputText, setOutputText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [toast, setToast] = useState(null);
    const [isEditable, setIsEditable] = useState(false);

    // Send Email State
    const [recipientEmail, setRecipientEmail] = useState("");
    const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

    // Mode Detection
    const mode = location.state?.mode || "restructure"; // 'restructure' | 'cover-letter' | 'cold-mail'
    const isCoverLetterMode = mode === "cover-letter";
    const isColdMailMode = mode === "cold-mail";
    const jobDescription = location.state?.job || "";

    // Context from navigation
    const role = location.state?.role || "Hiring Manager";
    const company = location.state?.company || "Target Company";

    useEffect(() => {
        if (location.state?.resume) {
            setSourceText(location.state.resume);
        }
    }, [location.state]);

    const handleAction = async () => {
        if (!sourceText) return;
        setIsProcessing(true);
        setIsEditable(false);

        try {
            let endpoint = "/improve/restructure";
            let body = { content: sourceText };

            if (isCoverLetterMode) {
                endpoint = "/improve/draft-cover-letter";
                body = { resume: sourceText, job: jobDescription };
            } else if (isColdMailMode) {
                endpoint = "/improve/draft-cold-mail";
                body = {
                    resume: sourceText,
                    context: jobDescription,
                    role: role,
                    company: company,
                    recipientType: "Recruiter" // Default
                };
            }

            const res = await api(endpoint, {
                method: "POST",
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                if ((isCoverLetterMode || isColdMailMode) && data.draft) {
                    setOutputText(data.draft);
                    const msg = isColdMailMode ? "Cold Mail drafted!" : "Cover Letter drafted!";
                    setToast({ type: "success", message: msg });
                } else if (!isCoverLetterMode && !isColdMailMode && data.restructured_content) {
                    setOutputText(data.restructured_content);
                    setToast({ type: "success", message: "Resume restructured!" });
                } else {
                    throw new Error("No content returned");
                }
            } else {
                throw new Error(data.error || "Failed to process");
            }
        } catch (err) {
            console.error(err);
            setToast({ type: "error", message: err.message || "Operation failed." });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSendEmail = () => {
        if (!recipientEmail || !outputText) return;

        // Simple parse for subject line (assumes AI follows format "Subject: ...")
        let subject = "Inquiry regarding Role";
        let body = outputText;

        const subjectMatch = outputText.match(/^Subject:\s*(.*?)(\n|$)/i);
        if (subjectMatch) {
            subject = subjectMatch[1].trim();
            // Remove the subject line from the body for the email content if preferred, 
            // but often keep it. Let's keep it clean: strip it from body for the mailto payload.
            body = outputText.replace(/^Subject:.*?\n+/i, "").trim();
        }

        const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
        setIsSendDialogOpen(false);
        setToast({ type: "success", message: "Opening mail client..." });
    };

    const downloadFile = async (type) => {
        if (!outputText.trim()) return;
        try {
            let blob;
            if (type === "txt") {
                blob = new Blob([outputText], { type: "text/plain" });
            } else {
                const res = await api(`/download/${type}`, {
                    method: "POST",
                    body: JSON.stringify({ content: outputText }),
                });
                blob = await res.blob();
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            let name = "Restructured_Resume";
            if (isCoverLetterMode) name = "Cover_Letter";
            if (isColdMailMode) name = "Cold_Mail";
            a.download = `${name}.${type}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            setToast({ type: "error", message: "Export failed" });
        }
    };

    const getTitle = () => {
        if (isColdMailMode) return "Cold Mail Studio";
        if (isCoverLetterMode) return "Cover Letter Studio";
        return "Resume Styling Studio";
    };

    const getDescription = () => {
        if (isColdMailMode) return "Draft high-impact cold emails optimized for response rates.";
        if (isCoverLetterMode) return "Generate a tailored cover letter based on your resume and job description.";
        return "Structure with ATS standards, then download.";
    };

    const getButtonIcon = () => {
        if (isProcessing) return <Loader2 className="w-4 h-4 mr-2 animate-spin" />;
        if (isColdMailMode) return <Mail className="w-4 h-4 mr-2" />;
        if (isCoverLetterMode) return <Wand2 className="w-4 h-4 mr-2" />;
        return <CheckCircle2 className="w-4 h-4 mr-2" />;
    };

    const getButtonText = () => {
        if (outputText) return `Regenerate ${isColdMailMode ? 'Email' : isCoverLetterMode ? 'Letter' : 'Style'}`;
        if (isColdMailMode) return "Generate Cold Mail";
        if (isCoverLetterMode) return "Generate Cover Letter";
        return "Restructure (ATS)";
    };

    const getThemeColor = () => {
        if (isColdMailMode) return "cyan";
        if (isCoverLetterMode) return "emerald";
        return "blue";
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
                        <h1 className="text-3xl font-bold text-slate-900">
                            {getTitle()}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {getDescription()}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={handleAction}
                            disabled={isProcessing || !sourceText}
                            className={`shadow-md transition-all ${outputText
                                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                                    : isColdMailMode
                                        ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-200'
                                        : isCoverLetterMode
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                                            : 'bg-[#2369EB] hover:bg-blue-700 text-white shadow-blue-200'
                                }`}
                        >
                            {getButtonIcon()}
                            {getButtonText()}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* SOURCE CARD */}
                    <Card className="h-[75vh] flex flex-col border-slate-200 shadow-sm">
                        <CardHeader className="py-3 border-b bg-slate-50/50">
                            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {isCoverLetterMode || isColdMailMode ? "Improved Resume (Reference)" : "Source Content"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 min-h-0 overflow-hidden">
                            <Textarea
                                value={sourceText}
                                onChange={(e) => setSourceText(e.target.value)}
                                readOnly={isCoverLetterMode || isColdMailMode}
                                className={`w-full h-full p-6 resize-none border-0 focus:ring-0 text-sm font-mono text-slate-600 bg-transparent leading-relaxed overflow-y-auto [&::-webkit-scrollbar]:hidden ${isCoverLetterMode || isColdMailMode ? 'cursor-default opacity-80' : ''}`}
                                placeholder="Paste your original resume text here..."
                            />
                        </CardContent>
                    </Card>

                    {/* OUTPUT CARD */}
                    <Card className={`h-[75vh] flex flex-col border-slate-200 shadow-xl transition-all ${outputText ? `ring-2 ring-${getThemeColor()}-500/20` : ''}`}>
                        <CardHeader className="py-3 border-b bg-white flex flex-row items-center justify-between">
                            <CardTitle className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isColdMailMode ? 'text-cyan-600' : isCoverLetterMode ? 'text-emerald-600' : 'text-[#2369EB]'
                                }`}>
                                {isProcessing
                                    ? (isColdMailMode ? "Drafting..." : "Restructuring...")
                                    : (isColdMailMode ? "Cold Mail Draft" : isCoverLetterMode ? "Cover Letter Draft" : "Final Output")}
                            </CardTitle>

                            <div className="flex items-center gap-2">
                                {outputText && (
                                    <>
                                        {isColdMailMode && (
                                            <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" className="h-8 gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm">
                                                        <Send className="w-3.5 h-3.5" /> Send Email
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Send Cold Mail</DialogTitle>
                                                        <DialogDescription>
                                                            Enter the recipient's email address. We'll open your default mail client with the subject and body pre-filled.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="email" className="text-right">
                                                                To:
                                                            </Label>
                                                            <Input
                                                                id="email"
                                                                placeholder="recruiter@example.com"
                                                                className="col-span-3"
                                                                value={recipientEmail}
                                                                onChange={(e) => setRecipientEmail(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="submit" onClick={handleSendEmail}>Open Mail Client</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 gap-1.5 text-xs text-slate-500 hover:text-slate-900"
                                            onClick={() => setIsEditable(!isEditable)}
                                        >
                                            {isEditable ? (
                                                <><Save className="w-3.5 h-3.5" /> Done Editing</>
                                            ) : (
                                                <><Edit3 className="w-3.5 h-3.5" /> Edit</>
                                            )}
                                        </Button>
                                        <div className="h-4 w-px bg-slate-200 mx-1" />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                                                    <Download className="w-3.5 h-3.5" /> Export
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => downloadFile("txt")}>Text (.txt)</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => downloadFile("docx")}>Word (.docx)</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => downloadFile("pdf")}>PDF (.pdf)</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 bg-white relative min-h-0 overflow-hidden">
                            {isProcessing ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10">
                                    <Loader2 className={`w-10 h-10 ${isColdMailMode ? 'text-cyan-600' : isCoverLetterMode ? 'text-emerald-600' : 'text-blue-600'
                                        } animate-spin mb-4`} />
                                    <p className="text-slate-600 font-medium animate-pulse">
                                        {isColdMailMode ? "AI is crafting your cold email..." : isCoverLetterMode ? "AI is crafting your cover letter..." : "Restructuring logic & sections..."}
                                    </p>
                                </div>
                            ) : (
                                <Textarea
                                    value={outputText}
                                    onChange={(e) => setOutputText(e.target.value)}
                                    readOnly={!isEditable && !isProcessing && outputText}
                                    className={`w-full h-full p-8 resize-none border-0 focus:ring-0 text-sm leading-7 font-sans overflow-y-auto [&::-webkit-scrollbar]:hidden ${isEditable ? 'text-slate-900 bg-slate-50' : 'text-slate-800'
                                        }`}
                                    placeholder={
                                        isColdMailMode
                                            ? "Your AI-generated cold mail will appear here..."
                                            : isCoverLetterMode
                                                ? "Your AI-generated cover letter will appear here..."
                                                : "The formatted resume will appear here..."
                                    }
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
