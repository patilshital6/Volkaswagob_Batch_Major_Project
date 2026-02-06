'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Package } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'

interface PurchaseOrderItem {
    id: string
    quantity: number
    unit_price: number
    received_quantity: number
    product_id: string
    product: {
        name: string
        sku: string
        image_url: string | null
    }
}

interface PurchaseOrder {
    id: string
    po_number: string
    warehouse_id: string
}

export default function ReceivePurchaseOrderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null)
    const [items, setItems] = useState<PurchaseOrderItem[]>([])
    const [receivingQuantities, setReceivingQuantities] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [id])

    const fetchData = async () => {
        try {
            const { data: poData, error: poError } = await supabase
                .from('purchase_orders')
                .select('id, po_number, warehouse_id')
                .eq('id', id)
                .single()

            if (poError) throw poError

            const { data: itemsData, error: itemsError } = await supabase
                .from('purchase_order_items')
                .select(`
          *,
          product:products(name, sku, image_url)
        `)
                .eq('po_id', id)

            if (itemsError) throw itemsError

            setPurchaseOrder(poData)
            setItems(itemsData || [])

            const initialQuantities: Record<string, number> = {}
            itemsData?.forEach((item) => {
                initialQuantities[item.id] = item.quantity - item.received_quantity
            })
            setReceivingQuantities(initialQuantities)
        } catch (error) {
            toast.error('Failed to load purchase order')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleQuantityChange = (itemId: string, value: string) => {
        const numValue = parseInt(value) || 0
        setReceivingQuantities({
            ...receivingQuantities,
            [itemId]: numValue,
        })
    }

    const handleReceive = async () => {
        if (!purchaseOrder) return

        const itemsToReceive = Object.entries(receivingQuantities).filter(
            ([_, qty]) => qty > 0
        )

        if (itemsToReceive.length === 0) {
            toast.error('Please enter quantities to receive')
            return
        }

        setSubmitting(true)

        try {
            for (const [itemId, qty] of itemsToReceive) {
                const item = items.find((i) => i.id === itemId)
                if (!item) continue

                const newReceivedQty = item.received_quantity + qty

                await supabase
                    .from('purchase_order_items')
                    .update({ received_quantity: newReceivedQty })
                    .eq('id', itemId)

                const { data: inventoryData } = await supabase
                    .from('inventory')
                    .select('id, available_quantity')
                    .eq('product_id', item.product_id)
                    .eq('warehouse_id', purchaseOrder.warehouse_id)
                    .single()

                if (inventoryData) {
                    await supabase
                        .from('inventory')
                        .update({ available_quantity: inventoryData.available_quantity + qty })
                        .eq('id', inventoryData.id)
                } else {
                    await supabase
                        .from('inventory')
                        .insert([{
                            product_id: item.product_id,
                            warehouse_id: purchaseOrder.warehouse_id,
                            available_quantity: qty,
                            reserved_quantity: 0,
                        }])
                }

                // Get current user for transaction record
                const { data: { user } } = await supabase.auth.getUser()
                
                await supabase
                    .from('transactions')
                    .insert([{
                        product_id: item.product_id,
                        warehouse_id: purchaseOrder.warehouse_id,
                        type: 'restock',
                        quantity: qty,
                        reference_id: id,
                        performed_by: user?.id,
                    }])
            }

            const allReceived = items.every((item) => {
                const receivingQty = receivingQuantities[item.id] || 0
                return item.received_quantity + receivingQty >= item.quantity
            })

            if (allReceived) {
                await supabase
                    .from('purchase_orders')
                    .update({ status: 'received' })
                    .eq('id', id)
            }

            toast.success('Items received successfully')
            router.push(`/dashboard/purchase-orders/${id}`)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to receive items')
            console.error(error)
        } finally {
            setSubmitting(false)
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
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/purchase-orders/${id}`}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Receive Items</h1>
                    <p className="text-muted-foreground">{purchaseOrder.po_number}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Items to Receive
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px]">Image</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead className="text-right">Ordered</TableHead>
                                    <TableHead className="text-right">Already Received</TableHead>
                                    <TableHead className="text-right">Remaining</TableHead>
                                    <TableHead className="text-right">Receive Now</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => {
                                    const remaining = item.quantity - item.received_quantity
                                    return (
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
                                            <TableCell className="text-right">{item.received_quantity}</TableCell>
                                            <TableCell className="text-right font-medium">{remaining}</TableCell>
                                            <TableCell className="text-right">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={remaining}
                                                    value={receivingQuantities[item.id] || ''}
                                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                    className="w-24 ml-auto"
                                                    disabled={remaining === 0}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/dashboard/purchase-orders/${id}`}>Cancel</Link>
                        </Button>
                        <Button onClick={handleReceive} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Package className="mr-2 h-4 w-4" />
                            Receive Items
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
