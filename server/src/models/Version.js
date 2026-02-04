import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    content: { type: String, default: '' },
    isOriginal: { type: Boolean, default: false },
    improvedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Version', default: null },
  },
  { timestamps: true }
);

export const Version = mongoose.model('Version', versionSchema);
