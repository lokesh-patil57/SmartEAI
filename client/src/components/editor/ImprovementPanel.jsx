import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export default function ImprovementPanel({
  matchScore,
  missingSkills = [],
  suggestions = [],
  onApplyAI,
  onBatchImprove,
  onFullAnalysis,
  onCreateCoverLetter,
  onCreateColdMail,
  isApplying,
  currentSectionName,
  cooldown = 0,
  isComplete
}) {
  if (!matchScore && missingSkills.length === 0 && suggestions.length === 0) return null;

  let buttonText = "Step-by-Step Editor";
  if (cooldown > 0) buttonText = `Retry in ${cooldown}s`;
  else if (isApplying) buttonText = "Starting AI...";
  else if (currentSectionName) buttonText = `Improve ${currentSectionName}`;

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

          <div className="flex-shrink-0 pt-2 flex flex-col gap-2 w-full md:w-64">
            {!isComplete ? (
              <>
                {!currentSectionName && (
                  <Button
                    onClick={onBatchImprove}
                    disabled={isApplying || cooldown > 0}
                    className={`w-full shadow-md transition-all mb-2 ${cooldown > 0
                      ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'
                      }`}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    ⚡ Smart Improve All (1-Click)
                  </Button>
                )}

                <Button
                  onClick={onApplyAI}
                  disabled={isApplying || cooldown > 0}
                  variant={currentSectionName ? "default" : "outline"}
                  className={`w-full shadow-sm transition-all ${cooldown > 0
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : currentSectionName
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                    }`}
                >
                  {!currentSectionName && <ArrowRight className="w-4 h-4 mr-2" />}
                  {buttonText}
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={onFullAnalysis}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">📊</span>
                    View Full Analysis
                  </div>
                </Button>

                <Button
                  onClick={onCreateColdMail}
                  variant="outline"
                  className="w-full border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">✉️</span>
                    Create Cold Mail
                  </div>
                </Button>

                <Button
                  onClick={onCreateCoverLetter}
                  variant="outline"
                  className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">📝</span>
                    Create Cover Letter
                  </div>
                </Button>
              </div>
            )}

            <p className="text-xs text-center text-slate-400">
              {isComplete ? "Your resume is fully optimized!" : "AI Suggestion applied to current view"}
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
