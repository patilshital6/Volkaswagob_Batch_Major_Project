'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { AlertTriangle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getFirstProductImage } from '@/lib/utils/product-images'

interface LowStockItem {
    product_id: string
    product_name: string
    sku: string
    warehouse_name: string
    current_quantity: number
    reorder_level: number
    shortage: number
    image_url?: string | null
    product_images?: Array<{ image_url: string; is_primary: boolean }> | { image_url: string; is_primary: boolean } | null
}

export function LowStockAlerts() {
    const [data, setData] = useState<LowStockItem[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: inventory, error } = await supabase
                .from('inventory')
                .select(`
          total_quantity,
          warehouse:warehouses(name),
          product:products(
            id,
            name,
            sku,
            reorder_level,
            image_url,
            product_images(image_url, is_primary)
          )
        `)

            if (error) throw error

            // Transform data to handle Supabase array responses
            const inventoryItems = (inventory || []).map((item: any) => ({
                total_quantity: item.total_quantity,
                warehouse: Array.isArray(item.warehouse) ? item.warehouse[0] : item.warehouse,
                product: Array.isArray(item.product) ? item.product[0] : item.product,
            }))

            const lowStock = inventoryItems
                .filter((item) => item.product) // Filter out items with null products
                .filter((item) => {
                    const reorderLevel = item.product.reorder_level || 10
                    return item.total_quantity <= reorderLevel
                })
                .map((item) => ({
                    product_id: item.product.id,
                    product_name: item.product.name,
                    sku: item.product.sku,
                    warehouse_name: item.warehouse?.name || 'Unknown Warehouse',
                    current_quantity: item.total_quantity,
                    reorder_level: item.product.reorder_level || 10,
                    shortage: (item.product.reorder_level || 10) - item.total_quantity,
                    image_url: item.product.image_url,
                    product_images: item.product.product_images,
                }))
                .sort((a, b) => b.shortage - a.shortage)

            setData(lowStock)
        } catch (error: any) {
            toast.error('Failed to load low stock alerts')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const getSeverityBadge = (shortage: number) => {
        if (shortage >= 20) {
            return <Badge variant="destructive">Critical</Badge>
        } else if (shortage >= 10) {
            return <Badge className="bg-orange-500">High</Badge>
        } else if (shortage >= 5) {
            return <Badge className="bg-yellow-500">Medium</Badge>
        } else {
            return <Badge variant="secondary">Low</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <CardTitle>Low Stock Alerts</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                            {data.length} {data.length === 1 ? 'Alert' : 'Alerts'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <p className="text-lg font-medium">All stock levels are healthy!</p>
                            <p className="text-sm">No products are below their reorder levels.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px]">Image</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Warehouse</TableHead>
                                    <TableHead className="text-right">Current</TableHead>
                                    <TableHead className="text-right">Reorder Level</TableHead>
                                    <TableHead className="text-right">Shortage</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, idx) => {
                                    const productImages = item.product_images
                                        ? Array.isArray(item.product_images)
                                            ? item.product_images
                                            : [item.product_images]
                                        : []
                                    const displayImage = getFirstProductImage(productImages) || item.image_url

                                    return (
                                    <TableRow key={idx}>
                                        <TableCell>
                                            {displayImage ? (
                                                <div className="relative w-12 h-12 rounded-md overflow-hidden border">
                                                    <Image
                                                        src={displayImage}
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
                                        </TableCell>
                                        <TableCell className="font-medium">{item.product_name}</TableCell>
                                        <TableCell>{item.sku}</TableCell>
                                        <TableCell>{item.warehouse_name}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={item.current_quantity === 0 ? 'text-red-500 font-bold' : ''}>
                                                {item.current_quantity}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">{item.reorder_level}</TableCell>
                                        <TableCell className="text-right font-medium text-orange-600">
                                            -{item.shortage}
                                        </TableCell>
                                        <TableCell>{getSeverityBadge(item.shortage)}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href="/dashboard/purchase-orders/new">
                                                <Button size="sm" variant="outline">
                                                    Create PO
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                )})}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
