import { motion } from "framer-motion";
import { FileText, FileType, Mail } from "lucide-react";

const FORMATS = [
  {
    label: "Resume",
    description: "Structure your experience for ATS while keeping it honest and readable.",
    icon: FileText,
  },
  {
    label: "Cover Letter",
    description: "Turn your ideas into a clear, focused narrative for each application.",
    icon: FileType,
  },
  {
    label: "Cold Mail",
    description: "Reach out to recruiters or mentors with concise, respectful messages.",
    icon: Mail,
  },
];

export default function Formats() {
  return (
    <section className="bg-white border-t border-border py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
            One workspace, three formats
          </h2>
          <p className="mt-3 text-secondary">
            Move between resumes, cover letters, and cold emails without
            changing tools or breaking your flow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {FORMATS.map(({ label, description, icon: Icon }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-2xl bg-main border border-border-soft/80 px-5 py-6 flex flex-col gap-3"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#2369EB]/10 text-[#2369EB]">
                <Icon size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {label}
                </h3>
                <p className="mt-1 text-sm text-secondary leading-relaxed">
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

