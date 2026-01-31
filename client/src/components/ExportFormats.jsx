import { motion } from "framer-motion";
import { FileText, FileType, Download, CheckCircle2, Sparkles } from "lucide-react";

const formats = [
  { 
    label: "TXT", 
    description: "Plain text format",
    details: "Perfect for ATS systems and quick copies",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
    features: ["ATS-friendly", "Universal compatibility", "Lightweight"]
  },
  { 
    label: "PDF", 
    description: "Professional documents",
    details: "Polished, print-ready format for submissions",
    icon: FileType,
    color: "from-purple-500 to-pink-500",
    features: ["Print-ready", "Professional look", "Non-editable security"]
  },
  { 
    label: "DOCX", 
    description: "Editable documents",
    details: "Full editing control for further customization",
    icon: Download,
    color: "from-amber-500 to-orange-500",
    features: ["Fully editable", "Microsoft Word", "Easy to customize"]
  },
];

export default function ExportFormats() {
  return (
    <section className="relative bg-main py-20 md:py-10 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm">
            <Download className="w-4 h-4 text-[#2369EB]" />
            <span className="text-sm font-medium text-gray-700">
              Multiple Export Options
            </span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-center mb-4"
        >
          Export your work instantly
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-secondary max-w-2xl mx-auto text-center mb-16"
        >
          Download your polished content in any format that fits your workflow—ready to apply in seconds.
        </motion.p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {formats.map((format, i) => {
            const Icon = format.icon;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -8 }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty(
                    "--x",
                    `${e.clientX - rect.left}px`
                  );
                  e.currentTarget.style.setProperty(
                    "--y",
                    `${e.clientY - rect.top}px`
                  );
                }}
                className="group relative rounded-2xl border-2 border-gray-200/80 bg-white/60 backdrop-blur-sm p-8
                           transition-all duration-300 hover:border-[#2369EB]/50 hover:shadow-xl hover:bg-white/80"
              >
                {/* Cursor-follow glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl
                             opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `
                      radial-gradient(
                        200px circle at var(--x) var(--y),
                        rgba(35,105,235,0.15),
                        transparent 70%
                      )
                    `,
                  }}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon with gradient background */}
                  <div className="mb-6">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${format.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Format label */}
                  <h3 className="text-3xl font-bold text-foreground mb-2 group-hover:text-[#2369EB] transition-colors">
                    {format.label}
                  </h3>

                  {/* Description */}
                  <p className="text-lg font-medium text-[#2369EB] mb-2">
                    {format.description}
                  </p>

                  {/* Details */}
                  <p className="text-base text-secondary mb-6">
                    {format.details}
                  </p>

                  {/* Features list */}
                  <ul className="space-y-2">
                    {format.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + (0.1 * idx) }}
                        className="flex items-center gap-2 text-sm text-foreground/70"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#2369EB] flex-shrink-0" />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>


                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom info section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200/60">
            <Sparkles className="w-5 h-5 text-[#2369EB]" />
            <p className="text-base font-medium text-foreground">
              All formats include your tailored content, perfectly formatted and ready to use
            </p>
          </div>
        </motion.div>

        {/* Additional features grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { icon: "⚡", label: "Instant Download" },
            { icon: "🔒", label: "Secure Export" },
            { icon: "♾️", label: "Unlimited Exports" },
            { icon: "📱", label: "All Devices" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 + (0.1 * idx) }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/40 backdrop-blur-sm border border-gray-200/50 hover:bg-white/60 transition-all"
            >
              <div className="text-2xl">{item.icon}</div>
              <div className="text-sm font-medium text-foreground/80">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}