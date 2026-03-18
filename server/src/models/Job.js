import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    technicalSkills: [{ type: String, trim: true }],
    softSkills: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    benefits: [{ type: String, trim: true }],
    jobType: { type: String, trim: true, default: '' },
    stipend: { type: String, trim: true, default: '' },
    experienceLevel: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export const Job = mongoose.model('Job', jobSchema);
