'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { toast } from 'sonner'
import { ArrowLeft, Edit, Loader2, Warehouse as WarehouseIcon, MapPin, Package } from 'lucide-react'
import Image from 'next/image'
import { getFirstProductImage } from '@/lib/utils/product-images'

interface Warehouse {
    id: string
    name: string
    location: string
    address: string | null
    capacity: number | null
    is_active: boolean
    manager: { full_name: string } | null
    created_at: string
}

interface InventoryItem {
    product_id: string
    product: {
        name: string
        sku: string
        cost_price: number
        image_url: string | null
        product_images?: Array<{ image_url: string; is_primary: boolean }> | { image_url: string; is_primary: boolean } | null
    } | null
    available_quantity: number
    reserved_quantity: number
    total_quantity: number
}

interface InventorySummary {
    totalProducts: number
    totalQuantity: number
    totalValue: number
}

export default function WarehouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [summary, setSummary] = useState<InventorySummary>({ totalProducts: 0, totalQuantity: 0, totalValue: 0 })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchWarehouse()
        fetchInventory()
    }, [id])

    const fetchWarehouse = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('warehouses')
                .select('*, manager:profiles!manager_id(full_name)')
                .eq('id', id)
                .single()

            if (error) throw error
            setWarehouse(data)
        } catch (error: any) {
            toast.error('Failed to load warehouse')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchInventory = async () => {
        try {
            const { data, error } = await supabase
                .from('inventory')
                .select(`
                    product_id,
                    available_quantity,
                    reserved_quantity,
                    total_quantity,
                    product:products(
                        name,
                        sku,
                        cost_price,
                        image_url,
                        product_images(image_url, is_primary)
                    )
                `)
                .eq('warehouse_id', id)
                .order('total_quantity', { ascending: false })

            if (error) throw error

            // Transform data to match interface (Supabase returns nested relations as arrays)
            const inventoryItems: InventoryItem[] = (data || []).map((item: any) => {
                const product = Array.isArray(item.product) ? item.product[0] : item.product
                return {
                    product_id: item.product_id,
                    available_quantity: item.available_quantity,
                    reserved_quantity: item.reserved_quantity,
                    total_quantity: item.total_quantity,
                    product: product || null,
                }
            })
            setInventory(inventoryItems)

            // Calculate summary
            const summary: InventorySummary = {
                totalProducts: inventoryItems.length,
                totalQuantity: inventoryItems.reduce((sum, item) => sum + item.total_quantity, 0),
                totalValue: inventoryItems.reduce((sum, item) => sum + (item.total_quantity * (item.product?.cost_price || 0)), 0),
            }
            setSummary(summary)
        } catch (error: any) {
            console.error('Failed to load inventory:', error)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!warehouse) {
        return (
            <div className="text-center py-10">
                <WarehouseIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">Warehouse not found</h3>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/warehouses">Back to Warehouses</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/warehouses">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {warehouse.location}
                    </p>
                </div>
                <Button asChild>
                    <Link href={`/dashboard/warehouses/${id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Warehouse
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Warehouse Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{warehouse.name}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="font-medium">{warehouse.location}</p>
                        </div>

                        {warehouse.address && (
                            <div>
                                <p className="text-sm text-muted-foreground">Address</p>
                                <p className="font-medium">{warehouse.address}</p>
                            </div>
                        )}

                        {warehouse.capacity && (
                            <div>
                                <p className="text-sm text-muted-foreground">Capacity</p>
                                <p className="font-medium">{warehouse.capacity} units</p>
                            </div>
                        )}

                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant={warehouse.is_active ? 'default' : 'secondary'}>
                                {warehouse.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>

                        {warehouse.manager && (
                            <div>
                                <p className="text-sm text-muted-foreground">Manager</p>
                                <p className="font-medium">{warehouse.manager.full_name}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-sm text-muted-foreground">Created</p>
                            <p className="font-medium">
                                {new Date(warehouse.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Products</p>
                                <p className="text-2xl font-bold">{summary.totalProducts}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Quantity</p>
                                <p className="text-2xl font-bold">{summary.totalQuantity.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold">${summary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                        </div>

                        {inventory.length > 0 ? (
                            <div className="border rounded-md mt-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[60px]">Image</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-right">Available</TableHead>
                                            <TableHead className="text-right">Reserved</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="text-right">Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {inventory.slice(0, 5).map((item) => {
                                            const productImages = item.product?.product_images
                                                ? Array.isArray(item.product.product_images)
                                                    ? item.product.product_images
                                                    : [item.product.product_images]
                                                : []
                                            const displayImage = getFirstProductImage(productImages) || item.product?.image_url

                                            return (
                                            <TableRow key={item.product_id}>
                                                <TableCell>
                                                    {displayImage ? (
                                                        <div className="relative w-12 h-12 rounded-md overflow-hidden border">
                                                            <Image
                                                                src={displayImage}
                                                                alt={item.product?.name || 'Product'}
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
                                                <TableCell className="font-medium">
                                                    <div>
                                                        <p>{item.product?.name || 'Unknown Product'}</p>
                                                        <p className="text-xs text-muted-foreground">{item.product?.sku || 'N/A'}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">{item.available_quantity}</TableCell>
                                                <TableCell className="text-right">{item.reserved_quantity}</TableCell>
                                                <TableCell className="text-right font-medium">{item.total_quantity}</TableCell>
                                                <TableCell className="text-right">
                                                    ${(item.total_quantity * (item.product?.cost_price || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                        )})}
                                    </TableBody>
                                </Table>
                                {inventory.length > 5 && (
                                    <div className="p-4 text-center text-sm text-muted-foreground border-t">
                                        Showing top 5 products. {inventory.length - 5} more products in this warehouse.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-2" />
                                <p>No inventory in this warehouse yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
