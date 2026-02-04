import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Untitled', trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    type: { type: String, enum: ['resume', 'cover-letter', 'cold-mail'], default: 'resume' },
  },
  { timestamps: true }
);

export const DocumentModel = mongoose.model('Document', documentSchema);
