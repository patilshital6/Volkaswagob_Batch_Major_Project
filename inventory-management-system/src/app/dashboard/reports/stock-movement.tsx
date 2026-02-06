'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Download, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { getFirstProductImage } from '@/lib/utils/product-images'

interface MovementData {
    date: string
    product_name: string
    sku: string
    type: 'IN' | 'OUT' | 'TRANSFER'
    quantity: number
    warehouse: string
    reference: string
    image_url?: string | null
    product_images?: Array<{ image_url: string; is_primary: boolean }> | { image_url: string; is_primary: boolean } | null
}

export function StockMovement() {
    const [data, setData] = useState<MovementData[]>([])
    const [loading, setLoading] = useState(true)
    const [startDate, setStartDate] = useState(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    )
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [startDate, endDate])

    const fetchData = async () => {
        setLoading(true)
        try {
            const movements: MovementData[] = []

            // Fetch purchase order receipts (IN) - using transactions table
            const { data: restockTransactions, error: restockError } = await supabase
                .from('transactions')
                .select(`
                    quantity,
                    created_at,
                    reference_id,
                    product:products(name, sku, image_url, product_images(image_url, is_primary)),
                    warehouse:warehouses(name)
                `)
                .eq('type', 'restock')
                .gte('created_at', startDate)
                .lte('created_at', endDate)

            if (restockError) throw restockError

            // Get PO numbers for references
            const poIds = [...new Set(restockTransactions?.map((t: any) => t.reference_id).filter(Boolean) || [])]
            const { data: pos } = await supabase
                .from('purchase_orders')
                .select('id, po_number')
                .in('id', poIds)

            const poMap = new Map((pos || []).map((po: any) => [po.id, po.po_number]))

            movements.push(
                ...(restockTransactions || [])
                    .map((item: any) => ({
                        product: Array.isArray(item.product) ? item.product[0] : item.product,
                        warehouse: Array.isArray(item.warehouse) ? item.warehouse[0] : item.warehouse,
                        ...item,
                    }))
                    .filter((item) => item.product)
                    .map((item) => ({
                        date: item.created_at,
                        product_name: item.product.name,
                        sku: item.product.sku,
                        type: 'IN' as const,
                        quantity: item.quantity,
                        warehouse: item.warehouse?.name || 'Unknown Warehouse',
                        reference: item.reference_id ? (poMap.get(item.reference_id) || `PO-${item.reference_id.slice(0, 8)}`) : 'N/A',
                        image_url: item.product.image_url,
                        product_images: item.product.product_images,
                    }))
            )

            // Fetch sales order shipments (OUT) - using transactions table
            const { data: saleTransactions, error: saleError } = await supabase
                .from('transactions')
                .select(`
                    quantity,
                    created_at,
                    reference_id,
                    product:products(name, sku, image_url, product_images(image_url, is_primary)),
                    warehouse:warehouses(name)
                `)
                .eq('type', 'sale')
                .gte('created_at', startDate)
                .lte('created_at', endDate)

            if (saleError) throw saleError

            // Get SO numbers for references
            const soIds = [...new Set(saleTransactions?.map((t: any) => t.reference_id).filter(Boolean) || [])]
            const { data: sos } = await supabase
                .from('sales_orders')
                .select('id, order_number')
                .in('id', soIds)

            const soMap = new Map((sos || []).map((so: any) => [so.id, so.order_number]))

            movements.push(
                ...(saleTransactions || [])
                    .map((item: any) => ({
                        product: Array.isArray(item.product) ? item.product[0] : item.product,
                        warehouse: Array.isArray(item.warehouse) ? item.warehouse[0] : item.warehouse,
                        ...item,
                    }))
                    .filter((item) => item.product)
                    .map((item) => ({
                        date: item.created_at,
                        product_name: item.product.name,
                        sku: item.product.sku,
                        type: 'OUT' as const,
                        quantity: Math.abs(item.quantity), // Make positive for display
                        warehouse: item.warehouse?.name || 'Unknown Warehouse',
                        reference: item.reference_id ? (soMap.get(item.reference_id) || `SO-${item.reference_id.slice(0, 8)}`) : 'N/A',
                        image_url: item.product.image_url,
                        product_images: item.product.product_images,
                    }))
            )

            // Fetch stock transfers (TRANSFER) - using transactions table
            const { data: transferOutTransactions, error: transferOutError } = await supabase
                .from('transactions')
                .select(`
                    quantity,
                    created_at,
                    reference_id,
                    product:products(name, sku, image_url, product_images(image_url, is_primary)),
                    warehouse:warehouses(name)
                `)
                .eq('type', 'transfer_out')
                .gte('created_at', startDate)
                .lte('created_at', endDate)

            if (transferOutError) throw transferOutError

            const { data: transferInTransactions, error: transferInError } = await supabase
                .from('transactions')
                .select(`
                    quantity,
                    created_at,
                    reference_id,
                    product:products(name, sku, image_url, product_images(image_url, is_primary)),
                    warehouse:warehouses(name)
                `)
                .eq('type', 'transfer_in')
                .gte('created_at', startDate)
                .lte('created_at', endDate)

            if (transferInError) throw transferInError

            // Get transfer numbers for references
            const transferIds = [...new Set([
                ...(transferOutTransactions || []).map((t: any) => t.reference_id),
                ...(transferInTransactions || []).map((t: any) => t.reference_id),
            ].filter(Boolean))]
            const { data: transfers } = await supabase
                .from('stock_transfers')
                .select('id, transfer_number')
                .in('id', transferIds)

            const transferMap = new Map((transfers || []).map((t: any) => [t.id, t.transfer_number]))

            // Add transfer out transactions
            movements.push(
                ...(transferOutTransactions || [])
                    .map((item: any) => ({
                        product: Array.isArray(item.product) ? item.product[0] : item.product,
                        warehouse: Array.isArray(item.warehouse) ? item.warehouse[0] : item.warehouse,
                        ...item,
                    }))
                    .filter((item) => item.product)
                    .map((item) => ({
                        date: item.created_at,
                        product_name: item.product.name,
                        sku: item.product.sku,
                        type: 'TRANSFER' as const,
                        quantity: -Math.abs(item.quantity), // Negative for outgoing
                        warehouse: item.warehouse?.name || 'Unknown Warehouse',
                        reference: item.reference_id ? `${transferMap.get(item.reference_id) || 'TR-' + item.reference_id.slice(0, 8)} (OUT)` : 'N/A',
                        image_url: item.product.image_url,
                        product_images: item.product.product_images,
                    }))
            )

            // Add transfer in transactions
            movements.push(
                ...(transferInTransactions || [])
                    .map((item: any) => ({
                        product: Array.isArray(item.product) ? item.product[0] : item.product,
                        warehouse: Array.isArray(item.warehouse) ? item.warehouse[0] : item.warehouse,
                        ...item,
                    }))
                    .filter((item) => item.product)
                    .map((item) => ({
                        date: item.created_at,
                        product_name: item.product.name,
                        sku: item.product.sku,
                        type: 'TRANSFER' as const,
                        quantity: item.quantity, // Positive for incoming
                        warehouse: item.warehouse?.name || 'Unknown Warehouse',
                        reference: item.reference_id ? `${transferMap.get(item.reference_id) || 'TR-' + item.reference_id.slice(0, 8)} (IN)` : 'N/A',
                        image_url: item.product.image_url,
                        product_images: item.product.product_images,
                    }))
            )

            // Sort by date descending
            movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

            setData(movements)
        } catch (error: any) {
            toast.error('Failed to load stock movement data')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const exportToCSV = () => {
        const headers = ['Date', 'Product', 'SKU', 'Type', 'Quantity', 'Warehouse', 'Reference']
        const rows = data.map((item) => [
            new Date(item.date).toLocaleDateString(),
            item.product_name,
            item.sku,
            item.type,
            item.quantity,
            item.warehouse,
            item.reference,
        ])

        const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `stock-movement-${startDate}-to-${endDate}.csv`
        a.click()
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Stock Movement Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <Button onClick={exportToCSV} disabled={data.length === 0}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No stock movements found in the selected date range.
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-3 text-left font-medium w-[60px]">Image</th>
                                        <th className="p-3 text-left font-medium">Date</th>
                                        <th className="p-3 text-left font-medium">Product</th>
                                        <th className="p-3 text-left font-medium">SKU</th>
                                        <th className="p-3 text-left font-medium">Type</th>
                                        <th className="p-3 text-right font-medium">Quantity</th>
                                        <th className="p-3 text-left font-medium">Warehouse</th>
                                        <th className="p-3 text-left font-medium">Reference</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, idx) => {
                                        const productImages = item.product_images
                                            ? Array.isArray(item.product_images)
                                                ? item.product_images
                                                : [item.product_images]
                                            : []
                                        const displayImage = getFirstProductImage(productImages) || item.image_url

                                        return (
                                        <tr key={idx} className="border-b">
                                            <td className="p-3">
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
                                            </td>
                                            <td className="p-3">
                                                {new Date(item.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="p-3 font-medium">{item.product_name}</td>
                                            <td className="p-3">{item.sku}</td>
                                            <td className="p-3">
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.type === 'IN'
                                                        ? 'bg-green-100 text-green-800'
                                                        : item.type === 'OUT'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                        }`}
                                                >
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td
                                                className={`p-3 text-right font-medium ${item.quantity > 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}
                                            >
                                                {item.quantity > 0 ? '+' : ''}
                                                {item.quantity}
                                            </td>
                                            <td className="p-3">{item.warehouse}</td>
                                            <td className="p-3 text-sm text-muted-foreground">{item.reference}</td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
