import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export default function ImprovementPanel({
  matchScore,
  missingSkills = [],
  suggestions = [],
  onApplyAI,
  onFullAnalysis,
  isApplying,
  isComplete
}) {
  if (!matchScore && missingSkills.length === 0 && suggestions.length === 0) return null;

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start">

          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-blue-600">{matchScore}%</div>
              <div>
                <h3 className="font-semibold text-slate-900">Resume Match Score</h3>
                <p className="text-sm text-slate-500">Based on your target job description</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {missingSkills.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-red-600 mb-1">Missing Skills</h4>
                  <p className="text-sm text-slate-600">
                    {missingSkills.join(", ")}
                  </p>
                </div>
              )}

              {suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-600 mb-1">Key Improvements</h4>
                  <ul className="text-sm text-slate-600 list-disc list-inside">
                    {suggestions.slice(0, 3).map((s, i) => (
                      <li key={i} className="truncate">{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 pt-2 flex flex-col gap-2">
            {!isComplete ? (
              <Button
                onClick={onApplyAI}
                disabled={isApplying}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isApplying ? "Starting AI..." : "Apply AI Improvements"}
              </Button>
            ) : (
              <Button
                onClick={onFullAnalysis}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200 w-full"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                View Full Analysis
              </Button>
            )}

            <p className="text-xs text-center text-slate-400">
              {isComplete ? "Review detailed breakdown" : "Edits step-by-step • You stay in control"}
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
