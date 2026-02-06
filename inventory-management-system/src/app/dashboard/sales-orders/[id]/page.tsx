'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { GenerateInvoiceButton } from '@/components/generate-invoice-button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Truck, PackageCheck, Ban, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface SalesOrder {
    id: string
    order_number: string
    customer_name: string
    customer_email: string
    customer_phone: string
    shipping_address: string
    order_date: string
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    total_amount: number
    warehouse: {
        id: string
        name: string
    }
    items: Array<{
        id: string
        quantity: number
        unit_price: number
        total_price: number
        product: {
            id: string
            name: string
            sku: string
            image_url: string | null
        }
    }>
}

export default function SalesOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        fetchSalesOrder()
    }, [id])

    const fetchSalesOrder = async () => {
        try {
            const { data, error } = await supabase
                .from('sales_orders')
                .select(`
          id,
          order_number,
          customer_name,
          customer_email,
          customer_phone,
          shipping_address,
          order_date,
          status,
          total_amount,
          warehouse:warehouses(
            id,
            name
          ),
          items:sales_order_items(
            id,
            quantity,
            unit_price,
            total_price,
            product:products(
              id,
              name,
              sku,
              image_url
            )
          )
        `)
                .eq('id', id)
                .single()

            if (error) throw error
            setSalesOrder(data as any)
        } catch (error: any) {
            toast.error('Failed to load sales order')
            console.error(error)
            router.push('/dashboard/sales-orders')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!salesOrder) return

        setProcessing(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // If shipping, remove from reserved quantity (items are no longer reserved, they're shipped)
            if (newStatus === 'shipped' && salesOrder.status === 'processing') {
                for (const item of salesOrder.items) {
                    // Get current inventory
                    const { data: inventoryData, error: fetchError } = await supabase
                        .from('inventory')
                        .select('available_quantity, reserved_quantity')
                        .eq('product_id', item.product.id)
                        .eq('warehouse_id', salesOrder.warehouse.id)
                        .single()

                    if (fetchError) throw fetchError

                    // Decrease reserved quantity (items shipped, no longer reserved)
                    const newReservedQty = inventoryData.reserved_quantity - item.quantity

                    if (newReservedQty < 0) {
                        toast.error(`Inventory error for ${item.product.name}`)
                        setProcessing(false)
                        return
                    }

                    // Update inventory: decrease reserved quantity
                    const { error: updateError } = await supabase
                        .from('inventory')
                        .update({ reserved_quantity: newReservedQty })
                        .eq('product_id', item.product.id)
                        .eq('warehouse_id', salesOrder.warehouse.id)

                    if (updateError) throw updateError

                    // Create transaction record
                    await supabase
                        .from('transactions')
                        .insert({
                            product_id: item.product.id,
                            warehouse_id: salesOrder.warehouse.id,
                            type: 'sale',
                            quantity: -item.quantity, // Negative for sale
                            reference_id: salesOrder.id,
                            performed_by: user.id,
                        })
                }
            }

            // If cancelling, restore inventory
            if (newStatus === 'cancelled' && (salesOrder.status === 'pending' || salesOrder.status === 'processing')) {
                for (const item of salesOrder.items) {
                    // Get current inventory
                    const { data: inventoryData, error: fetchError } = await supabase
                        .from('inventory')
                        .select('available_quantity, reserved_quantity')
                        .eq('product_id', item.product.id)
                        .eq('warehouse_id', salesOrder.warehouse.id)
                        .single()

                    if (fetchError) throw fetchError

                    // Restore: increase available, decrease reserved
                    const { error: updateError } = await supabase
                        .from('inventory')
                        .update({
                            available_quantity: inventoryData.available_quantity + item.quantity,
                            reserved_quantity: inventoryData.reserved_quantity - item.quantity,
                        })
                        .eq('product_id', item.product.id)
                        .eq('warehouse_id', salesOrder.warehouse.id)

                    if (updateError) throw updateError

                    // Create transaction record for cancellation
                    await supabase
                        .from('transactions')
                        .insert({
                            product_id: item.product.id,
                            warehouse_id: salesOrder.warehouse.id,
                            type: 'adjustment',
                            quantity: item.quantity,
                            reference_id: salesOrder.id,
                            reason: 'Order cancelled - inventory restored',
                            performed_by: user.id,
                        })
                }
            }

            // Update sales order status
            const { error: statusError } = await supabase
                .from('sales_orders')
                .update({ status: newStatus })
                .eq('id', salesOrder.id)

            if (statusError) throw statusError

            toast.success(`Sales order ${newStatus}`)
            await fetchSalesOrder()
        } catch (error: any) {
            toast.error('Failed to update sales order')
            console.error(error)
        } finally {
            setProcessing(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>
            case 'processing':
                return <Badge className="bg-blue-500">Processing</Badge>
            case 'shipped':
                return <Badge className="bg-purple-500">Shipped</Badge>
            case 'delivered':
                return <Badge variant="default">Delivered</Badge>
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!salesOrder) {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{salesOrder.order_number}</h1>
                        <p className="text-muted-foreground">Sales order details and status</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <GenerateInvoiceButton
                        invoiceData={{
                            order: {
                                id: salesOrder.id,
                                order_number: salesOrder.order_number,
                                order_date: salesOrder.order_date,
                                status: salesOrder.status,
                                total_amount: salesOrder.total_amount,
                                customer_name: salesOrder.customer_name,
                                customer_email: salesOrder.customer_email,
                                customer_phone: salesOrder.customer_phone,
                                shipping_address: salesOrder.shipping_address,
                            },
                            items: salesOrder.items.map((item) => ({
                                product_name: item.product.name,
                                sku: item.product.sku,
                                quantity: item.quantity,
                                unit_price: item.unit_price,
                                total: item.total_price,
                            })),
                        }}
                    />
                    {getStatusBadge(salesOrder.status)}

                    {salesOrder.status === 'pending' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <PackageCheck className="mr-2 h-4 w-4" />
                                    Start Processing
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Start Processing Order?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will mark the order as processing and begin preparation for shipment.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleStatusChange('processing')}>
                                        Confirm
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    {salesOrder.status === 'processing' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Truck className="mr-2 h-4 w-4" />
                                    Mark as Shipped
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Ship Order?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will deduct inventory quantities and mark the order as shipped.
                                        This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleStatusChange('shipped')}>
                                        Confirm Shipment
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    {salesOrder.status === 'shipped' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <PackageCheck className="mr-2 h-4 w-4" />
                                    Mark as Delivered
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Delivery?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will mark the order as delivered and complete the fulfillment process.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleStatusChange('delivered')}>
                                        Confirm Delivery
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    {(salesOrder.status === 'pending' || salesOrder.status === 'processing') && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Ban className="mr-2 h-4 w-4" />
                                    Cancel Order
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will cancel the order. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleStatusChange('cancelled')}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Cancel Order
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{salesOrder.customer_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{salesOrder.customer_email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{salesOrder.customer_phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Shipping Address</p>
                            <p className="font-medium">{salesOrder.shipping_address}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Order Number</p>
                            <p className="font-medium">{salesOrder.order_number}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Warehouse</p>
                            <p className="font-medium">{salesOrder.warehouse.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Order Date</p>
                            <p className="font-medium">
                                {new Date(salesOrder.order_date).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-2xl font-bold">${salesOrder.total_amount.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60px]">Image</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salesOrder.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        {item.product.image_url ? (
                                            <div className="relative w-12 h-12 rounded-md overflow-hidden border">
                                                <Image
                                                    src={item.product.image_url}
                                                    alt={item.product.name}
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
                                    </TableCell>
                                    <TableCell className="font-medium">{item.product.name}</TableCell>
                                    <TableCell>{item.product.sku}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${item.total_price.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={5} className="text-right font-medium">
                                    Total Amount
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    ${salesOrder.total_amount.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
