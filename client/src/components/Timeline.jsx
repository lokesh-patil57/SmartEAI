import { motion } from "framer-motion";
import {
  Lightbulb,
  FileEdit,
  Sparkles,
  CheckCircle2,
  FileText,
  Download,
  Brain,
  Zap,
  Target,
  Upload,
} from "lucide-react";

const steps = [
  {
    title: "Input Collection",
    subtitle: "Gather your raw materials",
    description:
      "Simply upload your existing resume, paste the job description, and add any notes about your career goals. No formatting required—SmartEAI handles the messy parts.",
    icon: Upload,
    color: "from-blue-500 to-cyan-500",
    badge: "Step 1",
    testimonial: {
      text: "I literally copy-pasted my LinkedIn bio and the internship posting. Within seconds, SmartEAI had everything organized and ready to work with.",
      author: "Sarah K., Business Student",
      logo: "📄",
    },
    responsibilities: [
      "Upload resume in any format (PDF, DOCX, TXT)",
      "Paste job descriptions directly",
      "Add career goals and target roles",
      "Include any rough notes or drafts",
    ],
  },
  {
    title: "Content Understanding",
    subtitle: "AI decodes your profile",
    description:
      "Our AI analyzes your experience, skills, and achievements, then maps them against the target role's requirements to find the perfect matches and gaps.",
    icon: Brain,
    color: "from-purple-500 to-pink-500",
    badge: "Step 2",
    testimonial: {
      text: "SmartEAI found connections between my class projects and the job requirements that I completely missed. It highlighted skills I didn't know were valuable.",
      author: "Rahul M., CS Major",
      logo: "🧠",
    },
    responsibilities: [
      "Extract skills and achievements from resume",
      "Identify keywords from job descriptions",
      "Map your experience to role requirements",
      "Detect gaps and suggest improvements",
    ],
  },
  {
    title: "AI Structuring & Optimization",
    subtitle: "Transform into polished content",
    description:
      "Watch your rough ideas become professional resumes, compelling cover letters, and effective cold emails—all tailored to your target role with perfect formatting.",
    icon: Sparkles,
    color: "from-amber-500 to-orange-500",
    badge: "Step 3",
    testimonial: {
      text: "My bullet points went from 'did stuff with React' to 'Architected responsive web applications using React.js, improving load times by 40%.' Same work, way better impact.",
      author: "Priya S., Frontend Developer",
      logo: "✨",
    },
    responsibilities: [
      "Generate ATS-friendly resume sections",
      "Create personalized cover letters",
      "Draft professional cold emails",
      "Optimize for clarity and impact",
    ],
  },
  {
    title: "Interactive Editing",
    subtitle: "Refine to perfection",
    description:
      "Use our intuitive editor to tweak wording, adjust tone, and personalize content. Keep what works, change what doesn't—you're always in control.",
    icon: FileEdit,
    color: "from-green-500 to-emerald-500",
    badge: "Step 4",
    testimonial: {
      text: "The editor made it so easy to adjust the AI's suggestions. I could make it sound more like 'me' while keeping the professional polish. Best of both worlds.",
      author: "Mike T., Marketing Intern",
      logo: "✍️",
    },
    responsibilities: [
      "Edit content directly in the browser",
      "Customize tone and word choice",
      "Rearrange sections with drag-and-drop",
      "See changes update in real-time",
    ],
  },
  {
    title: "Review & Finalization",
    subtitle: "Perfect before you send",
    description:
      "Review every detail with our smart checklist. Ensure alignment with job requirements, verify accuracy, and make final tweaks before exporting.",
    icon: CheckCircle2,
    color: "from-blue-600 to-indigo-600",
    badge: "Step 5",
    testimonial: {
      text: "The review checklist caught a typo in my email and reminded me to tailor my opening line. Those small details make a huge difference in applications.",
      author: "Jessica L., Data Analyst",
      logo: "✅",
    },
    responsibilities: [
      "Verify job description alignment",
      "Check for typos and formatting issues",
      "Ensure consistency across documents",
      "Validate contact information and dates",
    ],
  },
  {
    title: "Export & Application",
    subtitle: "Download and apply",
    description:
      "Export your perfected content in multiple formats—PDF for emails, DOCX for edits, TXT for ATS systems. Apply with confidence knowing everything is tailored and professional.",
    icon: Download,
    color: "from-violet-500 to-purple-600",
    badge: "Step 6",
    testimonial: {
      text: "Downloaded my resume as PDF, cover letter as Word doc, and kept a plain text version for online forms. Applied to 8 companies in under 20 minutes. Game changer.",
      author: "Alex P., Job Seeker",
      logo: "🚀",
    },
    responsibilities: [
      "Export as PDF for professional submissions",
      "Download DOCX for further customization",
      "Get TXT version for ATS compatibility",
      "Save all versions for future applications",
    ],
  },
];

export default function Timeline() {
  return (
    <section className="relative bg-main py-20 md:py-1 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm mb-6">
            <Zap className="w-4 h-4 text-[#2369EB]" />
            <span className="text-sm font-medium text-gray-700">
              Complete Workflow
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            How SmartEAI Works
          </h2>
          <p className="text-lg md:text-xl text-secondary max-w-3xl mx-auto">
            From raw thoughts to polished applications in six intelligent steps
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-indigo-200 hidden sm:block" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            const isEven = i % 2 === 0;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative mb-20 md:mb-32"
              >
                {/* Timeline dot with icon */}
                <div className="absolute left-8 md:left-1/2 -ml-0 md:-ml-12 top-0 z-10">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-gradient-to-br ${step.color} shadow-lg shadow-blue-500/20 flex items-center justify-center`}
                  >
                    <Icon className="w-8 h-8 md:w-12 md:h-12 text-white" />
                  </motion.div>
                </div>

                {/* Content container */}
                <div className="ml-28 md:ml-0 md:grid md:grid-cols-2 md:gap-8 lg:gap-12">
                  {/* Step Details - Always on one side */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -60 : 60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className={`${isEven ? "md:pr-8" : "md:pl-8 md:col-start-2"}`}
                  >
                    {/* Badge */}
                    <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#2369EB] to-[#0d47b8] text-white text-sm font-semibold mb-4">
                      {step.badge}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                      {step.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-[#2369EB] font-medium mb-4">
                      {step.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-base md:text-lg text-secondary leading-relaxed mb-6">
                      {step.description}
                    </p>

                    {/* Responsibilities header */}
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider italic">
                        What Happens
                      </h4>
                    </div>

                    {/* Responsibilities list */}
                    <ul className="space-y-3">
                      {step.responsibilities.map((item, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 * idx, duration: 0.5 }}
                          className="flex items-start gap-3 group"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#2369EB] to-[#0d47b8] flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform shadow-sm">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-base text-foreground/80 group-hover:text-foreground transition-colors">
                            {item}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Testimonial Card - Always on opposite side */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 60 : -60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      duration: 0.7,
                      delay: 0.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 20px 40px rgba(59,130,246,0.25)",
                    }}
                    className={`mt-8 w-3/4 md:mt-0 flex flex-col p-6 md:p-8 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border-2 border-blue-200/60 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 ${isEven ? "md:pl-8 md:col-start-2" : "md:pr-8 md:row-start-1"}`}
                    >
                    {/* Stars */}
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + 0.1 * idx, duration: 0.3 }}
                          className="text-yellow-500 text-lg"
                        >
                          ★
                        </motion.span>
                      ))}
                    </div>

                    {/* Testimonial text */}
                    <p className="text-gray-800 text-base md:text-lg leading-relaxed mb-5">
                      "{step.testimonial.text}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{step.testimonial.logo}</div>
                      <div className="text-sm text-gray-600 font-medium">
                        {step.testimonial.author}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
         
        </motion.div>
      </div>
    </section>
  );
}
