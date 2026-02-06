export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer'
export type TransactionType = 'restock' | 'sale' | 'return' | 'adjustment' | 'transfer_out' | 'transfer_in'
export type POStatus = 'draft' | 'sent' | 'partial' | 'received' | 'cancelled'
export type SalesStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type TransferStatus = 'pending' | 'in_transit' | 'completed' | 'cancelled'

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    role: UserRole
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    role?: UserRole
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    role?: UserRole
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    parent_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    parent_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    parent_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    sku: string
                    name: string
                    description: string | null
                    category_id: string | null
                    unit_price: number
                    cost_price: number
                    reorder_level: number
                    reorder_quantity: number
                    image_url: string | null
                    barcode: string | null
                    is_active: boolean
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    sku: string
                    name: string
                    description?: string | null
                    category_id?: string | null
                    unit_price?: number
                    cost_price?: number
                    reorder_level?: number
                    reorder_quantity?: number
                    image_url?: string | null
                    barcode?: string | null
                    is_active?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    sku?: string
                    name?: string
                    description?: string | null
                    category_id?: string | null
                    unit_price?: number
                    cost_price?: number
                    reorder_level?: number
                    reorder_quantity?: number
                    image_url?: string | null
                    barcode?: string | null
                    is_active?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            warehouses: {
                Row: {
                    id: string
                    name: string
                    location: string
                    address: string | null
                    capacity: number | null
                    manager_id: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    location: string
                    address?: string | null
                    capacity?: number | null
                    manager_id?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    location?: string
                    address?: string | null
                    capacity?: number | null
                    manager_id?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            inventory: {
                Row: {
                    id: string
                    product_id: string
                    warehouse_id: string
                    available_quantity: number
                    reserved_quantity: number
                    total_quantity: number
                    last_counted_at: string | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    warehouse_id: string
                    available_quantity?: number
                    reserved_quantity?: number
                    last_counted_at?: string | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    product_id?: string
                    warehouse_id?: string
                    available_quantity?: number
                    reserved_quantity?: number
                    last_counted_at?: string | null
                    updated_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    product_id: string
                    warehouse_id: string
                    type: TransactionType
                    quantity: number
                    reference_id: string | null
                    reason: string | null
                    performed_by: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    warehouse_id: string
                    type: TransactionType
                    quantity: number
                    reference_id?: string | null
                    reason?: string | null
                    performed_by: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    product_id?: string
                    warehouse_id?: string
                    type?: TransactionType
                    quantity?: number
                    reference_id?: string | null
                    reason?: string | null
                    performed_by?: string
                    created_at?: string
                }
            }
            suppliers: {
                Row: {
                    id: string
                    name: string
                    contact_person: string | null
                    email: string | null
                    phone: string | null
                    address: string | null
                    payment_terms: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    contact_person?: string | null
                    email?: string | null
                    phone?: string | null
                    address?: string | null
                    payment_terms?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    contact_person?: string | null
                    email?: string | null
                    phone?: string | null
                    address?: string | null
                    payment_terms?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            purchase_orders: {
                Row: {
                    id: string
                    po_number: string
                    supplier_id: string
                    warehouse_id: string
                    status: POStatus
                    total_amount: number
                    expected_date: string | null
                    received_date: string | null
                    notes: string | null
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    po_number: string
                    supplier_id: string
                    warehouse_id: string
                    status?: POStatus
                    total_amount?: number
                    expected_date?: string | null
                    received_date?: string | null
                    notes?: string | null
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    po_number?: string
                    supplier_id?: string
                    warehouse_id?: string
                    status?: POStatus
                    total_amount?: number
                    expected_date?: string | null
                    received_date?: string | null
                    notes?: string | null
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            purchase_order_items: {
                Row: {
                    id: string
                    po_id: string
                    product_id: string
                    quantity: number
                    unit_price: number
                    received_quantity: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    po_id: string
                    product_id: string
                    quantity: number
                    unit_price: number
                    received_quantity?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    po_id?: string
                    product_id?: string
                    quantity?: number
                    unit_price?: number
                    received_quantity?: number
                    created_at?: string
                }
            }
            sales_orders: {
                Row: {
                    id: string
                    order_number: string
                    customer_name: string
                    customer_email: string | null
                    customer_phone: string | null
                    shipping_address: string | null
                    warehouse_id: string | null
                    status: SalesStatus
                    total_amount: number
                    order_date: string
                    fulfillment_date: string | null
                    notes: string | null
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    order_number: string
                    customer_name: string
                    customer_email?: string | null
                    customer_phone?: string | null
                    shipping_address?: string | null
                    warehouse_id?: string | null
                    status?: SalesStatus
                    total_amount?: number
                    order_date?: string
                    fulfillment_date?: string | null
                    notes?: string | null
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    order_number?: string
                    customer_name?: string
                    customer_email?: string | null
                    customer_phone?: string | null
                    shipping_address?: string | null
                    warehouse_id?: string | null
                    status?: SalesStatus
                    total_amount?: number
                    order_date?: string
                    fulfillment_date?: string | null
                    notes?: string | null
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            sales_order_items: {
                Row: {
                    id: string
                    order_id: string
                    product_id: string
                    warehouse_id: string
                    quantity: number
                    unit_price: number
                    total_price: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    product_id: string
                    warehouse_id: string
                    quantity: number
                    unit_price: number
                    total_price?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    product_id?: string
                    warehouse_id?: string
                    quantity?: number
                    unit_price?: number
                    total_price?: number
                    created_at?: string
                }
            }
            stock_transfers: {
                Row: {
                    id: string
                    transfer_number: string
                    from_warehouse_id: string
                    to_warehouse_id: string
                    status: TransferStatus
                    transfer_date: string | null
                    notes: string | null
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    transfer_number: string
                    from_warehouse_id: string
                    to_warehouse_id: string
                    status?: TransferStatus
                    transfer_date?: string | null
                    notes?: string | null
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    transfer_number?: string
                    from_warehouse_id?: string
                    to_warehouse_id?: string
                    status?: TransferStatus
                    transfer_date?: string | null
                    notes?: string | null
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            stock_transfer_items: {
                Row: {
                    id: string
                    transfer_id: string
                    product_id: string
                    quantity: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    transfer_id: string
                    product_id: string
                    quantity: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    transfer_id?: string
                    product_id?: string
                    quantity?: number
                    created_at?: string
                }
            }
        }
        Views: {
            low_stock_alerts: {
                Row: {
                    id: string
                    sku: string
                    name: string
                    reorder_level: number
                    warehouse_name: string
                    available_quantity: number
                    reserved_quantity: number
                    total_quantity: number
                }
            }
            inventory_value_by_warehouse: {
                Row: {
                    warehouse_id: string
                    warehouse_name: string
                    total_products: number
                    total_value: number
                }
            }
        }
    }
}
