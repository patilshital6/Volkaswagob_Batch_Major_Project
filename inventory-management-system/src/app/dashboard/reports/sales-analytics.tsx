'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { getFirstProductImage } from '@/lib/utils/product-images'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'

interface SalesData {
    period: string
    total_orders: number
    total_revenue: number
    total_items_sold: number
}

interface StatusData {
    name: string
    value: number
    color: string
}

interface TopProduct {
    name: string
    revenue: number
    quantity: number
    orders: number
    image_url?: string | null
    product_images?: Array<{ image_url: string; is_primary: boolean }> | { image_url: string; is_primary: boolean } | null
}

export function SalesAnalytics() {
    const [data, setData] = useState<SalesData[]>([])
    const [statusData, setStatusData] = useState<StatusData[]>([])
    const [topProducts, setTopProducts] = useState<TopProduct[]>([])
    const [summary, setSummary] = useState({
        total_orders: 0,
        total_revenue: 0,
        avg_order_value: 0,
        total_items_sold: 0,
        growth_rate: 0,
    })
    const [loading, setLoading] = useState(true)
    const [startDate, setStartDate] = useState(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    )
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [startDate, endDate])

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data: orders, error } = await supabase
                .from('sales_orders')
                .select(`
          id,
          order_number,
          created_at,
          total_amount,
          status,
          items:sales_order_items(
            quantity,
            unit_price,
            product:products(name, image_url, product_images(image_url, is_primary))
          )
        `)
                .gte('created_at', startDate)
                .lte('created_at', endDate)
                .in('status', ['processing', 'shipped', 'delivered'])

            if (error) throw error

            // Group by month
            const monthlyData = new Map<string, SalesData>()

            // Status breakdown
            const statusCount = new Map<string, number>()

            // Top products tracking
            const productMap = new Map<string, { 
                name: string
                revenue: number
                quantity: number
                orders: Set<string>
                image_url?: string | null
                product_images?: Array<{ image_url: string; is_primary: boolean }> | { image_url: string; is_primary: boolean } | null
            }>()

            orders?.forEach((order: any) => {
                const date = new Date(order.created_at)
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

                const existing = monthlyData.get(monthKey) || {
                    period: monthName,
                    total_orders: 0,
                    total_revenue: 0,
                    total_items_sold: 0,
                }

                existing.total_orders += 1
                existing.total_revenue += order.total_amount || 0
                
                const items = Array.isArray(order.items) ? order.items : []
                existing.total_items_sold += items.reduce(
                    (sum: number, item: any) => sum + (item.quantity || 0),
                    0
                )

                monthlyData.set(monthKey, existing)

                // Status breakdown
                const status = order.status || 'unknown'
                statusCount.set(status, (statusCount.get(status) || 0) + 1)

                // Top products
                items.forEach((item: any) => {
                    const product = Array.isArray(item.product) ? item.product[0] : item.product
                    if (product) {
                        const productName = product.name
                        const productRevenue = (item.quantity || 0) * (item.unit_price || 0)
                        
                        if (!productMap.has(productName)) {
                            const productImages = product.product_images
                                ? Array.isArray(product.product_images)
                                    ? product.product_images
                                    : [product.product_images]
                                : []
                            productMap.set(productName, {
                                name: productName,
                                revenue: 0,
                                quantity: 0,
                                orders: new Set(),
                                image_url: product.image_url,
                                product_images: productImages.length > 0 ? productImages : null,
                            })
                        }
                        
                        const productData = productMap.get(productName)!
                        productData.revenue += productRevenue
                        productData.quantity += item.quantity || 0
                        productData.orders.add(order.id)
                    }
                })
            })

            const chartData = Array.from(monthlyData.values()).sort((a, b) => {
                const [aYear, aMonth] = a.period.split(' ')
                const [bYear, bMonth] = b.period.split(' ')
                return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime()
            })

            setData(chartData)

            // Status breakdown for pie chart
            const statusColors: Record<string, string> = {
                pending: '#94a3b8',
                processing: '#3b82f6',
                shipped: '#a855f7',
                delivered: '#10b981',
                cancelled: '#ef4444',
            }

            const statusChartData: StatusData[] = Array.from(statusCount.entries()).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value,
                color: statusColors[name] || '#6b7280',
            }))
            setStatusData(statusChartData)

            // Top products
            const topProductsData: TopProduct[] = Array.from(productMap.values())
                .map((p) => ({
                    name: p.name,
                    revenue: p.revenue,
                    quantity: p.quantity,
                    orders: p.orders.size,
                    image_url: p.image_url,
                    product_images: p.product_images,
                }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10)
            setTopProducts(topProductsData)

            // Calculate summary
            const totalOrders = orders?.length || 0
            const totalRevenue = orders?.reduce((sum, order: any) => sum + (order.total_amount || 0), 0) || 0
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
            const totalItemsSold = chartData.reduce((sum, d) => sum + d.total_items_sold, 0)

            // Calculate growth rate (compare first half vs second half of period)
            const midPoint = Math.floor(chartData.length / 2)
            const firstHalfRevenue = chartData.slice(0, midPoint).reduce((sum, d) => sum + d.total_revenue, 0)
            const secondHalfRevenue = chartData.slice(midPoint).reduce((sum, d) => sum + d.total_revenue, 0)
            const growthRate = firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0

            setSummary({
                total_orders: totalOrders,
                total_revenue: totalRevenue,
                avg_order_value: avgOrderValue,
                total_items_sold: totalItemsSold,
                growth_rate: growthRate,
            })
        } catch (error: any) {
            toast.error('Failed to load sales analytics')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#8b5cf6']

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-medium">{payload[0].payload.name}</p>
                    <p className="text-sm text-muted-foreground">
                        Revenue: <span className="font-semibold">${payload[0].value.toFixed(2)}</span>
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-6">
            {/* Date Range Filter */}
            <Card>
                <CardHeader>
                    <CardTitle>Date Range</CardTitle>
                </CardHeader>
                <CardContent>
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
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{summary.total_orders}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">${summary.total_revenue.toFixed(2)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">${summary.avg_order_value.toFixed(2)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Items Sold</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{summary.total_items_sold.toLocaleString()}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Growth Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p
                            className={`text-3xl font-bold ${
                                summary.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                            {summary.growth_rate >= 0 ? '+' : ''}
                            {summary.growth_rate.toFixed(1)}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Line Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                No sales data found in the selected date range.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="total_revenue"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        name="Revenue ($)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Status Breakdown Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {statusData.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">No status data available</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Sales Over Time Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Sales Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No sales data found in the selected date range.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="total_revenue" fill="#8884d8" name="Revenue ($)" />
                                <Bar yAxisId="right" dataKey="total_orders" fill="#82ca9d" name="Orders" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Top Products Chart */}
            {topProducts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Products by Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={topProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={150} />
                                <Tooltip
                                    formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                />
                                <Legend />
                                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
                            </BarChart>
                        </ResponsiveContainer>
                        
                        {/* Top Products Table with Images */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[60px]">Image</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                        <TableHead className="text-right">Quantity Sold</TableHead>
                                        <TableHead className="text-right">Orders</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topProducts.map((product, idx) => {
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
                                                            alt={product.name}
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
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                ${product.revenue.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">{product.quantity}</TableCell>
                                            <TableCell className="text-right">{product.orders}</TableCell>
                                        </TableRow>
                                        )})}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
