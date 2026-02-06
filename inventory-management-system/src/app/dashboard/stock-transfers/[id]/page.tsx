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
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, TruckIcon, PackageCheck, Ban } from 'lucide-react'
import Image from 'next/image'
import { getFirstProductImage } from '@/lib/utils/product-images'
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

interface StockTransfer {
    id: string
    transfer_number: string
    transfer_date: string
    status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
    notes: string | null
    from_warehouse: {
        id: string
        name: string
    }
    to_warehouse: {
        id: string
        name: string
    }
    items: Array<{
        id: string
        quantity: number
        product: {
            id: string
            name: string
            sku: string
            image_url: string | null
            product_images?: Array<{ image_url: string; is_primary: boolean }> | { image_url: string; is_primary: boolean } | null
        }
    }>
}

export default function StockTransferDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [transfer, setTransfer] = useState<StockTransfer | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        fetchTransfer()
    }, [id])

    const fetchTransfer = async () => {
        try {
            const { data, error } = await supabase
                .from('stock_transfers')
                .select(`
          id,
          transfer_number,
          transfer_date,
          status,
          notes,
          from_warehouse:warehouses!stock_transfers_from_warehouse_id_fkey(
            id,
            name
          ),
          to_warehouse:warehouses!stock_transfers_to_warehouse_id_fkey(
            id,
            name
          ),
          items:stock_transfer_items(
            id,
            quantity,
            product:products(
              id,
              name,
              sku,
              image_url,
              product_images(image_url, is_primary)
            )
          )
        `)
                .eq('id', id)
                .single()

            if (error) throw error
            setTransfer(data as any)
        } catch (error: any) {
            toast.error('Failed to load stock transfer')
            console.error(error)
            router.push('/dashboard/stock-transfers')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!transfer) return

        setProcessing(true)
        try {
            // If completing transfer, update inventory in both warehouses
            if (newStatus === 'completed' && transfer.status === 'in_transit') {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('Not authenticated')

                for (const item of transfer.items) {
                    // Deduct from source warehouse
                    const { data: fromInventory, error: fromFetchError } = await supabase
                        .from('inventory')
                        .select('available_quantity, reserved_quantity')
                        .eq('product_id', item.product.id)
                        .eq('warehouse_id', transfer.from_warehouse.id)
                        .single()

                    if (fromFetchError) throw fromFetchError

                    const newFromAvailable = fromInventory.available_quantity - item.quantity

                    if (newFromAvailable < 0) {
                        toast.error(`Insufficient inventory for ${item.product.name} in source warehouse`)
                        setProcessing(false)
                        return
                    }

                    // Update source warehouse inventory
                    const { error: fromUpdateError } = await supabase
                        .from('inventory')
                        .update({ available_quantity: newFromAvailable })
                        .eq('product_id', item.product.id)
                        .eq('warehouse_id', transfer.from_warehouse.id)

                    if (fromUpdateError) throw fromUpdateError

                    // Create transfer_out transaction
                    await supabase
                        .from('transactions')
                        .insert({
                            product_id: item.product.id,
                            warehouse_id: transfer.from_warehouse.id,
                            type: 'transfer_out',
                            quantity: -item.quantity,
                            reference_id: transfer.id,
                            performed_by: user.id,
                        })

                    // Add to destination warehouse
                    const { data: toInventory } = await supabase
                        .from('inventory')
                        .select('available_quantity, reserved_quantity')
                        .eq('product_id', item.product.id)
                        .eq('warehouse_id', transfer.to_warehouse.id)
                        .single()

                    if (toInventory) {
                        // Update existing inventory
                        const { error: toUpdateError } = await supabase
                            .from('inventory')
                            .update({ available_quantity: toInventory.available_quantity + item.quantity })
                            .eq('product_id', item.product.id)
                            .eq('warehouse_id', transfer.to_warehouse.id)

                        if (toUpdateError) throw toUpdateError
                    } else {
                        // Create new inventory record
                        const { error: toInsertError } = await supabase
                            .from('inventory')
                            .insert({
                                product_id: item.product.id,
                                warehouse_id: transfer.to_warehouse.id,
                                available_quantity: item.quantity,
                                reserved_quantity: 0,
                            })

                        if (toInsertError) throw toInsertError
                    }

                    // Create transfer_in transaction
                    await supabase
                        .from('transactions')
                        .insert({
                            product_id: item.product.id,
                            warehouse_id: transfer.to_warehouse.id,
                            type: 'transfer_in',
                            quantity: item.quantity,
                            reference_id: transfer.id,
                            performed_by: user.id,
                        })
                }
            }

            // Update transfer status
            const { error: statusError } = await supabase
                .from('stock_transfers')
                .update({ status: newStatus })
                .eq('id', transfer.id)

            if (statusError) throw statusError

            toast.success(`Transfer ${newStatus.replace('_', ' ')}`)
            await fetchTransfer()
        } catch (error: any) {
            toast.error('Failed to update transfer')
            console.error(error)
        } finally {
            setProcessing(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>
            case 'in_transit':
                return <Badge className="bg-blue-500">In Transit</Badge>
            case 'completed':
                return <Badge variant="default">Completed</Badge>
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

    if (!transfer) {
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
                        <h1 className="text-3xl font-bold">{transfer.transfer_number}</h1>
                        <p className="text-muted-foreground">Stock transfer details and status</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge(transfer.status)}

                    {transfer.status === 'pending' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <TruckIcon className="mr-2 h-4 w-4" />
                                    Start Transit
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Start Transit?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will mark the transfer as in transit, indicating items are being moved
                                        between warehouses.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleStatusChange('in_transit')}>
                                        Confirm
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    {transfer.status === 'in_transit' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <PackageCheck className="mr-2 h-4 w-4" />
                                    Complete Transfer
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Complete Transfer?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will update inventory levels in both warehouses. Items will be deducted
                                        from the source warehouse and added to the destination warehouse.
                                        This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleStatusChange('completed')}>
                                        Complete Transfer
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    {(transfer.status === 'pending' || transfer.status === 'in_transit') && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Ban className="mr-2 h-4 w-4" />
                                    Cancel Transfer
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Transfer?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will cancel the transfer. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Transfer</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleStatusChange('cancelled')}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Cancel Transfer
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
                        <CardTitle>Transfer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Transfer Number</p>
                            <p className="font-medium">{transfer.transfer_number}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">From Warehouse</p>
                            <p className="font-medium">{transfer.from_warehouse.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">To Warehouse</p>
                            <p className="font-medium">{transfer.to_warehouse.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Transfer Date</p>
                            <p className="font-medium">
                                {new Date(transfer.transfer_date).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {transfer.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{transfer.notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transfer Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60px]">Image</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transfer.items.map((item) => {
                                const productImages = item.product.product_images
                                    ? Array.isArray(item.product.product_images)
                                        ? item.product.product_images
                                        : [item.product.product_images]
                                    : []
                                const displayImage = getFirstProductImage(productImages) || item.product.image_url

                                return (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        {displayImage ? (
                                            <div className="relative w-12 h-12 rounded-md overflow-hidden border">
                                                <Image
                                                    src={displayImage}
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
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
