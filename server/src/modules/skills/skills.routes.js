import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import {
  addSkillToProfile,
  getAllSkills,
  getPopularSkills,
  removeSkillFromProfile,
  updateSkillLevel,
} from './skills.controller.js'

const skillsRouter = Router()

skillsRouter.get('/', getAllSkills)
skillsRouter.get('/popular', getPopularSkills)
skillsRouter.post('/user', requireAuth, addSkillToProfile)
skillsRouter.put('/user/:skillId', requireAuth, updateSkillLevel)
skillsRouter.delete('/user/:skillId', requireAuth, removeSkillFromProfile)

export default skillsRouter
