'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { MoreHorizontal, Search, Eye, Trash2, Truck } from 'lucide-react'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface SalesOrder {
    id: string
    order_number: string
    customer_name: string
    order_date: string
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    total_amount: number
}

export function SalesOrdersTable() {
    const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        fetchSalesOrders()
    }, [])

    const fetchSalesOrders = async () => {
        try {

            const { data, error } = await supabase
                .from('sales_orders')
                .select(`
                    id,
                    order_number,
                    customer_name,
                    order_date,
                    status,
                    total_amount
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setSalesOrders(data as any || [])
        } catch (error: any) {
            toast.error('Failed to load sales orders')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            const { error } = await supabase
                .from('sales_orders')
                .delete()
                .eq('id', deleteId)

            if (error) throw error

            toast.success('Sales order deleted successfully')
            setSalesOrders(salesOrders.filter((so) => so.id !== deleteId))
            setDeleteId(null)
        } catch (error: any) {
            toast.error('Failed to delete sales order')
            console.error(error)
        }
    }

    const filteredSalesOrders = salesOrders.filter((so) => {
        const matchesSearch =
            so.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            so.customer_name.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || so.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>
            case 'processing':
                return <Badge className="bg-blue-500">Processing</Badge>
            case 'shipped':
                return <Badge className="bg-purple-500">Shipped</Badge>
            case 'delivered':
                return <Badge variant="default">Delivered</Badge>
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (loading) {
        return <div className="text-center py-10">Loading sales orders...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by SO number or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SO Number</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Order Date</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSalesOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                    No sales orders found. Create your first sales order to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSalesOrders.map((so) => (
                                <TableRow key={so.id}>
                                    <TableCell className="font-medium">{so.order_number}</TableCell>
                                    <TableCell>{so.customer_name}</TableCell>
                                    <TableCell>
                                        {new Date(so.order_date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell>${so.total_amount.toFixed(2)}</TableCell>
                                    <TableCell>{getStatusBadge(so.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/dashboard/sales-orders/${so.id}`)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                {so.status === 'pending' && (
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/dashboard/sales-orders/${so.id}`)}
                                                    >
                                                        <Truck className="mr-2 h-4 w-4" />
                                                        Start Processing
                                                    </DropdownMenuItem>
                                                )}
                                                {so.status === 'processing' && (
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/dashboard/sales-orders/${so.id}`)}
                                                    >
                                                        <Truck className="mr-2 h-4 w-4" />
                                                        Mark as Shipped
                                                    </DropdownMenuItem>
                                                )}
                                                {so.status === 'shipped' && (
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/dashboard/sales-orders/${so.id}`)}
                                                    >
                                                        <Truck className="mr-2 h-4 w-4" />
                                                        Mark as Delivered
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteId(so.id)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the sales order
                            and all associated items.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
