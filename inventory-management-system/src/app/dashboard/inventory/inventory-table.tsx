'use client'

import { useEffect, useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Search, Plus, Minus, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { getFirstProductImage } from '@/lib/utils/product-images'

interface InventoryItem {
    id: string
    available_quantity: number
    reserved_quantity: number
    total_quantity: number
    product: {
        id: string
        sku: string
        name: string
        image_url: string | null
        reorder_level: number
    }
    warehouse: {
        id: string
        name: string
    }
}

interface Warehouse {
    id: string
    name: string
}

export function InventoryTable() {
    const { isManager, isStaff } = useUser()
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all')
    const [adjustmentDialog, setAdjustmentDialog] = useState<{
        open: boolean
        item: InventoryItem | null
        type: 'increase' | 'decrease'
    }>({ open: false, item: null, type: 'increase' })
    const [adjustmentQuantity, setAdjustmentQuantity] = useState('')
    const [adjustmentReason, setAdjustmentReason] = useState('')
    const [adjustmentLoading, setAdjustmentLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchData()

        // Subscribe to real-time updates
        const channel = supabase
            .channel('inventory-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
                fetchData()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchData = async () => {
        try {
            const [inventoryRes, warehousesRes] = await Promise.all([
                supabase
                    .from('inventory')
                    .select(`
            id,
            available_quantity,
            reserved_quantity,
            total_quantity,
            product:products(
                id, 
                sku, 
                name, 
                image_url, 
                reorder_level,
                product_images(image_url, is_primary)
            ),
            warehouse:warehouses(id, name)
          `)
                    .order('total_quantity', { ascending: true }),
                supabase
                    .from('warehouses')
                    .select('id, name')
                    .eq('is_active', true)
                    .order('name'),
            ])

            if (inventoryRes.error) throw inventoryRes.error
            if (warehousesRes.error) throw warehousesRes.error

            setInventory(inventoryRes.data as any || [])
            setWarehouses(warehousesRes.data || [])
        } catch (error: any) {
            toast.error('Failed to load inventory')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleAdjustment = async () => {
        // Check if user has permission (Manager+ only for manual adjustments)
        if (!isManager) {
            toast.error('Only managers and administrators can make manual inventory adjustments')
            return
        }

        if (!adjustmentDialog.item || !adjustmentQuantity) {
            toast.error('Please enter a quantity')
            return
        }

        const quantity = parseInt(adjustmentQuantity)
        if (isNaN(quantity) || quantity <= 0) {
            toast.error('Please enter a valid positive number')
            return
        }

        setAdjustmentLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const item = adjustmentDialog.item
            const isIncrease = adjustmentDialog.type === 'increase'
            const newAvailable = isIncrease
                ? item.available_quantity + quantity
                : item.available_quantity - quantity

            if (newAvailable < 0) {
                toast.error('Cannot reduce below 0')
                return
            }

            // Update inventory
            const { error: updateError } = await supabase
                .from('inventory')
                .update({ available_quantity: newAvailable })
                .eq('id', item.id)

            if (updateError) throw updateError

            // Create transaction record
            const { error: transError } = await supabase
                .from('transactions')
                .insert([{
                    product_id: (item.product as any).id,
                    warehouse_id: (item.warehouse as any).id,
                    type: 'adjustment',
                    quantity: isIncrease ? quantity : -quantity,
                    reason: adjustmentReason || 'Manual adjustment',
                    performed_by: user.id,
                }])

            if (transError) throw transError

            toast.success('Inventory adjusted successfully')
            setAdjustmentDialog({ open: false, item: null, type: 'increase' })
            setAdjustmentQuantity('')
            setAdjustmentReason('')
            fetchData()
        } catch (error: any) {
            toast.error(error.message || 'Failed to adjust inventory')
            console.error(error)
        } finally {
            setAdjustmentLoading(false)
        }
    }

    const filteredInventory = inventory.filter((item) => {
        const product = item.product as any
        const warehouse = item.warehouse as any
        const matchesSearch =
            product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product?.sku.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesWarehouse = selectedWarehouse === 'all' || warehouse?.id === selectedWarehouse
        return matchesSearch && matchesWarehouse
    })

    if (loading) {
        return <div className="text-center py-10">Loading inventory...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All warehouses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All warehouses</SelectItem>
                        {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]">Image</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Warehouse</TableHead>
                            <TableHead>Available</TableHead>
                            <TableHead>Reserved</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInventory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                                    No inventory found. Add products and warehouses to track inventory.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInventory.map((item) => {
                                const product = item.product as any
                                const warehouse = item.warehouse as any
                                const isLowStock = item.total_quantity <= product.reorder_level
                                
                                const productImages = Array.isArray(product.product_images) 
                                    ? product.product_images 
                                    : product.product_images 
                                        ? [product.product_images] 
                                        : []
                                const displayImage = getFirstProductImage(productImages) || product.image_url

                                return (
                                    <TableRow key={item.id}>
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
                                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                                        <TableCell>{warehouse.name}</TableCell>
                                        <TableCell>{item.available_quantity}</TableCell>
                                        <TableCell>{item.reserved_quantity}</TableCell>
                                        <TableCell className="font-semibold">{item.total_quantity}</TableCell>
                                        <TableCell>
                                            {isLowStock ? (
                                                <Badge variant="destructive" className="gap-1">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Low Stock
                                                </Badge>
                                            ) : (
                                                <Badge variant="default">In Stock</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isManager ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setAdjustmentDialog({
                                                                open: true,
                                                                item,
                                                                type: 'increase',
                                                            })
                                                        }
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setAdjustmentDialog({
                                                                open: true,
                                                                item,
                                                                type: 'decrease',
                                                            })
                                                        }
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog
                open={adjustmentDialog.open}
                onOpenChange={(open) =>
                    setAdjustmentDialog({ ...adjustmentDialog, open })
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {adjustmentDialog.type === 'increase' ? 'Increase' : 'Decrease'} Stock
                        </DialogTitle>
                        <DialogDescription>
                            Adjust inventory for {(adjustmentDialog.item?.product as any)?.name} at{' '}
                            {(adjustmentDialog.item?.warehouse as any)?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                placeholder="Enter quantity"
                                value={adjustmentQuantity}
                                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason (optional)</Label>
                            <Input
                                id="reason"
                                placeholder="e.g., Damaged goods, Physical count"
                                value={adjustmentReason}
                                onChange={(e) => setAdjustmentReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setAdjustmentDialog({ open: false, item: null, type: 'increase' })
                            }
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAdjustment} disabled={adjustmentLoading}>
                            {adjustmentLoading ? 'Adjusting...' : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
