import { z } from 'zod'

export const salesOrderItemSchema = z.object({
    product_id: z.string().min(1, 'Product is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unit_price: z.number().min(0, 'Unit price must be non-negative'),
})

export const salesOrderSchema = z.object({
    customer_name: z.string().min(2, 'Customer name is required').max(100),
    customer_email: z.string().email('Invalid email').optional().or(z.literal('')),
    customer_phone: z.string().optional(),
    shipping_address: z.string().min(1, 'Shipping address is required'),
    warehouse_id: z.string().min(1, 'Warehouse is required'),
    order_date: z.string().min(1, 'Order date is required'),
    items: z.array(salesOrderItemSchema).min(1, 'At least one item is required'),
})

export type SalesOrderFormData = z.infer<typeof salesOrderSchema>
export type SalesOrderItemFormData = z.infer<typeof salesOrderItemSchema>
