import { z } from 'zod'

export const stockTransferItemSchema = z.object({
    product_id: z.string().min(1, 'Product is required'),
    quantity: z.number().positive('Quantity must be positive'),
})

export const stockTransferSchema = z.object({
    from_warehouse_id: z.string().min(1, 'Source warehouse is required'),
    to_warehouse_id: z.string().min(1, 'Destination warehouse is required'),
    transfer_date: z.string().min(1, 'Transfer date is required'),
    notes: z.string().optional(),
    items: z.array(stockTransferItemSchema).min(1, 'At least one item is required'),
}).refine((data) => data.from_warehouse_id !== data.to_warehouse_id, {
    message: 'Source and destination warehouses must be different',
    path: ['to_warehouse_id'],
})

export type StockTransferFormData = z.infer<typeof stockTransferSchema>
export type StockTransferItemFormData = z.infer<typeof stockTransferItemSchema>
