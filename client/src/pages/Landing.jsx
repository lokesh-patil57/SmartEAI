import HeroSentence from "@/components/HeroSentence";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import ProblemSolution from "@/components/ProblemSolution";
import Timeline from "@/components/Timeline";
import ExportFormats from "@/components/ExportFormats";
import FinalCTA from "@/components/FinalCTA";




export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <section className="relative min-h-screen bg-main flex items-center justify-center overflow-hidden pt-20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs */}
          <motion.div
            className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
              linear-gradient(to right, var(--primary) 1px, transparent 1px),
              linear-gradient(to bottom, var(--primary) 1px, transparent 1px)
            `,
              backgroundSize: "4rem 4rem",
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl w-full px-6 sm:px-8 md:px-12 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 md:mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#2369EB]" />
              <span className="text-sm font-medium text-gray-700">
                AI-Powered Writing Assistant
              </span>
            </div>
          </motion.div>

          {/* Hero sentence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <HeroSentence />
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 md:mt-8 mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-secondary leading-relaxed px-4"
          >
            SmartEAI helps you think, write, refine, and export — all in one
            intelligent workspace.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="group relative px-8 py-6 text-base md:text-lg font-semibold bg-gradient-to-r from-[#2369EB] to-[#0d47b8] hover:from-[#1557d4] hover:to-[#0a3a95] text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 rounded-xl overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Writing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>

              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
              />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/features")}
              className="px-8 py-6 text-base md:text-lg font-medium border-2 border-gray-300 hover:border-[#2369EB] hover:bg-blue-50 transition-all duration-300 rounded-xl"
            >
              Learn More
            </Button>
          </motion.div>

          {/* Stats or features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 max-w-3xl mx-auto"
          >
            {[
              { label: "AI-Powered", value: "Smart" },
              { label: "Export Ready", value: "Fast" },
              { label: "User Friendly", value: "Easy" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#2369EB] to-[#0d47b8] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm md:text-base text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      <ProblemSolution />
      <Timeline />
      <ExportFormats />
      <FinalCTA />
    </>
  );
}
