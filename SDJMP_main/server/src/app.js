import cookieParser from 'cookie-parser'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import env from './config/env.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { notFoundMiddleware } from './middlewares/not-found.middleware.js'
import adminRouter from './modules/admin/admin.routes.js'
import applicationsRouter from './modules/applications/applications.routes.js'
import assessmentsRouter from './modules/assessments/assessments.routes.js'
import authRouter from './modules/auth/auth.routes.js'
import dashboardRouter from './modules/student/dashboard.routes.js'
import uploadRouter from './modules/upload/upload.routes.js'
import employerRouter from './modules/employer/employer.routes.js'
import healthRouter from './modules/health/health.routes.js'
import jobsRouter from './modules/jobs/jobs.routes.js'
import notificationsRouter from './modules/notifications/notifications.routes.js'
import skillsRouter from './modules/skills/skills.routes.js'
import usersRouter from './modules/users/users.routes.js'

const app = express()
const localDevOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]
const allowedOrigins = new Set([env.clientUrl, ...localDevOrigins])

app.use(helmet())
app.use(compression())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }

      callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static('uploads'))
// Backwards-compat: some clients mistakenly prefix static uploads with `/api`.
app.use('/api/uploads', express.static('uploads'))
app.use(morgan(env.isProduction ? 'combined' : 'dev'))
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
)

app.get('/', (req, res) => {
  res.json({
    message: 'SkillMatch API is running',
  })
})

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/jobs', jobsRouter)
app.use('/api/applications', applicationsRouter)
app.use('/api/skills', skillsRouter)
app.use('/api/assessments', assessmentsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/employer', employerRouter)
app.use('/api/admin', adminRouter)
app.use('/api/student/dashboard', dashboardRouter)
app.use('/api/upload', uploadRouter)
app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app
