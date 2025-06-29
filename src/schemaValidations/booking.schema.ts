import { BookingStatus } from '@/constants/booking'
import { z } from 'zod'

export const BookingSchema = z.object({
  id: z.number(),
  guestName: z.string().min(1).max(500),
  guestPhone: z.string().min(1).max(50),
  numberOfGuest: z.number().int().positive(),
  bookingDateTime: z.date(),
  status: z.nativeEnum(BookingStatus),
  note: z.string().default(''),
  userId: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})
