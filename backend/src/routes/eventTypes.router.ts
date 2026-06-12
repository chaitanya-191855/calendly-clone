import { Router, Request, Response, NextFunction } from 'express'
import { validate } from '../middleware/validate'
import { CreateEventTypeSchema, UpdateEventTypeSchema } from '../schemas'
import { EventTypesService } from '../services/eventTypes.service'
import { config } from '../lib/config'

const router = Router()
const service = new EventTypesService()

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.listEventTypes(config.defaultUserId)
    res.json(data)
  } catch (err) { next(err) }
})

router.post('/', validate(CreateEventTypeSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.createEventType(config.defaultUserId, req.body)
    res.status(201).json(data)
  } catch (err) { next(err) }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getEventTypeById(req.params.id, config.defaultUserId)
    res.json(data)
  } catch (err) { next(err) }
})

router.put('/:id', validate(UpdateEventTypeSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.updateEventType(req.params.id, config.defaultUserId, req.body)
    res.json(data)
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.deleteEventType(req.params.id, config.defaultUserId)
    res.status(204).send()
  } catch (err) { next(err) }
})

export default router
