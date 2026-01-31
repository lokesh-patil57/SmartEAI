import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, AlertCircle, CheckCircle2 } from "lucide-react";

const problem = [
  "Writing usually starts unstructured.",
  "Thoughts are scattered across notes and drafts.",
  "Turning them into clean content takes time.",
];

const solution = [
  "SmartEAI brings structure to your thinking.",
  "It helps you organize ideas as you write.",
  "So you can focus on clarity, not formatting.",
];

export default function ProblemSolution() {
  const [expandedProblem, setExpandedProblem] = useState(true);
  const [expandedSolution, setExpandedSolution] = useState(true);

  return (
    <section className="relative bg-main py-20 md:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 sm:px-8 space-y-8">
        
        {/* Problem Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group"
        >
          <button
            onClick={() => setExpandedProblem(!expandedProblem)}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between p-6 bg-white/60 backdrop-blur-sm border-2 border-gray-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 group-hover:bg-white/80">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    The Challenge
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    What makes writing difficult
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedProblem ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <ChevronDown className="w-6 h-6 text-gray-400" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {expandedProblem && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: "auto", 
                  opacity: 1,
                  transition: {
                    height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.3, delay: 0.1 }
                  }
                }}
                exit={{ 
                  height: 0, 
                  opacity: 0,
                  transition: {
                    height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.2 }
                  }
                }}
                className="overflow-hidden"
              >
                <div className="pt-6 pb-2 px-6 space-y-4">
                  {problem.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: i * 0.1,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className="flex items-start gap-3 group/item"
                    >
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-red-400 mt-2.5 group-hover/item:scale-125 transition-transform" />
                      <p className="text-xl md:text-2xl leading-relaxed text-secondary group-hover/item:text-foreground transition-colors">
                        {line}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Solution Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="group"
        >
          <button
            onClick={() => setExpandedSolution(!expandedSolution)}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border-2 border-blue-200/60 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 group-hover:from-blue-50 group-hover:to-indigo-50">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#2369EB] to-[#0d47b8] flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    The Solution
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    How SmartEAI helps you write better
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedSolution ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <ChevronDown className="w-6 h-6 text-blue-600" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {expandedSolution && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: "auto", 
                  opacity: 1,
                  transition: {
                    height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.3, delay: 0.1 }
                  }
                }}
                exit={{ 
                  height: 0, 
                  opacity: 0,
                  transition: {
                    height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.2 }
                  }
                }}
                className="overflow-hidden"
              >
                <div className="pt-6 pb-2 px-6 space-y-4">
                  {solution.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: i * 0.1,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className="flex items-start gap-3 group/item"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#2369EB] to-[#0d47b8] flex items-center justify-center mt-1 group-hover/item:scale-110 transition-transform shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <p className={`text-xl md:text-2xl leading-relaxed transition-colors ${
                        i === solution.length - 1
                          ? "font-semibold text-foreground"
                          : "text-foreground"
                      }`}>
                        {line}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Optional CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-8 text-center"
        >
        </motion.div>

      </div>
    </section>
  );
}