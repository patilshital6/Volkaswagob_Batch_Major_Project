import { z } from 'zod'

export const warehouseSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    location: z.string().min(2, 'Location is required').max(100),
    address: z.string().optional(),
    capacity: z.coerce.number().int().positive('Capacity must be positive').optional(),
    manager_id: z.string().uuid().optional().nullable(),
    is_active: z.boolean().default(true),
})

export type WarehouseFormData = z.infer<typeof warehouseSchema>
