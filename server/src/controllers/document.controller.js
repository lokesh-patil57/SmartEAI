import { DocumentModel } from '../models/Document.js';
import { Version } from '../models/Version.js';
import { addGeneratedAsset } from './application.controller.js';

export async function listDocuments(req, res, next) {
  try {
    const filter = { userId: req.user._id };
    const docs = await DocumentModel.find(filter).sort({ updatedAt: -1 }).lean();
    const list = docs.map((d) => ({
      id: d._id.toString(),
      title: d.title,
      updated_at: d.updatedAt ? new Date(d.updatedAt).toISOString().slice(0, 10) : '',
    }));
    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function createDocument(req, res, next) {
  try {
    const title = req.body.title || 'Untitled Resume';
    const type = req.body.type || 'resume';
    const applicationId = req.body.applicationId || null;
    const doc = await DocumentModel.create({
      title,
      userId: req.user._id,
      type,
    });

    if (applicationId) {
      await addGeneratedAsset(applicationId, req.user._id, {
        type,
        documentId: doc._id,
      });
    }

    res.status(201).json({ id: doc._id.toString(), title: doc.title, type: doc.type });
  } catch (err) {
    next(err);
  }
}

export async function getDocumentById(req, res, next) {
  try {
    const doc = await DocumentModel.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const versions = await Version.find({ documentId: doc._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const latest = versions[0];
    res.json({
      id: doc._id.toString(),
      title: doc.title,
      type: doc.type,
      content: latest?.content ?? '',
      versions: versions.map((v) => ({
        id: v._id.toString(),
        content: v.content,
        isOriginal: v.isOriginal,
        created_at: v.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function saveVersion(req, res, next) {
  try {
    const doc = await DocumentModel.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const content = req.body.content ?? '';
    const isOriginal = req.body.isOriginal === true;
    const version = await Version.create({
      documentId: doc._id,
      content,
      isOriginal,
    });
    res.status(201).json({
      id: version._id.toString(),
      created_at: version.createdAt,
    });
  } catch (err) {
    next(err);
  }
}
