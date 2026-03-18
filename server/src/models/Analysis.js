import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    matchedSkills: [{ type: String, trim: true }],
    missingSkills: [{ type: String, trim: true }],
    relatedSkills: [{ type: String, trim: true }],
    matchScore: { type: Number, default: 0 },
    suggestions: [{ type: String, trim: true }],
    learningPlan: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export const Analysis = mongoose.model('Analysis', analysisSchema);
