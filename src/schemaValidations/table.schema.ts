import { TableStatus } from '@/constants/table'
import { z } from 'zod'
import { BookingSchema } from './booking.schema'
import { OrderSchema } from './order.schema'

export const TableSchema = z.object({
  id: z.number(),
  code: z.string().min(1).max(50),
  capacity: z.coerce.number().int().positive(),
  status: z.nativeEnum(TableStatus),
  location: z.string().max(1000),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const TableParamsSchema = z.object({
  tableId: z.coerce.number().int().positive()
})

export const GetTablesResSchema = z.object({
  data: z.array(TableSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetAllTablesResSchema = GetTablesResSchema.pick({
  data: true,
  totalItems: true
})

export const GetTableDetailResSchema = TableSchema.extend({
  bookings: z.array(BookingSchema),
  orders: z.array(OrderSchema)
})

export const CreateTableBodySchema = TableSchema.pick({
  code: true,
  capacity: true,
  status: true,
  location: true
}).strict()

export const UpdateTableBodySchema = CreateTableBodySchema

export type TableType = z.infer<typeof TableSchema>
export type TableParamsType = z.infer<typeof TableParamsSchema>
export type GetTablesResType = z.infer<typeof GetTablesResSchema>
export type GetAllTablesResType = z.infer<typeof GetAllTablesResSchema>
export type GetTableDetailResType = z.infer<typeof GetTableDetailResSchema>
export type CreateTableBodyType = z.infer<typeof CreateTableBodySchema>
export type UpdateTableBodyType = z.infer<typeof UpdateTableBodySchema>
