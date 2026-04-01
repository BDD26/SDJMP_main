import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  CLIENT_URLS: z.string().optional(),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/skillmatch'),
  JWT_SECRET: z.string().min(8).default('skillmatch-local-secret'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_NAME: z.string().default('skillmatch_session'),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SEED_STUDENT_EMAIL: z.string().email().optional(),
  SEED_STUDENT_PASSWORD: z.string().min(8).optional(),
  SEED_EMPLOYER_EMAIL: z.string().email().optional(),
  SEED_EMPLOYER_PASSWORD: z.string().min(8).optional(),
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
})

const parsedEnv = envSchema.parse(process.env)
const clientUrls = [
  parsedEnv.CLIENT_URL,
  ...String(parsedEnv.CLIENT_URLS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
]

const env = {
  nodeEnv: parsedEnv.NODE_ENV,
  port: parsedEnv.PORT,
  clientUrl: parsedEnv.CLIENT_URL,
  clientUrls,
  mongoUri: parsedEnv.MONGODB_URI,
  jwtSecret: parsedEnv.JWT_SECRET,
  jwtExpiresIn: parsedEnv.JWT_EXPIRES_IN,
  cookieName: parsedEnv.COOKIE_NAME,
  cookieSecure: parsedEnv.COOKIE_SECURE,
  isProduction: parsedEnv.NODE_ENV === 'production',
  smtpHost: parsedEnv.SMTP_HOST,
  smtpPort: parsedEnv.SMTP_PORT,
  smtpSecure: parsedEnv.SMTP_SECURE,
  smtpUser: parsedEnv.SMTP_USER,
  smtpPass: parsedEnv.SMTP_PASS,
  cloudinaryCloudName: parsedEnv.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: parsedEnv.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: parsedEnv.CLOUDINARY_API_SECRET || '',
  seedStudentEmail: parsedEnv.SEED_STUDENT_EMAIL,
  seedStudentPassword: parsedEnv.SEED_STUDENT_PASSWORD,
  seedEmployerEmail: parsedEnv.SEED_EMPLOYER_EMAIL,
  seedEmployerPassword: parsedEnv.SEED_EMPLOYER_PASSWORD,
  seedAdminEmail: parsedEnv.SEED_ADMIN_EMAIL,
  seedAdminPassword: parsedEnv.SEED_ADMIN_PASSWORD,
}

export default env
