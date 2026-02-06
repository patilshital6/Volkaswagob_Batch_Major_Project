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
import { useUser } from '@/lib/hooks/use-user'
import { MoreHorizontal, Search, Edit, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { getFirstProductImage } from '@/lib/utils/product-images'
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

interface Product {
    id: string
    sku: string
    name: string
    image_url: string | null
    category: { name: string } | null
    unit_price: number
    cost_price: number
    is_active: boolean
    reorder_level: number
}

export function ProductsTable() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()
    const { isManager } = useUser()

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
          id,
          sku,
          name,
          image_url,
          unit_price,
          cost_price,
          is_active,
          reorder_level,
          category:categories(name),
          product_images(image_url, is_primary)
        `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts(data as any || [])
        } catch (error: any) {
            toast.error('Failed to load products')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        if (!isManager) {
            toast.error('You do not have permission to delete products')
            setDeleteId(null)
            return
        }

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', deleteId)

            if (error) throw error

            toast.success('Product deleted successfully')
            setProducts(products.filter((p) => p.id !== deleteId))
            setDeleteId(null)
        } catch (error: any) {
            toast.error('Failed to delete product')
            console.error(error)
        }
    }

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return <div className="text-center py-10">Loading products...</div>
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
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]">Image</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Cost Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                    No products found. Create your first product to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product: any) => {
                                const productImages = Array.isArray(product.product_images) 
                                    ? product.product_images 
                                    : product.product_images 
                                        ? [product.product_images] 
                                        : []
                                const displayImage = getFirstProductImage(productImages) || product.image_url

                                return (
                                <TableRow key={product.id}>
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
                                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>
                                        {(product.category as any)?.name || '-'}
                                    </TableCell>
                                    <TableCell>${product.unit_price.toFixed(2)}</TableCell>
                                    <TableCell>${product.cost_price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
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
                                                    onClick={() => router.push(`/dashboard/products/${product.id}`)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        if (!isManager) {
                                                            toast.error('Only managers can edit products')
                                                            return
                                                        }
                                                        router.push(`/dashboard/products/${product.id}/edit`)
                                                    }}
                                                    disabled={!isManager}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        if (!isManager) {
                                                            toast.error('Only managers can delete products')
                                                            return
                                                        }
                                                        setDeleteId(product.id)
                                                    }}
                                                    disabled={!isManager}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )})
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product
                            and all associated inventory records.
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
