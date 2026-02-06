import { z } from 'zod'

export const purchaseOrderItemSchema = z.object({
    product_id: z.string().min(1, 'Product is required'),
    quantity: z.coerce.number().positive('Quantity must be positive'),
    unit_price: z.coerce.number().positive('Unit price must be positive'),
    received_quantity: z.coerce.number().min(0).default(0),
})

export const purchaseOrderSchema = z.object({
    po_number: z.string().min(1, 'PO number is required'),
    supplier_id: z.string().min(1, 'Supplier is required'),
    warehouse_id: z.string().min(1, 'Warehouse is required'),
    expected_date: z.string().optional(),
    status: z.enum(['draft', 'approved', 'received', 'cancelled']).default('draft'),
    notes: z.string().optional(),
})

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>
export type PurchaseOrderItemFormData = z.infer<typeof purchaseOrderItemSchema>
