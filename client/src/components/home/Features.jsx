import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "ATS-aware from the start",
    body: "Understand how your resume lines up with real job descriptions using a transparent, rule-based engine.",
  },
  {
    title: "Ethical AI, human control",
    body: "AI refines wording and structure only — you stay in charge of every skill, project, and sentence.",
  },
  {
    title: "One calm workspace",
    body: "Move smoothly from ideas to ready-to-send documents without noisy UI or distracting patterns.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="bg-main border-t border-border py-16 md:py-20"
    >
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Built for students and early professionals
          </h2>
          <p className="mt-3 text-secondary">
            SmartEAI keeps ATS logic as the source of truth while helping you
            write clearly, honestly, and confidently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="h-full rounded-2xl bg-white border border-border-soft/80 shadow-sm shadow-slate-900/5 px-5 py-6"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-secondary leading-relaxed">
                {feature.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

