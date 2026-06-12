import { Router, Request, Response, NextFunction } from 'express'
import { validate, validateQuery } from '../middleware/validate'
import { CreateBookingSchema, SlotsQuerySchema } from '../schemas'
import { BookingService } from '../services/booking.service'
import { AvailabilityService } from '../services/availability.service'
import { bookingLimiter, slotsLimiter } from '../middleware/rateLimit'

const router = Router()
const bookingService = new BookingService()
const availabilityService = new AvailabilityService()

// Must be BEFORE /:slug to avoid matching "confirm" as a slug
router.get('/confirm/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await bookingService.getByToken(req.params.token)
    if (!booking) { res.status(404).json({ message: 'Booking not found' }); return }
    res.json(booking)
  } catch (err) { next(err) }
})

router.delete('/confirm/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await bookingService.cancelByToken(req.params.token)
    res.json({ message: 'Booking cancelled' })
  } catch (err) { next(err) }
})

router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventType = await bookingService.getEventTypeBySlug(req.params.slug)
    if (!eventType) { res.status(404).json({ message: 'Event type not found' }); return }
    res.json(eventType)
  } catch (err) { next(err) }
})

router.get('/:slug/slots', slotsLimiter, validateQuery(SlotsQuerySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slots = await availabilityService.getAvailableSlots(
      req.params.slug,
      req.query.date as string,
      (req.query.tz as string) ?? 'UTC',
    )
    res.json(slots)
  } catch (err) { next(err) }
})

router.post('/:slug', bookingLimiter, validate(CreateBookingSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await bookingService.createBooking(req.params.slug, req.body)
    res.status(201).json(booking)
  } catch (err) { next(err) }
})

export default router
