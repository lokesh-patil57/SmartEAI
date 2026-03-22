import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { parseResumeFile, updateProfileResume } from "@/lib/api";
import {
  LayoutDashboard,
  Target,
  ArrowRight,
  Upload,
  CheckCircle2,
  XCircle,
  X,
  Check
} from 'lucide-react';

function Home() {
  const { isLoggedIn, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef(null);
  const [activeCard, setActiveCard] = useState(0);

  const handleUploadResume = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    if (!isLoggedIn) {
      setUploadMessage({ type: "error", text: "Please sign in to save your resume to your profile." });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }
    setUploadMessage(null);
    setUploading(true);
    try {
      const text = await parseResumeFile(file);
      await updateProfileResume(text);
      await refreshUser();
      setUploadMessage({ type: "success", text: "Resume saved to your profile. Use it on the Match page." });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      setUploadMessage({ type: "error", text: err.message || "Failed to upload resume." });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const features = [
    {
      id: 'upload',
      title: 'Save your resume to your profile',
      shortTitle: 'Upload Resume',
      desc: 'Upload your resume (PDF, DOCX, or TXT). It will be stored on your profile and used on the Match page when reviewing or matching to job descriptions.',
      btn:
        uploading
          ? 'Uploading...'
          : uploadMessage && uploadMessage.type === 'success'
            ? 'Resume Uploaded!'
            : 'Upload resume to my profile',
      icon: Upload,
      iconBg: 'bg-blue-100 text-blue-600',
      activeIconBg: 'bg-blue-600 text-white',
      action: () => fileInputRef.current?.click(),
      isLink: false,
      disabled: uploading,
      showReupload: uploadMessage && uploadMessage.type === 'success',
    },
    {
      id: 'dashboard',
      title: 'Open your Dashboard',
      shortTitle: 'Dashboard',
      desc: 'Choose Resume, Cover Letter, Cold Mail, or open the Editor. Manage all your generated documents in one unified workspace.',
      btn: 'Go to Dashboard',
      icon: LayoutDashboard,
      iconBg: 'bg-indigo-100 text-indigo-600',
      activeIconBg: 'bg-indigo-600 text-white',
      link: '/dashboard',
      isLink: true,
    },
    {
      id: 'match',
      title: 'Resume ↔ Job Match',
      shortTitle: 'Job Match',
      desc: 'Paste your resume and a target job description to get an instant match score and actionable formatting suggestions.',
      btn: 'Start Matching',
      icon: Target,
      iconBg: 'bg-rose-100 text-rose-600',
      activeIconBg: 'bg-rose-600 text-white',
      link: '/match',
      isLink: true,
    }
  ];

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-[#2369EB]/20 selection:text-[#2369EB] overflow-hidden flex flex-col"
    >

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-12 lg:pt-20 pb-8 px-6 lg:px-8 flex flex-col items-center relative z-10 overflow-y-auto">



        {/* Centered Hero Text */}
        <div className="flex flex-col items-center text-center w-full max-w-4xl mx-auto mb-8 animate-[fadeIn_1s_ease-out]">
          <h1 className="text-2xl md:text-5xl lg:text-[53px] font-black text-slate-900 tracking-tighter mb-4">
            Welcome to{" "}
            <span className="text-[#2369EB] inline-block">
              {"SmartEAI".split("").map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.8 + index * 0.1,
                    ease: [0.2, 0.65, 0.3, 0.9],
                  }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </h1>
          <p className="text-[14px] md:text-[15px] text-slate-600 leading-[1.6] max-w-2xl">
            Choose what you want to work on. SmartEAI is dedicated to{" "}
            <span className="text-[#2369EB] font-semibold">revolutionizing career prep</span>{" "}
            through intelligent formatting, enabling you to move from unstructured input to{" "}
            <span className="text-[#2369EB] font-semibold">ready-to-apply documents</span> in
            seconds.
          </p>
        </div>

        {/* Interactive Fluid Accordion - Centered Below */}
        <div className="w-full max-w-4xl h-[350px] lg:h-[450px] flex flex-col gap-1.5 lg:gap-2 animate-[fadeIn_1.2s_ease-out]">
          {features.map((feature, index) => {
            const isActive = activeCard === index;

            return (
              <div
                key={feature.id}
                onMouseEnter={() => setActiveCard(index)}
                className={`relative rounded-[2rem] border transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer overflow-hidden group flex flex-col justify-center
                  ${isActive
                    ? 'flex-[4] bg-white border-blue-200 shadow-2xl shadow-blue-900/10'
                    : 'flex-[1] bg-slate-50/60 border-slate-200/60 hover:bg-white hover:border-blue-100'}
                `}
              >
                <div className="px-6 md:px-8 flex flex-col justify-center h-full relative z-10">

                  {/* Header Row */}
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm shrink-0
                      ${isActive ? feature.activeIconBg + ' scale-110' : feature.iconBg + ' scale-100'}
                    `}>
                      <feature.icon size={16} className="stroke-[2]" />
                    </div>

                    <h2 className={`transition-all duration-500 whitespace-nowrap overflow-hidden text-ellipsis
                      ${isActive
                        ? 'text-lg lg:text-xl text-slate-900 font-bold tracking-tight'
                        : 'text-[13px] lg:text-sm text-slate-500 font-semibold group-hover:text-[#2369EB]'}
                    `}>
                      {isActive ? feature.title : feature.shortTitle}
                    </h2>
                  </div>

                  {/* Expandable Body */}
                  <div className={`transition-all duration-500 ease-in-out origin-top
                    ${isActive
                      ? 'opacity-100 max-h-[300px] mt-6 translate-y-0'
                      : 'opacity-0 max-h-0 mt-0 translate-y-4 pointer-events-none'}
                  `}>
                    <p className="text-slate-600 text-[14px] max-w-xl leading-relaxed mb-6">
                      {feature.desc}
                    </p>

                    {feature.isLink ? (
                      <Link to={feature.link}>
                        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-sm hover:shadow-md hover:shadow-blue-600/25 active:scale-[0.98]">
                          <span className="text-sm">{feature.btn}</span>
                          <ArrowRight size={14} className="stroke-[2.5]" />
                        </button>
                      </Link>
                    ) : (
                      <div className="flex flex-col items-start gap-2">
                        <button
                          onClick={feature.action}
                          disabled={feature.disabled || (uploadMessage && uploadMessage.type === 'success')}
                          className={`inline-flex items-center gap-2 font-semibold py-2.5 px-4 rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:cursor-not-allowed
                            ${uploading
                              ? 'bg-blue-400 text-white'
                              : uploadMessage && uploadMessage.type === 'success'
                                ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/20'
                                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md hover:shadow-blue-600/25'}
                          `}
                        >
                          <span className="text-sm">{feature.btn}</span>
                          {uploadMessage && uploadMessage.type === 'success' ? (
                            <Check size={16} className="ml-1 text-white stroke-[2.5]" />
                          ) : (
                            <ArrowRight size={14} className="stroke-[2.5]" />
                          )}
                        </button>
                        {feature.showReupload && (
                          <button
                            onClick={() => { setUploadMessage(null); setTimeout(() => fileInputRef.current?.click(), 100); }}
                            className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold py-2 px-4 rounded-lg transition-all shadow-sm mt-1"
                          >
                            <Upload size={16} className="mr-1" /> Re-upload Resume
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtle Background Accent for Active Card */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl transition-opacity duration-700 pointer-events-none
                  ${isActive ? 'opacity-100' : 'opacity-0'}
                `} />
              </div>
            );
          })}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          className="hidden"
          onChange={handleUploadResume}
          disabled={uploading}
        />

      </main>

      {/* Toast Notification */}
      {uploadMessage && (
        <div className={`fixed top-20 right-10 z-50 transition-all duration-500 ease-out transform ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
          }`}>
          <div
            className={`w-[370px] bg-white border-l-8 shadow-2xl rounded-2xl px-6 py-7 flex flex-col items-center ${uploadMessage.type === "success" ? "border-green-500" : "border-red-500"
              }`}
          >
            <div className="flex flex-col items-center w-full">
              <div className="flex flex-col items-center w-full relative">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto ${uploadMessage.type === "success"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                    }`}
                >
                  {uploadMessage.type === "success" ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <XCircle className="w-7 h-7" />
                  )}
                  {/* Close button absolutely positioned right */}
                  <button
                    onClick={() => setShowToast(false)}
                    className={`absolute right-0 top-0 inline-flex text-gray-400 hover:text-gray-600 transition-colors duration-200 ${uploadMessage.type === "success"
                      ? "hover:text-green-600"
                      : "hover:text-red-600"
                      }`}
                    aria-label="Close"
                    style={{ transform: "translateY(-50%) translateX(50%)" }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div
                className={`text-[14px] font-medium text-center break-words ${uploadMessage.type === "success" ? "text-green-700" : "text-red-700"
                  }`}
                style={{ wordBreak: "break-word" }}
              >
                {uploadMessage.text}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tailwind Animations Setup */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </div>
  );
}

export default Home;
