import mongoose from 'mongoose';

const generatedFileSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['resume', 'cover-letter', 'cold-mail'], required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const timelineEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        'ATS Analysis',
        'Resume Generated',
        'Cover Letter Generated',
        'Cold Mail Generated',
        'Status Updated',
      ],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    meta: { type: String, default: '' },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Job details
    jobTitle: { type: String, default: 'Untitled Role', trim: true },
    company: { type: String, default: 'Unknown Company', trim: true },
    jobType: { type: String, default: '', trim: true },
    stipend: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    jobDescription: { type: String, default: '' },

    // Skill analysis
    requiredSkills: [{ type: String }],
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],

    // Score
    matchScore: { type: Number, default: 0, min: 0, max: 100 },

    // Workflow status
    status: {
      type: String,
      enum: ['analyzed', 'applied', 'interview', 'rejected', 'offer'],
      default: 'analyzed',
    },

    // Linked asset IDs
    assets: {
      resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
      coverLetterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
      coldMailId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
    },

    // All generated files with timestamps
    generatedFiles: [generatedFileSchema],

    // Chronological user actions
    timeline: [timelineEntrySchema],
  },
  { timestamps: true }
);

// Compound index for sorting user applications by date
applicationSchema.index({ userId: 1, createdAt: -1 });

export const Application = mongoose.model('Application', applicationSchema);
