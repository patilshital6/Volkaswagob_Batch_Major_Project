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
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { stockTransferSchema } from '@/lib/validations/stock-transfer'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'

type StockTransferFormValues = z.infer<typeof stockTransferSchema>

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

export function StockTransferForm() {
    const [products, setProducts] = useState<Product[]>([])
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<StockTransferFormValues>({
        resolver: zodResolver(stockTransferSchema),
        defaultValues: {
            from_warehouse_id: '',
            to_warehouse_id: '',
            transfer_date: new Date().toISOString().split('T')[0],
            notes: '',
            items: [
                {
                    product_id: '',
                    quantity: 1,
                },
            ],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    })

    const selectedFromWarehouse = form.watch('from_warehouse_id')

    useEffect(() => {
        fetchProducts()
        fetchWarehouses()
    }, [])

    useEffect(() => {
        if (selectedFromWarehouse) {
            fetchInventory(selectedFromWarehouse)
        }
    }, [selectedFromWarehouse])

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

    const getAvailableQuantity = (productId: string): number => {
        const item = inventory.find((i) => i.product_id === productId)
        return item?.available_quantity || 0
    }

    const onSubmit = async (data: StockTransferFormValues) => {
        setLoading(true)

        try {
            // Validate inventory availability
            for (const item of data.items) {
                const available = getAvailableQuantity(item.product_id)
                if (item.quantity > available) {
                    const product = products.find((p) => p.id === item.product_id)
                    toast.error(
                        `Insufficient inventory for ${product?.name}. Available: ${available}, Required: ${item.quantity}`
                    )
                    setLoading(false)
                    return
                }
            }

            // Generate transfer number
            const today = new Date()
            const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')

            const { data: lastTransfer } = await supabase
                .from('stock_transfers')
                .select('transfer_number')
                .like('transfer_number', `TR-${dateStr}-%`)
                .order('transfer_number', { ascending: false })
                .limit(1)
                .single()

            let nextNumber = 1
            if (lastTransfer) {
                const lastNum = parseInt(lastTransfer.transfer_number.split('-')[2])
                nextNumber = lastNum + 1
            }

            const transferNumber = `TR-${dateStr}-${nextNumber.toString().padStart(4, '0')}`

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Create stock transfer
            const { data: stockTransfer, error: transferError } = await supabase
                .from('stock_transfers')
                .insert({
                    transfer_number: transferNumber,
                    from_warehouse_id: data.from_warehouse_id,
                    to_warehouse_id: data.to_warehouse_id,
                    transfer_date: data.transfer_date,
                    status: 'pending',
                    notes: data.notes || null,
                    created_by: user.id,
                })
                .select()
                .single()

            if (transferError) throw transferError

            // Create transfer items
            const items = data.items.map((item) => ({
                transfer_id: stockTransfer.id,
                product_id: item.product_id,
                quantity: item.quantity,
            }))

            const { error: itemsError } = await supabase
                .from('stock_transfer_items')
                .insert(items)

            if (itemsError) throw itemsError

            toast.success('Stock transfer created successfully')
            router.push('/dashboard/stock-transfers')
        } catch (error: any) {
            toast.error('Failed to create stock transfer')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Transfer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="from_warehouse_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>From Warehouse (Source)</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select source warehouse" />
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
                                name="to_warehouse_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>To Warehouse (Destination)</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select destination warehouse" />
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
                        </div>

                        <FormField
                            control={form.control}
                            name="transfer_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Transfer Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any notes about this transfer..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Transfer Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => {
                            const productId = form.watch(`items.${index}.product_id`)
                            const quantity = form.watch(`items.${index}.quantity`)
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
                                                        onValueChange={field.onChange}
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
                                                                const val = parseInt(e.target.value, 10)
                                                                field.onChange(isNaN(val) ? 1 : val)
                                                            }}
                                                        />
                                                    </FormControl>
                                                    {productId && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Available in source warehouse: {available}
                                                        </p>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                                })
                            }
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                        </Button>
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
                        Create Transfer
                    </Button>
                </div>
            </form>
        </Form>
    )
}
