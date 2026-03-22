import { ZodError } from 'zod'

export function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    next(error)
    return
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      errors: error.flatten(),
    })
    return
  }

  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal server error'

  res.status(statusCode).json({
    message,
    ...(error.details ? { details: error.details } : {}),
  })
}
