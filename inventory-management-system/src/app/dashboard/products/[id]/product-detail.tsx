'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProductBarcode } from '@/components/product-barcode'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Edit, Loader2, Package } from 'lucide-react'

interface ProductImage {
    image_url: string
    is_primary: boolean
    display_order: number
}

interface Product {
    id: string
    sku: string
    name: string
    description: string | null
    unit_price: number
    cost_price: number
    reorder_level: number
    reorder_quantity: number
    image_url: string | null
    barcode: string | null
    is_active: boolean
    category: { name: string } | null
    product_images?: ProductImage[] | ProductImage | null
    created_at: string
}

export function ProductDetail({ productId }: { productId: string }) {
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        fetchProduct()
    }, [productId])

    const fetchProduct = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, category:categories(name), product_images(image_url, is_primary, display_order)')
                .eq('id', productId)
                .single()

            if (error) throw error
            setProduct(data)
        } catch (error: any) {
            toast.error('Failed to load product')
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

    if (!product) {
        return (
            <div className="text-center py-10">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">Product not found</h3>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/products">Back to Products</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/products">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                    <p className="text-muted-foreground">SKU: {product.sku}</p>
                </div>
                <Button asChild>
                    <Link href={`/dashboard/products/${productId}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Product
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(() => {
                                const productImages = Array.isArray(product.product_images) 
                                    ? product.product_images 
                                    : product.product_images 
                                        ? [product.product_images] 
                                        : []
                                const hasImages = productImages.length > 0 || product.image_url

                                if (!hasImages) return null

                                if (productImages.length > 0) {
                                    return (
                                        <div className="space-y-4">
                                            <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                                                <Image
                                                    src={productImages.find((img: ProductImage) => img.is_primary)?.image_url || productImages[0].image_url}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            {productImages.length > 1 && (
                                                <div className="grid grid-cols-4 gap-2">
                                                    {productImages.map((img: ProductImage, idx: number) => (
                                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden border">
                                                            <Image
                                                                src={img.image_url}
                                                                alt={`${product.name} - Image ${idx + 1}`}
                                                                fill
                                                                className="object-cover"
                                                                sizes="(max-width: 768px) 25vw, 25vw"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                }

                                return (
                                    <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                                        <Image
                                            src={product.image_url!}
                                            alt={product.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                )
                            })()}

                            <div className="grid gap-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium">{product.name}</p>
                                </div>

                                {product.description && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Description</p>
                                        <p className="font-medium">{product.description}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-muted-foreground">SKU</p>
                                    <p className="font-medium">{product.sku}</p>
                                </div>

                                {product.category && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Category</p>
                                        <p className="font-medium">{product.category.name}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                        {product.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                {product.barcode && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Barcode</p>
                                        <p className="font-medium">{product.barcode}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Unit Price</span>
                                <span className="font-medium">${product.unit_price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cost Price</span>
                                <span className="font-medium">${product.cost_price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                                <span className="text-muted-foreground">Profit Margin</span>
                                <span className="font-medium text-green-600">
                                    ${(product.unit_price - product.cost_price).toFixed(2)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Reorder Level</span>
                                <span className="font-medium">{product.reorder_level}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Reorder Quantity</span>
                                <span className="font-medium">{product.reorder_quantity}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <ProductBarcode
                        productId={product.id}
                        sku={product.sku}
                        name={product.name}
                        barcode={product.barcode || undefined}
                    />
                </div>
            </div>
        </div>
    )
}
