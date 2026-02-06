import { z } from 'zod'

export const productSchema = z.object({
    sku: z.string().max(50).optional(),
    name: z.string().min(3, 'Name must be at least 3 characters').max(200),
    description: z.string().optional(),
    category_id: z.string().uuid().optional().or(z.literal('')),
    unit_price: z.coerce.number().positive('Unit price must be positive'),
    cost_price: z.coerce.number().positive('Cost price must be positive'),
    reorder_level: z.coerce.number().int().min(0, 'Reorder level cannot be negative').default(10),
    reorder_quantity: z.coerce.number().int().positive('Reorder quantity must be positive').default(50),
    barcode: z.string().optional(),
    image_url: z.string().url().optional().or(z.literal('')),
    is_active: z.boolean().default(true),
})

export type ProductFormData = z.infer<typeof productSchema>

export const categorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    description: z.string().optional(),
    parent_id: z.string().uuid().optional().nullable(),
})

export type CategoryFormData = z.infer<typeof categorySchema>
