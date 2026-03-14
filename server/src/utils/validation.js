import Joi from 'joi';

export const matchSchema = Joi.object({
  resume: Joi.string().required().max(100000),
  job: Joi.string().required().max(100000),
});

export const improveSchema = Joi.object({
  content: Joi.string().required().max(200000),
  job: Joi.string().allow('').max(50000).default(''),
  suggestions: Joi.array().items(Joi.string()).max(100).default([]),
  mode: Joi.string().valid('resume', 'cover-letter', 'cold-mail').default('resume'),
});

export const improveSectionSchema = Joi.object({
  sectionText: Joi.string().required().max(50000),
  job: Joi.string().allow('').max(50000).default(''),
  improvements: Joi.array().items(Joi.string()).max(100).default([]),
  sectionName: Joi.string().allow('').max(80).default(''),
  mode: Joi.string().valid('resume', 'cover-letter', 'cold-mail').default('resume'),
});

export const exportSchema = Joi.object({
  content: Joi.string().allow('').max(200000),
});

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().trim().max(200),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const googleLoginSchema = Joi.object({
  credential: Joi.string().required(),
});

export const updateResumeSchema = Joi.object({
  resumeText: Joi.string().allow('').max(100000),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().max(200).allow(''),
});

export const documentSchema = Joi.object({
  title: Joi.string().trim().max(500),
  type: Joi.string().valid('resume', 'cover-letter', 'cold-mail'),
});

export const versionSchema = Joi.object({
  content: Joi.string().allow('').max(500000),
  isOriginal: Joi.boolean(),
});

export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message).join('; ') });
    }
    req.body = value;
    next();
  };
}
