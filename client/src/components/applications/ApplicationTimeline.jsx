import { CheckCircle2, Clock3 } from "lucide-react";

export default function ApplicationTimeline({ timeline = [] }) {
  if (!timeline.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-muted-foreground">
        No activity recorded yet.
      </div>
    );
  }

  const sorted = [...timeline].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
      <h3 className="text-lg font-semibold mb-5">Process Timeline</h3>
      <div className="space-y-5">
        {sorted.map((item, index) => {
          const date = item.timestamp ? new Date(item.timestamp) : null;
          return (
            <div key={`${item.action}-${index}`} className="relative pl-8">
              {index !== sorted.length - 1 && (
                <div className="absolute left-2.75 top-6 h-[calc(100%+8px)] w-px bg-white/10" />
              )}
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <p className="font-medium text-sm">{item.action}</p>
                  {item.meta ? <p className="text-xs text-muted-foreground mt-0.5">{item.meta}</p> : null}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                  <Clock3 className="w-3 h-3" />
                  {date ? date.toLocaleString() : "Unknown time"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
