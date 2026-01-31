import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const words = ["thoughts", "ideas", "drafts", "notes", "concepts"];

export default function HeroSentence() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2200); // calm pacing
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 leading-tight">
      Turning{" "}
      <span className="relative inline-block w-[9ch] text-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={words[index]}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute left-0 right-0 text-[var(--primary-dark)]"
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>{" "}
      into structured writing that delivers clarity
    </h1>
  );
}
