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
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Download, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { getFirstProductImage } from '@/lib/utils/product-images'

interface InventoryValue {
    warehouse_name: string
    total_quantity: number
    total_value: number
    products: Array<{
        product_name: string
        sku: string
        quantity: number
        unit_price: number
        total_value: number
        image_url?: string | null
        product_images?: Array<{ image_url: string; is_primary: boolean }> | { image_url: string; is_primary: boolean } | null
    }>
}

export function InventoryValuation() {
    const [data, setData] = useState<InventoryValue[]>([])
    const [loading, setLoading] = useState(true)
    const [totalValue, setTotalValue] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: warehouses, error: whError } = await supabase
                .from('warehouses')
                .select('id, name')

            if (whError) throw whError

            const valuationData: InventoryValue[] = []
            let grandTotal = 0

            for (const warehouse of warehouses || []) {
                const { data: inventory, error: invError } = await supabase
                    .from('inventory')
                    .select(`
            total_quantity,
            available_quantity,
            product:products(
              id,
              name,
              sku,
              cost_price,
              image_url,
              product_images(image_url, is_primary)
            )
          `)
                    .eq('warehouse_id', warehouse.id)
                    .gt('total_quantity', 0)

                if (invError) throw invError

                // Transform data to handle Supabase array responses
                const inventoryItems = (inventory || []).map((item: any) => ({
                    total_quantity: item.total_quantity,
                    available_quantity: item.available_quantity,
                    product: Array.isArray(item.product) ? item.product[0] : item.product,
                }))

                const products = inventoryItems
                    .filter((item) => item.product) // Filter out items with null products
                    .map((item) => ({
                        product_name: item.product.name,
                        sku: item.product.sku,
                        quantity: item.total_quantity,
                        unit_price: item.product.cost_price || 0,
                        total_value: item.total_quantity * (item.product.cost_price || 0),
                        image_url: item.product.image_url,
                        product_images: item.product.product_images,
                    }))

                const warehouseTotal = products.reduce((sum, p) => sum + p.total_value, 0)
                const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0)

                if (products.length > 0) {
                    valuationData.push({
                        warehouse_name: warehouse.name,
                        total_quantity: totalQuantity,
                        total_value: warehouseTotal,
                        products,
                    })
                    grandTotal += warehouseTotal
                }
            }

            setData(valuationData)
            setTotalValue(grandTotal)
        } catch (error: any) {
            toast.error('Failed to load inventory valuation')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const exportToCSV = () => {
        const headers = ['Warehouse', 'Product', 'SKU', 'Quantity', 'Unit Price', 'Total Value']
        const rows = data.flatMap((warehouse) =>
            warehouse.products.map((product) => [
                warehouse.warehouse_name,
                product.product_name,
                product.sku,
                product.quantity,
                product.unit_price.toFixed(2),
                product.total_value.toFixed(2),
            ])
        )

        const csv = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
            '',
            `Total Inventory Value,$${totalValue.toFixed(2)}`,
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `inventory-valuation-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Total Inventory Value</h2>
                    <p className="text-4xl font-bold text-primary mt-2">${totalValue.toFixed(2)}</p>
                </div>
                <Button onClick={exportToCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            {data.map((warehouse) => (
                <Card key={warehouse.warehouse_name}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{warehouse.warehouse_name}</CardTitle>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold">${warehouse.total_value.toFixed(2)}</p>
                            </div>
                        </div>
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
                                    <TableHead className="text-right">Total Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {warehouse.products.map((product, idx) => {
                                    const productImages = product.product_images
                                        ? Array.isArray(product.product_images)
                                            ? product.product_images
                                            : [product.product_images]
                                        : []
                                    const displayImage = getFirstProductImage(productImages) || product.image_url

                                    return (
                                    <TableRow key={idx}>
                                        <TableCell>
                                            {displayImage ? (
                                                <div className="relative w-12 h-12 rounded-md overflow-hidden border">
                                                    <Image
                                                        src={displayImage}
                                                        alt={product.product_name}
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
                                        <TableCell className="font-medium">{product.product_name}</TableCell>
                                        <TableCell>{product.sku}</TableCell>
                                        <TableCell className="text-right">{product.quantity}</TableCell>
                                        <TableCell className="text-right">${product.unit_price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${product.total_value.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                )})}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
