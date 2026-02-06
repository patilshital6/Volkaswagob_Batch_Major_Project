'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Package, FileText, Calendar, Warehouse, User } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'

interface PurchaseOrderItem {
    id: string
    quantity: number
    unit_price: number
    received_quantity: number
    product: {
        name: string
        sku: string
        image_url: string | null
    }
}

interface PurchaseOrder {
    id: string
    po_number: string
    order_date: string
    expected_date: string | null
    status: 'draft' | 'sent' | 'partial' | 'received' | 'cancelled'
    total_amount: number
    notes: string | null
    created_at: string
    supplier: {
        name: string
        contact_person: string | null
        phone: string | null
    }
    warehouse: {
        name: string
    }
}

export default function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null)
    const [items, setItems] = useState<PurchaseOrderItem[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        fetchPurchaseOrder()
        fetchItems()
    }, [id])

    const fetchPurchaseOrder = async () => {
        try {
            const { data, error } = await supabase
                .from('purchase_orders')
                .select(`
          *,
          supplier:suppliers(name, contact_person, phone),
          warehouse:warehouses(name)
        `)
                .eq('id', id)
                .single()

            if (error) throw error
            setPurchaseOrder(data)
        } catch (error) {
            toast.error('Failed to load purchase order')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from('purchase_order_items')
                .select(`
          *,
          product:products(name, sku, image_url)
        `)
                .eq('po_id', id)

            if (error) throw error
            setItems(data || [])
        } catch (error) {
            toast.error('Failed to load items')
            console.error(error)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge variant="secondary">Draft</Badge>
            case 'sent':
                return <Badge variant="outline">Sent</Badge>
            case 'partial':
                return <Badge variant="outline">Partially Received</Badge>
            case 'received':
                return <Badge variant="default">Received</Badge>
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center py-10">Loading...</div>
    }

    if (!purchaseOrder) {
        return (
            <div className="text-center py-10">
                <p className="text-muted-foreground">Purchase order not found</p>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/purchase-orders">Back to Purchase Orders</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/purchase-orders">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{purchaseOrder.po_number}</h1>
                        <p className="text-muted-foreground">Purchase Order Details</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {['draft', 'sent', 'partial'].includes(purchaseOrder.status) && (
                        <Button asChild>
                            <Link href={`/dashboard/purchase-orders/${purchaseOrder.id}/receive`}>
                                <Package className="mr-2 h-4 w-4" />
                                Receive Items
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">PO Number</p>
                                <p className="font-medium">{purchaseOrder.po_number}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Order Date</p>
                                <p className="font-medium">
                                    {new Date(purchaseOrder.order_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        {purchaseOrder.expected_date && (
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Expected Delivery</p>
                                    <p className="font-medium">
                                        {new Date(purchaseOrder.expected_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Status</p>
                            {getStatusBadge(purchaseOrder.status)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Supplier & Warehouse</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Supplier</p>
                                <p className="font-medium">{purchaseOrder.supplier.name}</p>
                                {purchaseOrder.supplier.contact_person && (
                                    <p className="text-sm text-muted-foreground">
                                        {purchaseOrder.supplier.contact_person}
                                    </p>
                                )}
                                {purchaseOrder.supplier.phone && (
                                    <p className="text-sm text-muted-foreground">{purchaseOrder.supplier.phone}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Warehouse className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Warehouse</p>
                                <p className="font-medium">{purchaseOrder.warehouse.name}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-2xl font-bold">${purchaseOrder.total_amount.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {purchaseOrder.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{purchaseOrder.notes}</p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px]">Image</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Received</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
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
                                        <TableCell className="text-right">
                                            <Badge variant={item.received_quantity === item.quantity ? 'default' : 'secondary'}>
                                                {item.received_quantity} / {item.quantity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${(item.quantity * item.unit_price).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
