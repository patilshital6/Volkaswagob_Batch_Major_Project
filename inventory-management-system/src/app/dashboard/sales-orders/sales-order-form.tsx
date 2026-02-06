'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { salesOrderSchema } from '@/lib/validations/sales-order'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'

type SalesOrderFormValues = z.infer<typeof salesOrderSchema>

interface Product {
    id: string
    name: string
    sku: string
    image_url: string | null
}

interface Warehouse {
    id: string
    name: string
}

interface InventoryItem {
    product_id: string
    available_quantity: number
}

export function SalesOrderForm() {
    const [products, setProducts] = useState<Product[]>([])
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<SalesOrderFormValues>({
        resolver: zodResolver(salesOrderSchema),
        defaultValues: {
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            shipping_address: '',
            warehouse_id: '',
            order_date: new Date().toISOString().split('T')[0],
            items: [
                {
                    product_id: '',
                    quantity: 1,
                    unit_price: 0,
                },
            ],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    })

    const selectedWarehouse = form.watch('warehouse_id')

    useEffect(() => {
        fetchProducts()
        fetchWarehouses()
    }, [])

    useEffect(() => {
        if (selectedWarehouse) {
            fetchInventory(selectedWarehouse)
        }
    }, [selectedWarehouse])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, sku, image_url')
                .order('name')

            if (error) throw error
            setProducts(data || [])
        } catch (error: any) {
            toast.error('Failed to load products')
            console.error(error)
        }
    }

    const fetchWarehouses = async () => {
        try {
            const { data, error } = await supabase
                .from('warehouses')
                .select('id, name')
                .order('name')

            if (error) throw error
            setWarehouses(data || [])
        } catch (error: any) {
            toast.error('Failed to load warehouses')
            console.error(error)
        }
    }

    const fetchInventory = async (warehouseId: string) => {
        try {
            const { data, error } = await supabase
                .from('inventory')
                .select('product_id, available_quantity')
                .eq('warehouse_id', warehouseId)

            if (error) throw error
            setInventory(data || [])
        } catch (error: any) {
            toast.error('Failed to load inventory')
            console.error(error)
        }
    }

    const getAvailableQuantity = (productId: string | undefined): number => {
        if (!productId) return 0;
        const item = inventory.find((i) => i.product_id === productId)
        return item?.available_quantity || 0
    }

    const handleProductChange = async (productId: string, index: number) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('unit_price')
                .eq('id', productId)
                .single()

            if (error) throw error

            form.setValue(`items.${index}.unit_price`, data.unit_price || 0)
        } catch (error: any) {
            console.error(error)
        }
    }

    const onSubmit = async (data: SalesOrderFormValues) => {
        console.log('Create Sales Order button clicked', data);
        setLoading(true)

        try {
            console.log('Starting sales order creation...');
            
            // Validate inventory availability
            console.log('Validating inventory for', data.items.length, 'items...');
            for (const item of data.items) {
                const available = getAvailableQuantity(item.product_id)
                console.log(`Product ${item.product_id}: available=${available}, required=${item.quantity}`);
                if (item.quantity > available) {
                    const product = products.find((p) => p.id === item.product_id)
                    const errorMsg = `Insufficient inventory for ${product?.name}. Available: ${available}, Required: ${item.quantity}`
                    console.error('INVENTORY VALIDATION FAILED:', errorMsg);
                    toast.error(errorMsg)
                    setLoading(false)
                    return
                }
            }
            console.log('Inventory validation passed!');

            // Generate SO number
            console.log('Generating SO number...');
            const today = new Date()
            const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')

            const { data: lastOrder, error: lastOrderError } = await supabase
                .from('sales_orders')
                .select('order_number')
                .like('order_number', `SO-${dateStr}-%`)
                .order('order_number', { ascending: false })
                .limit(1)
                .single()

            if (lastOrderError && lastOrderError.code !== 'PGRST116') {
                console.error('Error fetching last order:', lastOrderError);
            }

            let nextNumber = 1
            if (lastOrder) {
                const lastNum = parseInt(lastOrder.order_number.split('-')[2])
                nextNumber = lastNum + 1
            }

            const soNumber = `SO-${dateStr}-${nextNumber.toString().padStart(4, '0')}`
            console.log('Generated SO number:', soNumber);

            // Calculate total amount
            const totalAmount = data.items.reduce(
                (sum, item) => sum + item.quantity * item.unit_price,
                0
            )
            console.log('Total amount:', totalAmount);

            // Get current user
            console.log('Getting current user...');
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (userError) {
                console.error('User auth error:', userError);
                throw userError;
            }
            if (!user) throw new Error('Not authenticated')
            console.log('User authenticated:', user.id);

            // Create sales order
            console.log('Creating sales order with data:', {
                order_number: soNumber,
                customer_name: data.customer_name,
                warehouse_id: data.warehouse_id,
                total_amount: totalAmount,
            });
            const { data: salesOrder, error: soError } = await supabase
                .from('sales_orders')
                .insert({
                    order_number: soNumber,
                    customer_name: data.customer_name,
                    customer_email: data.customer_email,
                    customer_phone: data.customer_phone,
                    shipping_address: data.shipping_address,
                    warehouse_id: data.warehouse_id,
                    order_date: data.order_date,
                    status: 'pending',
                    total_amount: totalAmount,
                    created_by: user.id,
                })
                .select()
                .single()

            if (soError) {
                console.error('Sales order creation error:', soError)
                throw soError
            }

            console.log('Sales order created successfully:', salesOrder)

            // Create sales order items
            const items = data.items.map((item) => ({
                order_id: salesOrder.id,
                product_id: item.product_id,
                warehouse_id: data.warehouse_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.quantity * item.unit_price,
            }))

            console.log('Inserting order items:', items);
            const { error: itemsError } = await supabase
                .from('sales_order_items')
                .insert(items)

            if (itemsError) {
                console.error('Items insert error:', itemsError);
                throw itemsError;
            }

            console.log('Order items inserted successfully!');
            toast.success('Sales order created successfully')
            console.log('Redirecting to /dashboard/sales-orders');
            router.push('/dashboard/sales-orders')
        } catch (error: any) {
            console.error('Full error details:', error)
            const errorMessage = error?.message || error?.error_description || 'Failed to create sales order'
            toast.error(errorMessage)
            console.error('Error creating sales order:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="customer_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter customer name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="customer_email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="customer@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="customer_phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 (555) 000-0000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="shipping_address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shipping Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter full shipping address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="warehouse_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Warehouse</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select warehouse" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {warehouses.map((warehouse) => (
                                                    <SelectItem key={warehouse.id} value={warehouse.id}>
                                                        {warehouse.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="order_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Order Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => {
                            const productId = form.watch(`items.${index}.product_id`)
                            const quantity = form.watch(`items.${index}.quantity`)
                            const unitPrice = form.watch(`items.${index}.unit_price`)
                            const available = getAvailableQuantity(productId)

                            const selectedProduct = products.find((p) => p.id === productId)

                            return (
                                <div key={field.id} className="flex gap-4 items-start border-b pb-4">
                                    {selectedProduct?.image_url && (
                                        <div className="relative w-16 h-16 rounded-md overflow-hidden border flex-shrink-0">
                                            <Image
                                                src={selectedProduct.image_url}
                                                alt={selectedProduct.name}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-4">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.product_id`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product</FormLabel>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            field.onChange(value)
                                                            handleProductChange(value, index)
                                                        }}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select product" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {products.map((product) => (
                                                                <SelectItem key={product.id} value={product.id}>
                                                                    <div className="flex items-center gap-2">
                                                                        {product.image_url && (
                                                                            <div className="relative w-6 h-6 rounded overflow-hidden flex-shrink-0">
                                                                                <Image
                                                                                    src={product.image_url}
                                                                                    alt={product.name}
                                                                                    width={24}
                                                                                    height={24}
                                                                                    className="object-cover"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        <span>{product.name} ({product.sku})</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Quantity</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                value={typeof field.value === 'number' && !isNaN(field.value) ? field.value : ''}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value)
                                                                    field.onChange(isNaN(val) ? 1 : val)
                                                                }}
                                                            />
                                                        </FormControl>
                                                        {productId && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Available: {available}
                                                            </p>
                                                        )}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.unit_price`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Unit Price</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={typeof field.value === 'number' && !isNaN(field.value) ? field.value : ''}
                                                                onChange={(e) => {
                                                                    const val = parseFloat(e.target.value)
                                                                    field.onChange(isNaN(val) ? 0 : val)
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div>
                                                <FormLabel>Total</FormLabel>
                                                <div className="text-sm font-medium mt-2">
                                                    ${((!isNaN(quantity) && quantity ? quantity : 0) * (!isNaN(unitPrice) && unitPrice ? unitPrice : 0)).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="mt-8"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )
                        })}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                append({
                                    product_id: '',
                                    quantity: 1,
                                    unit_price: 0,
                                })
                            }
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                        </Button>

                        <div className="flex justify-end pt-4 border-t">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total Amount</p>
                                <p className="text-2xl font-bold">
                                    $
                                    {form
                                        .watch('items')
                                        .reduce(
                                            (sum, item) =>
                                                sum + (item.quantity || 0) * (item.unit_price || 0),
                                            0
                                        )
                                        .toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Sales Order
                    </Button>
                </div>
            </form>
        </Form>
    )
}
