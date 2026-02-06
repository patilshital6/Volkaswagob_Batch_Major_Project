'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
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

interface PurchaseData {
    period: string
    total_orders: number
    total_cost: number
    total_items_ordered: number
}

interface StatusData {
    name: string
    value: number
    color: string
}

interface TopSupplier {
    name: string
    cost: number
    orders: number
    items: number
}

export function PurchaseAnalytics() {
    const [data, setData] = useState<PurchaseData[]>([])
    const [statusData, setStatusData] = useState<StatusData[]>([])
    const [topSuppliers, setTopSuppliers] = useState<TopSupplier[]>([])
    const [summary, setSummary] = useState({
        total_orders: 0,
        total_cost: 0,
        avg_order_cost: 0,
        total_items_ordered: 0,
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
                .from('purchase_orders')
                .select(`
          id,
          po_number,
          created_at,
          total_amount,
          status,
          supplier:suppliers(name),
          items:purchase_order_items(quantity)
        `)
                .gte('created_at', startDate)
                .lte('created_at', endDate)
                .in('status', ['sent', 'partial', 'received'])

            if (error) throw error

            // Group by month
            const monthlyData = new Map<string, PurchaseData>()

            // Status breakdown
            const statusCount = new Map<string, number>()

            // Top suppliers tracking
            const supplierMap = new Map<string, { name: string; cost: number; orders: Set<string>; items: number }>()

            orders?.forEach((order: any) => {
                const date = new Date(order.created_at)
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

                const existing = monthlyData.get(monthKey) || {
                    period: monthName,
                    total_orders: 0,
                    total_cost: 0,
                    total_items_ordered: 0,
                }

                existing.total_orders += 1
                existing.total_cost += order.total_amount || 0
                
                const items = Array.isArray(order.items) ? order.items : []
                existing.total_items_ordered += items.reduce(
                    (sum: number, item: any) => sum + (item.quantity || 0),
                    0
                )

                monthlyData.set(monthKey, existing)

                // Status breakdown
                const status = order.status || 'unknown'
                statusCount.set(status, (statusCount.get(status) || 0) + 1)

                // Top suppliers
                const supplier = Array.isArray(order.supplier) ? order.supplier[0] : order.supplier
                if (supplier) {
                    const supplierName = supplier.name
                    const orderCost = order.total_amount || 0
                    const orderItems = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)

                    if (!supplierMap.has(supplierName)) {
                        supplierMap.set(supplierName, {
                            name: supplierName,
                            cost: 0,
                            orders: new Set(),
                            items: 0,
                        })
                    }

                    const supplierData = supplierMap.get(supplierName)!
                    supplierData.cost += orderCost
                    supplierData.orders.add(order.id)
                    supplierData.items += orderItems
                }
            })

            const chartData = Array.from(monthlyData.values()).sort((a, b) => {
                const [aYear, aMonth] = a.period.split(' ')
                const [bYear, bMonth] = b.period.split(' ')
                return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime()
            })

            setData(chartData)

            // Status breakdown for pie chart
            const statusColors: Record<string, string> = {
                draft: '#94a3b8',
                sent: '#3b82f6',
                partial: '#f59e0b',
                received: '#10b981',
                cancelled: '#ef4444',
            }

            const statusChartData: StatusData[] = Array.from(statusCount.entries()).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value,
                color: statusColors[name] || '#6b7280',
            }))
            setStatusData(statusChartData)

            // Top suppliers
            const topSuppliersData: TopSupplier[] = Array.from(supplierMap.values())
                .map((s) => ({
                    name: s.name,
                    cost: s.cost,
                    orders: s.orders.size,
                    items: s.items,
                }))
                .sort((a, b) => b.cost - a.cost)
                .slice(0, 10)
            setTopSuppliers(topSuppliersData)

            // Calculate summary
            const totalOrders = orders?.length || 0
            const totalCost = orders?.reduce((sum, order: any) => sum + (order.total_amount || 0), 0) || 0
            const avgOrderCost = totalOrders > 0 ? totalCost / totalOrders : 0
            const totalItemsOrdered = chartData.reduce((sum, d) => sum + d.total_items_ordered, 0)

            // Calculate growth rate (compare first half vs second half of period)
            const midPoint = Math.floor(chartData.length / 2)
            const firstHalfCost = chartData.slice(0, midPoint).reduce((sum, d) => sum + d.total_cost, 0)
            const secondHalfCost = chartData.slice(midPoint).reduce((sum, d) => sum + d.total_cost, 0)
            const growthRate = firstHalfCost > 0 ? ((secondHalfCost - firstHalfCost) / firstHalfCost) * 100 : 0

            setSummary({
                total_orders: totalOrders,
                total_cost: totalCost,
                avg_order_cost: avgOrderCost,
                total_items_ordered: totalItemsOrdered,
                growth_rate: growthRate,
            })
        } catch (error: any) {
            toast.error('Failed to load purchase analytics')
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
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchase Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{summary.total_orders}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">${summary.total_cost.toFixed(2)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg PO Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">${summary.avg_order_cost.toFixed(2)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Items Ordered</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{summary.total_items_ordered.toLocaleString()}</p>
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
                {/* Cost Trend Line Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Purchase Cost Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                No purchase data found in the selected date range.
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
                                        dataKey="total_cost"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        name="Cost ($)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Status Breakdown Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>PO Status Breakdown</CardTitle>
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

            {/* Purchases Over Time Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Purchases Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No purchase data found in the selected date range.
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
                                <Bar yAxisId="left" dataKey="total_cost" fill="#f59e0b" name="Cost ($)" />
                                <Bar yAxisId="right" dataKey="total_orders" fill="#82ca9d" name="Orders" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Top Suppliers Chart */}
            {topSuppliers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Suppliers by Purchase Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={topSuppliers} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={150} />
                                <Tooltip
                                    formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                />
                                <Legend />
                                <Bar dataKey="cost" fill="#f59e0b" name="Purchase Cost ($)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
