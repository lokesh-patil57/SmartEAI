import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const words = ["thoughts", "ideas", "drafts", "notes", "concepts"];

export default function HeroSentence() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  return (
    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.15] text-foreground max-w-5xl mx-auto tracking-tighter">
      <span className="block">Turning</span>
      <span className="block mt-2 md:mt-3">
        <span
          className="inline-block relative min-w-[160px] sm:min-w-[200px] md:min-w-[240px] lg:min-w-[280px]"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={words[index]}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                filter: "blur(0px)",
                transition: {
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1]
                }
              }}
              exit={{ 
                opacity: 0, 
                y: -20, 
                filter: "blur(8px)",
                transition: {
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1]
                }
              }}
              className="inline-block bg-gradient-to-r from-[#2369EB] via-[#1557d4] to-[#0d47b8] bg-clip-text text-transparent font-extrabold"
              style={{
                backgroundSize: "200% auto",
              }}
            >
              {words[index]}
            </motion.span>
          </AnimatePresence>
          
          {/* Animated underline */}
          <motion.span
            className="absolute -bottom-1 left-0 h-[3px] md:h-[4px] bg-gradient-to-r from-[#2369EB] to-[#0d47b8] rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: "100%",
              transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.2
              }
            }}
            key={`underline-${words[index]}`}
          />
        </span>
      </span>
      <span className="block mt-2 md:mt-3">into structured writing</span>
      <span className="block mt-2 md:mt-3">that delivers clarity</span>
    </h1>
  );
}