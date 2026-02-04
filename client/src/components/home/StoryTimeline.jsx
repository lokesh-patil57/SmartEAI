import { motion } from "framer-motion";

const STEPS = [
  {
    title: "Start from thoughts",
    body: "Drop in raw notes, bullet points, or a rough draft — no polish needed.",
  },
  {
    title: "Match with the role",
    body: "Run a transparent ATS check to see what aligns and what’s missing.",
  },
  {
    title: "Refine with ethical AI",
    body: "Let SmartEAI suggest clearer wording while you stay in full control.",
  },
  {
    title: "Export with confidence",
    body: "Download clean TXT, PDF, or DOCX files that are ready to send.",
  },
];

export default function StoryTimeline() {
  return (
    <section className="bg-main border-t border-border py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-6 space-y-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
            From idea to application
          </h2>
          <p className="mt-3 text-secondary">
            SmartEAI mirrors how you really work: think, draft, match, refine,
            and send.
          </p>
        </div>

        <ol className="space-y-6">
          {STEPS.map((step, index) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className="relative pl-10"
            >
              <div className="absolute left-0 top-1.5 flex flex-col items-center">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2369EB] text-white text-xs font-medium">
                  {index + 1}
                </span>
                {index < STEPS.length - 1 && (
                  <span className="mt-1 w-px h-10 bg-border-soft" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-secondary leading-relaxed">
                  {step.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

