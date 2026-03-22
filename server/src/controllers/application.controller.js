import { Application } from '../models/Application.js';
import { stringify } from 'csv-stringify/sync';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive a human-readable job title / company from a raw job description string. */
function extractJobMeta(jobDescription = '') {
  const lines = jobDescription.split('\n').map((l) => l.trim()).filter(Boolean);
  const titleLine = lines[0] || '';
  const companyLine = lines[1] || '';
  return {
    jobTitle: titleLine.slice(0, 120) || 'Untitled Role',
    company: companyLine.slice(0, 80) || 'Unknown Company',
  };
}

// ─── POST /api/application/create ─────────────────────────────────────────────

export async function createApplication(req, res, next) {
  try {
    const userId = req.user._id;
    const {
      jobTitle,
      company,
      jobType,
      stipend,
      location,
      jobDescription,
      requiredSkills = [],
      matchedSkills = [],
      missingSkills = [],
      matchScore = 0,
      targetRole = '',
    } = req.body;

    const app = await Application.create({
      userId,
      jobTitle: jobTitle || extractJobMeta(jobDescription).jobTitle,
      company: company || extractJobMeta(jobDescription).company,
      jobType,
      stipend,
      location,
      jobDescription,
      requiredSkills,
      matchedSkills,
      missingSkills,
      matchScore,
      targetRole,
      timeline: [{ action: 'ATS Analysis', timestamp: new Date() }],
    });

    res.status(201).json({ application: app });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/application/user ─────────────────────────────────────────────────

export async function getUserApplications(req, res, next) {
  try {
    const userId = req.user._id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;

    const filter = { userId };
    if (req.query.targetRole) filter.targetRole = req.query.targetRole;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-jobDescription -__v'),
      Application.countDocuments(filter),
    ]);

    res.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/application/by-role ─────────────────────────────────────────────
// Returns applications grouped by targetRole with aggregate stats.

export async function getApplicationsByRole(req, res, next) {
  try {
    const userId = req.user._id;

    // Fetch all (no pagination needed for role grouping – capped at 200)
    const applications = await Application.find({ userId })
      .sort({ createdAt: -1 })
      .limit(200)
      .select('-jobDescription -__v')
      .lean();

    // Group by targetRole (empty targetRole becomes "General")
    const groups = {};
    for (const app of applications) {
      const key = app.targetRole?.trim() || 'General';
      if (!groups[key]) {
        groups[key] = {
          targetRole: key,
          applications: [],
          totalScore: 0,
          assetCounts: { resume: 0, coverLetter: 0, coldMail: 0 },
        };
      }
      groups[key].applications.push(app);
      groups[key].totalScore += app.matchScore || 0;
      if (app.assets?.resumeId) groups[key].assetCounts.resume += 1;
      if (app.assets?.coverLetterId) groups[key].assetCounts.coverLetter += 1;
      if (app.assets?.coldMailId) groups[key].assetCounts.coldMail += 1;
    }

    const roles = Object.values(groups).map((g) => ({
      targetRole: g.targetRole,
      count: g.applications.length,
      averageScore: g.applications.length > 0 ? Math.round(g.totalScore / g.applications.length) : 0,
      assetCounts: g.assetCounts,
      latestStatus: g.applications[0]?.status || 'analyzed',
      latestDate: g.applications[0]?.createdAt || null,
      applications: g.applications,
    }));

    res.json({ roles });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/application/:id ──────────────────────────────────────────────────

export async function getApplicationById(req, res, next) {
  try {
    const userId = req.user._id;
    const application = await Application.findOne({ _id: req.params.id, userId });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ application });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/application/status ────────────────────────────────────────────

export async function updateApplicationStatus(req, res, next) {
  try {
    const userId = req.user._id;
    const { applicationId, status } = req.body;

    const validStatuses = ['analyzed', 'applied', 'interview', 'rejected', 'offer'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const application = await Application.findOneAndUpdate(
      { _id: applicationId, userId },
      {
        $set: { status },
        $push: {
          timeline: { action: 'Status Updated', timestamp: new Date(), meta: `Status set to ${status}` },
        },
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ application });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/application/export/csv ──────────────────────────────────────────

export async function exportApplicationsCsv(req, res, next) {
  try {
    const userId = req.user._id;
    const applications = await Application.find({ userId }).sort({ createdAt: -1 }).lean();

    const rows = applications.map((a) => ({
      jobTitle: a.jobTitle,
      company: a.company,
      matchScore: a.matchScore,
      status: a.status,
      matchedSkills: (a.matchedSkills || []).join(', '),
      missingSkills: (a.missingSkills || []).join(', '),
      dateCreated: a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : '',
    }));

    const csv = stringify(rows, {
      header: true,
      columns: [
        { key: 'jobTitle', header: 'Job Title' },
        { key: 'company', header: 'Company' },
        { key: 'matchScore', header: 'Match Score (%)' },
        { key: 'status', header: 'Status' },
        { key: 'matchedSkills', header: 'Matched Skills' },
        { key: 'missingSkills', header: 'Missing Skills' },
        { key: 'dateCreated', header: 'Date Created' },
      ],
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="applications.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/application/:id/asset ─────────────────────────────────────────
// Called internally (from other controllers) to attach a generated doc.

export async function addGeneratedAsset(applicationId, userId, { type, documentId }) {
  try {
    const assetFieldMap = {
      resume: 'assets.resumeId',
      'cover-letter': 'assets.coverLetterId',
      'cold-mail': 'assets.coldMailId',
    };

    const actionMap = {
      resume: 'Resume Generated',
      'cover-letter': 'Cover Letter Generated',
      'cold-mail': 'Cold Mail Generated',
    };

    const update = {
      $push: {
        generatedFiles: { type, documentId, createdAt: new Date() },
        timeline: { action: actionMap[type], timestamp: new Date() },
      },
      $set: {},
    };

    if (assetFieldMap[type]) {
      update.$set[assetFieldMap[type]] = documentId;
    }

    await Application.findOneAndUpdate({ _id: applicationId, userId }, update);
  } catch {
    // Non-critical — don't break parent flows
  }
}
