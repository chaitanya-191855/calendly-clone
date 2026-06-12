import { Router, Request, Response, NextFunction } from 'express'
import { validate, validateQuery } from '../middleware/validate'
import { UpdateAvailabilitySchema, SlotsQuerySchema } from '../schemas'
import { AvailabilityService } from '../services/availability.service'
import { slotsLimiter } from '../middleware/rateLimit'
import { config } from '../lib/config'

const router = Router()
const service = new AvailabilityService()

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getSchedule(config.defaultUserId)
    res.json(data)
  } catch (err) { next(err) }
})

router.put('/', validate(UpdateAvailabilitySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.updateSchedule(config.defaultUserId, req.body)
    const updated = await service.getSchedule(config.defaultUserId)
    res.json(updated)
  } catch (err) { next(err) }
})

export { router as availabilityRouter }
export default router
