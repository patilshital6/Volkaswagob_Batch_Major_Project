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
import { MoreHorizontal, Search, Eye, Trash2, Check } from 'lucide-react'
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

interface StockTransfer {
    id: string
    transfer_number: string
    transfer_date: string
    status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
    from_warehouse: {
        name: string
    }
    to_warehouse: {
        name: string
    }
}

export function StockTransfersTable() {
    const [transfers, setTransfers] = useState<StockTransfer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        fetchTransfers()
    }, [])

    const fetchTransfers = async () => {
        try {
            const { data, error } = await supabase
                .from('stock_transfers')
                .select(`
          id,
          transfer_number,
          transfer_date,
          status,
          from_warehouse:warehouses!stock_transfers_from_warehouse_id_fkey(name),
          to_warehouse:warehouses!stock_transfers_to_warehouse_id_fkey(name)
        `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setTransfers(data as any || [])
        } catch (error: any) {
            toast.error('Failed to load stock transfers')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            const { error } = await supabase
                .from('stock_transfers')
                .delete()
                .eq('id', deleteId)

            if (error) throw error

            toast.success('Stock transfer deleted successfully')
            setTransfers(transfers.filter((transfer) => transfer.id !== deleteId))
            setDeleteId(null)
        } catch (error: any) {
            toast.error('Failed to delete stock transfer')
            console.error(error)
        }
    }

    const filteredTransfers = transfers.filter((transfer) => {
        const matchesSearch =
            transfer.transfer_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transfer.from_warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transfer.to_warehouse.name.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter

        return matchesSearch && matchesStatus
    })

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
        return <div className="text-center py-10">Loading stock transfers...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by transfer number or warehouse..."
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
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Transfer Number</TableHead>
                            <TableHead>From Warehouse</TableHead>
                            <TableHead>To Warehouse</TableHead>
                            <TableHead>Transfer Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransfers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    No stock transfers found. Create your first transfer to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTransfers.map((transfer) => (
                                <TableRow key={transfer.id}>
                                    <TableCell className="font-medium">{transfer.transfer_number}</TableCell>
                                    <TableCell>{transfer.from_warehouse.name}</TableCell>
                                    <TableCell>{transfer.to_warehouse.name}</TableCell>
                                    <TableCell>
                                        {new Date(transfer.transfer_date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(transfer.status)}</TableCell>
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
                                                    onClick={() => router.push(`/dashboard/stock-transfers/${transfer.id}`)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                {(transfer.status === 'pending' || transfer.status === 'in_transit') && (
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/dashboard/stock-transfers/${transfer.id}`)}
                                                    >
                                                        <Check className="mr-2 h-4 w-4" />
                                                        Process Transfer
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteId(transfer.id)}
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
                            This action cannot be undone. This will permanently delete the stock transfer
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
