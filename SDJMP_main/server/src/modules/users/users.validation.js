import { z } from 'zod'

const stringish = z.union([z.string(), z.number()]).transform((value) => String(value).trim())

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    avatar: z.string().trim().optional(),
    profile: z.object({
      bio: stringish.optional(),
      location: stringish.optional(),
      education: z.array(z.object({
        id: z.union([z.string(), z.number()]).optional(),
        degree: stringish.optional(),
        institution: stringish.optional(),
        year: stringish.optional()
      })).optional(),
      skills: z.array(z.object({
        name: z.string().trim().min(1),
        level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
        years: z.number().min(0).optional(),
        verified: z.boolean().optional(),
      })).optional(),
      projects: z.array(z.object({
        id: z.union([z.string(), z.number()]).optional(),
        title: stringish.optional(),
        description: stringish.optional(),
        link: stringish.optional()
      })).optional(),
      certifications: z.array(z.object({
        name: stringish.optional(),
        issuer: stringish.optional(),
        year: stringish.optional()
      })).optional(),
      preferences: z.object({
        jobTypes: z.array(stringish).optional(),
        locations: z.array(z.union([stringish, z.array(stringish)])).optional(),
        minSalary: stringish.optional()
      }).optional()
    }).optional(),
    company: z.record(z.any()).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
})

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
})

export const createResumeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1),
    type: z.enum(['uploaded', 'built']),
    fileUrl: z.string().optional(),
    filePublicId: z.string().optional(),
    storageProvider: z.enum(['cloudinary', 'local', 'none']).optional(),
    data: z.record(z.any()).nullable().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
})

export const updateResumeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    isPrimary: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
})
