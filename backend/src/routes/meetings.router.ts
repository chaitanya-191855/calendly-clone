import { Router, Request, Response, NextFunction } from 'express'
import { validateQuery } from '../middleware/validate'
import { MeetingsQuerySchema } from '../schemas'
import { MeetingsService } from '../services/meetings.service'
import { config } from '../lib/config'

const router = Router()
const service = new MeetingsService()

router.get('/', validateQuery(MeetingsQuerySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = req.query.filter as 'upcoming' | 'past'
    const data = filter === 'upcoming'
      ? await service.getUpcoming(config.defaultUserId)
      : await service.getPast(config.defaultUserId)
    res.json(data)
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.cancelMeeting(req.params.id, config.defaultUserId)
    res.json({ message: 'Meeting cancelled' })
  } catch (err) { next(err) }
})

export default router
