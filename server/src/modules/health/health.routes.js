import { Router } from 'express'

const healthRouter = Router()

healthRouter.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'skillmatch-api',
    timestamp: new Date().toISOString(),
  })
})

export default healthRouter
