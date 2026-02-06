'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, ProductFormData } from '@/lib/validations/product'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MultipleImageUpload } from '@/components/multiple-image-upload'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Category {
    id: string
    name: string
}

export function ProductForm({ productId }: { productId?: string }) {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(!!productId)
    const [savedProductId, setSavedProductId] = useState<string | undefined>(productId)
    const router = useRouter()
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            reorder_level: 10,
            reorder_quantity: 50,
            is_active: true,
            image_url: '',
        },
    })

    // Log validation errors
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log('Form validation errors:', errors)
        }
    }, [errors])

    useEffect(() => {
        fetchCategories()
        if (productId) {
            fetchProduct()
        }
    }, [productId])

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name')
                .order('name')

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchProduct = async () => {
        if (!productId) return

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single()

            if (error) throw error

            // Set form values
            Object.keys(data).forEach((key) => {
                setValue(key as any, data[key])
            })
        } catch (error) {
            toast.error('Failed to load product')
            console.error(error)
        } finally {
            setInitialLoading(false)
        }
    }

    const generateSKU = () => {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const random = Math.random().toString(36).substring(2, 6).toUpperCase()
        return `PROD-${year}${month}${day}-${random}`
    }

    const onSubmit = async (data: ProductFormData) => {
        console.log('Product form submitted:', data)
        setLoading(true)

        try {
            console.log('Getting user...')
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')
            console.log('User authenticated:', user.id)

            // Generate SKU if not provided
            if (!data.sku) {
                data.sku = generateSKU()
                console.log('Generated SKU:', data.sku)
            }

            if (productId) {
                // Update existing product
                console.log('Updating product:', productId)
                const { error } = await supabase
                    .from('products')
                    .update(data)
                    .eq('id', productId)

                if (error) {
                    console.error('Update error:', error)
                    throw error
                }

                toast.success('Product updated successfully')
                router.push('/dashboard/products')
                router.refresh()
            } else {
                // Create new product
                console.log('Creating new product with data:', { ...data, created_by: user.id })
                const { data: newProduct, error } = await supabase
                    .from('products')
                    .insert([{ ...data, created_by: user.id }])
                    .select()
                    .single()

                if (error) {
                    console.error('Insert error:', error)
                    throw error
                }

                console.log('Product created:', newProduct)
                toast.success('Product created successfully')
                setSavedProductId(newProduct.id)

                // Don't redirect immediately if image upload is needed
                if (!data.image_url) {
                    toast.info('You can now upload a product image')
                }
                
                router.push('/dashboard/products')
                router.refresh()
            }
        } catch (error: any) {
            console.error('Product save error:', error)
            toast.error(error.message || 'Failed to save product')
        } finally {
            setLoading(false)
            console.log('Product form submission finished')
        }
    }

    if (initialLoading) {
        return <div className="flex items-center justify-center py-10">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/products">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {productId ? 'Edit Product' : 'New Product'}
                    </h1>
                    <p className="text-muted-foreground">
                        {productId ? 'Update product information' : 'Add a new product to your catalog'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Product Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    placeholder="Auto-generated if empty"
                                    {...register('sku')}
                                />
                                {errors.sku && (
                                    <p className="text-sm text-destructive">{errors.sku.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter product name"
                                    {...register('name')}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                placeholder="Enter product description"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...register('description')}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="category_id">Category</Label>
                                <Select
                                    value={watch('category_id') || ''}
                                    onValueChange={(value) => setValue('category_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="barcode">Barcode</Label>
                                <Input
                                    id="barcode"
                                    placeholder="Enter barcode"
                                    {...register('barcode')}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Product Images</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Upload multiple images for this product. The first image will be set as primary.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <MultipleImageUpload
                            productId={productId || savedProductId}
                            onImagesChanged={async () => {
                                // Update the main image_url field with the primary image
                                if (productId || savedProductId) {
                                    try {
                                        const { data } = await supabase
                                            .from('product_images')
                                            .select('image_url')
                                            .eq('product_id', productId || savedProductId)
                                            .eq('is_primary', true)
                                            .single()

                                        if (data) {
                                            setValue('image_url', data.image_url)
                                            await supabase
                                                .from('products')
                                                .update({ image_url: data.image_url })
                                                .eq('id', productId || savedProductId)
                                        }
                                    } catch (error) {
                                        console.error('Error updating primary image:', error)
                                    }
                                }
                            }}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="unit_price">Unit Price *</Label>
                                <Input
                                    id="unit_price"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('unit_price')}
                                />
                                {errors.unit_price && (
                                    <p className="text-sm text-destructive">{errors.unit_price.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cost_price">Cost Price *</Label>
                                <Input
                                    id="cost_price"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('cost_price')}
                                />
                                {errors.cost_price && (
                                    <p className="text-sm text-destructive">{errors.cost_price.message}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="reorder_level">Reorder Level</Label>
                                <Input
                                    id="reorder_level"
                                    type="number"
                                    placeholder="10"
                                    {...register('reorder_level')}
                                />
                                {errors.reorder_level && (
                                    <p className="text-sm text-destructive">{errors.reorder_level.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reorder_quantity">Reorder Quantity</Label>
                                <Input
                                    id="reorder_quantity"
                                    type="number"
                                    placeholder="50"
                                    {...register('reorder_quantity')}
                                />
                                {errors.reorder_quantity && (
                                    <p className="text-sm text-destructive">{errors.reorder_quantity.message}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/dashboard/products">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {productId ? 'Update Product' : 'Create Product'}
                    </Button>
                </div>
            </form >
        </div >
    )
}
