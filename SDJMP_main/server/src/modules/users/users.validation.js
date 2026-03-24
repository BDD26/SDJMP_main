import { z } from 'zod'

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    avatar: z.string().trim().optional(),
    profile: z.object({
      bio: z.string().optional(),
      location: z.string().optional(),
      education: z.array(z.object({
        id: z.union([z.string(), z.number()]).optional(),
        degree: z.string().optional(),
        institution: z.string().optional(),
        year: z.union([z.string(), z.number()]).optional()
      })).optional(),
      skills: z.array(z.string()).optional(),
      projects: z.array(z.object({
        id: z.union([z.string(), z.number()]).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        link: z.string().optional()
      })).optional(),
      certifications: z.array(z.object({
        name: z.string().optional(),
        issuer: z.string().optional(),
        year: z.union([z.string(), z.number()]).optional()
      })).optional(),
      preferences: z.object({
        jobTypes: z.array(z.string()).optional(),
        locations: z.array(z.union([z.string(), z.array(z.string())])).optional(),
        minSalary: z.string().optional()
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
