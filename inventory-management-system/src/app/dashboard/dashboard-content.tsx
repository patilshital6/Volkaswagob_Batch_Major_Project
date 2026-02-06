'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import Image from 'next/image'
import { getFirstProductImage } from '@/lib/utils/product-images'

interface DashboardStats {
    totalProducts: number
    totalInventoryValue: number
    lowStockCount: number
    totalTransactions: number
}

interface RecentTransaction {
    id: string
    type: string
    quantity: number
    created_at: string
    product: {
        name: string
        sku: string
        image_url: string | null
        product_images?: Array<{ image_url: string; is_primary: boolean }> | { image_url: string; is_primary: boolean } | null
    }
    warehouse: {
        name: string
    }
}

export function DashboardContent() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchDashboardData()

        // Subscribe to real-time updates
        const channel = supabase
            .channel('dashboard-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
                fetchDashboardData()
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, () => {
                fetchDashboardData()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchDashboardData = async () => {
        try {
            // Fetch total products
            const { count: productsCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true)

            // Fetch inventory value
            const { data: inventoryData } = await supabase
                .from('inventory')
                .select('total_quantity, product:products(cost_price)')

            const totalValue = inventoryData?.reduce((sum, item) => {
                const costPrice = (item.product as any)?.cost_price || 0
                return sum + (item.total_quantity * costPrice)
            }, 0) || 0

            // Fetch low stock alerts
            const { data: lowStockData } = await supabase
                .from('low_stock_alerts')
                .select('*')

            // Fetch total transactions
            const { count: transactionsCount } = await supabase
                .from('transactions')
                .select('*', { count: 'exact', head: true })

            // Fetch recent transactions
            const { data: recentTrans } = await supabase
                .from('transactions')
                .select(`
          id,
          type,
          quantity,
          created_at,
          product:products(name, sku, image_url, product_images(image_url, is_primary)),
          warehouse:warehouses(name)
        `)
                .order('created_at', { ascending: false })
                .limit(10)

            setStats({
                totalProducts: productsCount || 0,
                totalInventoryValue: totalValue,
                lowStockCount: lowStockData?.length || 0,
                totalTransactions: transactionsCount || 0,
            })

            setRecentTransactions(recentTrans as any || [])
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <DashboardSkeleton />
    }

    const getTransactionBadge = (type: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            restock: { variant: 'default', label: 'Restock' },
            sale: { variant: 'destructive', label: 'Sale' },
            return: { variant: 'secondary', label: 'Return' },
            adjustment: { variant: 'outline', label: 'Adjustment' },
            transfer_in: { variant: 'default', label: 'Transfer In' },
            transfer_out: { variant: 'destructive', label: 'Transfer Out' },
        }
        return variants[type] || { variant: 'default', label: type }
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
                        <p className="text-xs text-muted-foreground">Active products in catalog</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${(stats?.totalInventoryValue || 0).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground">Total inventory cost</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.lowStockCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Products below reorder level</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalTransactions || 0}</div>
                        <p className="text-xs text-muted-foreground">All-time transactions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentTransactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No transactions yet. Start by adding products and managing inventory.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {recentTransactions.map((transaction) => {
                                const badge = getTransactionBadge(transaction.type)
                                const product = transaction.product as any
                                const productImages = product?.product_images
                                    ? Array.isArray(product.product_images)
                                        ? product.product_images
                                        : [product.product_images]
                                    : []
                                const displayImage = getFirstProductImage(productImages) || product?.image_url

                                return (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            {displayImage ? (
                                                <div className="relative w-16 h-16 rounded-md overflow-hidden border flex-shrink-0">
                                                    <Image
                                                        src={displayImage}
                                                        alt={product?.name || 'Product'}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-md border bg-muted flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs text-muted-foreground">No img</span>
                                                </div>
                                            )}
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">
                                                        {product?.name || 'Unknown Product'}
                                                    </p>
                                                    <Badge variant={badge.variant as any}>{badge.label}</Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>SKU: {product?.sku || 'N/A'}</span>
                                                    <span>•</span>
                                                    <span>{(transaction.warehouse as any)?.name || 'Unknown Warehouse'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {transaction.type === 'sale' || transaction.type === 'transfer_out' ? '-' : '+'}
                                                {transaction.quantity}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>
            <Skeleton className="h-96" />
        </div>
    )
}
