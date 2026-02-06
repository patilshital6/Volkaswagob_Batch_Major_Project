import { z } from 'zod'

export const supplierSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    contact_person: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    payment_terms: z.string().optional(),
    is_active: z.boolean().default(true),
})

export type SupplierFormData = z.infer<typeof supplierSchema>
