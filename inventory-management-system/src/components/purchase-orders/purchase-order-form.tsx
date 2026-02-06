'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { purchaseOrderSchema, PurchaseOrderFormData } from '@/lib/validations/purchase-order'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface LineItem {
    id: string
    product_id: string
    product_name: string
    product_image_url: string | null
    quantity: number
    unit_price: number
}

interface Product {
    id: string
    name: string
    sku: string
    image_url: string | null
    unit_price: number
}

interface Supplier {
    id: string
    name: string
}

interface Warehouse {
    id: string
    name: string
}

export function PurchaseOrderForm() {
    const [loading, setLoading] = useState(false)
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [lineItems, setLineItems] = useState<LineItem[]>([])
    const [selectedProduct, setSelectedProduct] = useState('')
    const [quantity, setQuantity] = useState('')
    const [unitPrice, setUnitPrice] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<PurchaseOrderFormData>({
        resolver: zodResolver(purchaseOrderSchema) as any,
        defaultValues: {
            status: 'draft',
        },
    })

    useEffect(() => {
        fetchData()
        generatePONumber()
    }, [])

    const fetchData = async () => {
        try {
            const [suppliersRes, warehousesRes, productsRes] = await Promise.all([
                supabase.from('suppliers').select('id, name').eq('is_active', true).order('name'),
                supabase.from('warehouses').select('id, name').order('name'),
                supabase.from('products').select('id, name, sku, image_url, unit_price').order('name'),
            ])

            if (suppliersRes.error) throw suppliersRes.error
            if (warehousesRes.error) throw warehousesRes.error
            if (productsRes.error) throw productsRes.error

            setSuppliers(suppliersRes.data || [])
            setWarehouses(warehousesRes.data || [])
            setProducts(productsRes.data || [])
        } catch (error) {
            toast.error('Failed to load data')
            console.error(error)
        }
    }

    const generatePONumber = () => {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0')
        const poNumber = `PO-${year}${month}${day}-${random}`
        setValue('po_number', poNumber)
    }

    const addLineItem = () => {
        if (!selectedProduct || !quantity || !unitPrice) {
            toast.error('Please fill all product details')
            return
        }

        const product = products.find((p) => p.id === selectedProduct)
        if (!product) return

        const newItem: LineItem = {
            id: Math.random().toString(),
            product_id: selectedProduct,
            product_name: product.name,
            product_image_url: product.image_url,
            quantity: parseFloat(quantity),
            unit_price: parseFloat(unitPrice),
        }

        setLineItems([...lineItems, newItem])
        setSelectedProduct('')
        setQuantity('')
        setUnitPrice('')
    }

    const removeLineItem = (id: string) => {
        setLineItems(lineItems.filter((item) => item.id !== id))
    }

    const handleProductSelect = (productId: string) => {
        setSelectedProduct(productId)
        const product = products.find((p) => p.id === productId)
        if (product) {
            setUnitPrice(product.unit_price.toString())
        }
    }

    const calculateTotal = () => {
        return lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
    }

    const onSubmit = async (data: PurchaseOrderFormData) => {
        if (lineItems.length === 0) {
            toast.error('Please add at least one product')
            return
        }

        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const totalAmount = calculateTotal()

            const { data: poData, error: poError } = await supabase
                .from('purchase_orders')
                .insert([
                    {
                        ...data,
                        total_amount: totalAmount,
                        created_by: user.id,
                        status: 'draft', // Use 'draft' instead of 'pending' to match the enum
                    },
                ])
                .select()
                .single()

            if (poError) throw poError


            const poItems = lineItems.map((item) => ({
                po_id: poData.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                received_quantity: 0,
            }))

            const { error: itemsError } = await supabase
                .from('purchase_order_items')
                .insert(poItems)

            if (itemsError) throw itemsError

            toast.success('Purchase order created successfully')
            router.push('/dashboard/purchase-orders')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to create purchase order')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/purchase-orders">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">New Purchase Order</h1>
                    <p className="text-muted-foreground">Create a new purchase order</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="po_number">PO Number *</Label>
                                <Input id="po_number" {...register('po_number')} readOnly className="bg-muted" />
                                {errors.po_number && (
                                    <p className="text-sm text-destructive">{errors.po_number.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expected_date">Expected Delivery Date</Label>
                                <Input id="expected_date" type="date" {...register('expected_date')} />
                                {errors.expected_date && (
                                    <p className="text-sm text-destructive">{errors.expected_date.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">\n                            <div className="space-y-2">
                            <Label htmlFor="supplier_id">Supplier *</Label>
                            <Select onValueChange={(value) => setValue('supplier_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map((supplier) => (
                                        <SelectItem key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.supplier_id && (
                                <p className="text-sm text-destructive">{errors.supplier_id.message}</p>
                            )}
                        </div>

                            <div className="space-y-2">
                                <Label htmlFor="warehouse_id">Warehouse *</Label>
                                <Select onValueChange={(value) => setValue('warehouse_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select warehouse" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map((warehouse) => (
                                            <SelectItem key={warehouse.id} value={warehouse.id}>
                                                {warehouse.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.warehouse_id && (
                                    <p className="text-sm text-destructive">{errors.warehouse_id.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                placeholder="Add any notes or special instructions"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...register('notes')}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label>Product</Label>
                                <Select value={selectedProduct} onValueChange={handleProductSelect}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
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
                            </div>

                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    min="1"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Unit Price</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={unitPrice}
                                    onChange={(e) => setUnitPrice(e.target.value)}
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="flex items-end">
                                <Button type="button" onClick={addLineItem} className="w-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Item
                                </Button>
                            </div>
                        </div>

                        {lineItems.length > 0 && (
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-2 text-left text-sm font-medium w-[60px]">Image</th>
                                            <th className="p-2 text-left text-sm font-medium">Product</th>
                                            <th className="p-2 text-right text-sm font-medium">Quantity</th>
                                            <th className="p-2 text-right text-sm font-medium">Unit Price</th>
                                            <th className="p-2 text-right text-sm font-medium">Subtotal</th>
                                            <th className="p-2 text-right text-sm font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lineItems.map((item) => (
                                            <tr key={item.id} className="border-b">
                                                <td className="p-2">
                                                    {item.product_image_url ? (
                                                        <div className="relative w-12 h-12 rounded-md overflow-hidden border">
                                                            <Image
                                                                src={item.product_image_url}
                                                                alt={item.product_name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="48px"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-md border bg-muted flex items-center justify-center">
                                                            <span className="text-xs text-muted-foreground">No img</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-2 text-sm font-medium">{item.product_name}</td>
                                                <td className="p-2 text-right text-sm">{item.quantity}</td>
                                                <td className="p-2 text-right text-sm">${item.unit_price.toFixed(2)}</td>
                                                <td className="p-2 text-right text-sm font-medium">
                                                    ${(item.quantity * item.unit_price).toFixed(2)}
                                                </td>
                                                <td className="p-2 text-right">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeLineItem(item.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-muted/50">
                                            <td colSpan={4} className="p-2 text-right font-medium">
                                                Total Amount:
                                            </td>
                                            <td className="p-2 text-right font-bold text-lg">
                                                ${calculateTotal().toFixed(2)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {lineItems.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No items added yet. Add products to create the purchase order.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/dashboard/purchase-orders">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={loading || lineItems.length === 0}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Purchase Order
                    </Button>
                </div>
            </form>
        </div>
    )
}
