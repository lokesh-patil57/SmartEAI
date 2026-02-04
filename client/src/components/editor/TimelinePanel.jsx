import { CheckCircle2, Circle, Disc } from "lucide-react";

export default function TimelinePanel({ steps, activeStepIndex, isComplete }) {
  return (
    <div className="hidden xl:block w-56 flex-shrink-0 pt-4">
      <div className="sticky top-32">
        <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-6 px-1 opacity-70">
          Progress
        </h3>

        <div className="relative pl-3 border-l-[1.5px] border-slate-200/60 space-y-6">
          {steps.map((step, index) => {
            let status = "upcoming"; // default
            if (isComplete) status = "completed";
            else if (index < activeStepIndex) status = "completed";
            else if (index === activeStepIndex) status = "active";

            return (
              <div key={step} className="relative group transition-all duration-300">
                {/* Dot Indicator */}
                <div
                  className={`absolute -left-[18.5px] top-1 w-3 h-3 rounded-full border transition-all duration-300 z-10 ${status === "completed"
                    ? "bg-slate-700 border-slate-700"
                    : status === "active"
                      ? "bg-white border-blue-600 ring-[3px] ring-blue-50 scale-110"
                      : "bg-white border-slate-300 group-hover:border-slate-400"
                    }`}
                >
                  {status === "completed" && (
                    <CheckCircle2 className="w-full h-full text-white p-0.5" />
                  )}
                </div>

                {/* Text */}
                <div className="pl-2">
                  <p
                    className={`text-sm font-medium transition-colors ${status === "active"
                      ? "text-blue-700 font-semibold"
                      : status === "completed"
                        ? "text-slate-600"
                        : "text-slate-400 group-hover:text-slate-500"
                      }`}
                  >
                    {step}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
