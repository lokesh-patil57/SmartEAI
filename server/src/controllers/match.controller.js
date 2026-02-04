import { matchResumeToJob } from '../services/ats.service.js';

export function postMatch(req, res, next) {
  try {
    const { resume, job } = req.body;
    const result = matchResumeToJob(resume, job);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
