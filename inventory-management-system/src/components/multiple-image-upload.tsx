'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { X, Upload, Loader2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadProductImage, deleteProductImage } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ProductImage {
    id: string
    image_url: string
    is_primary: boolean
    display_order: number
}

interface MultipleImageUploadProps {
    productId?: string
    onImagesChanged?: () => void
}

export function MultipleImageUpload({
    productId,
    onImagesChanged,
}: MultipleImageUploadProps) {
    const [images, setImages] = useState<ProductImage[]>([])
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (productId) {
            fetchImages()
        } else {
            setImages([])
        }
    }, [productId])

    const fetchImages = async () => {
        if (!productId) return

        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('product_images')
                .select('*')
                .eq('product_id', productId)
                .order('display_order', { ascending: true })
                .order('is_primary', { ascending: false })

            if (error) throw error
            setImages(data || [])
        } catch (error: any) {
            console.error('Error fetching images:', error)
            toast.error('Failed to load images')
        } finally {
            setLoading(false)
        }
    }

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (!productId) {
                toast.error('Please save the product first before uploading images')
                return
            }

            if (acceptedFiles.length === 0) return

            setUploading(true)
            const currentImageCount = images.length
            const uploadPromises = acceptedFiles.map(async (file, index) => {
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`${file.name} is too large. Max size is 5MB`)
                    return null
                }

                try {
                    // Upload to Supabase Storage
                    const imageUrl = await uploadProductImage(file, productId)

                    // Check if image already exists (duplicate check)
                    const { data: existingImage } = await supabase
                        .from('product_images')
                        .select('id')
                        .eq('product_id', productId)
                        .eq('image_url', imageUrl)
                        .single()

                    if (existingImage) {
                        console.warn(`Image ${file.name} already exists, skipping insert`)
                        // Return existing image data
                        const { data: existingData } = await supabase
                            .from('product_images')
                            .select('*')
                            .eq('id', existingImage.id)
                            .single()
                        return existingData
                    }

                    // Save to product_images table
                    // Use index to ensure unique display_order even when uploading in parallel
                    const isFirstImage = currentImageCount === 0 && index === 0
                    const currentDisplayOrder = currentImageCount + index
                    const { data, error } = await supabase
                        .from('product_images')
                        .insert({
                            product_id: productId,
                            image_url: imageUrl,
                            is_primary: isFirstImage,
                            display_order: currentDisplayOrder,
                        })
                        .select()
                        .single()

                    if (error) {
                        // Handle duplicate key error gracefully
                        if (error.code === '23505' || error.message?.includes('duplicate key')) {
                            console.warn(`Image ${file.name} already exists (duplicate key), fetching existing record`)
                            // Try to fetch the existing image
                            const { data: existingData } = await supabase
                                .from('product_images')
                                .select('*')
                                .eq('product_id', productId)
                                .eq('image_url', imageUrl)
                                .single()
                            
                            if (existingData) {
                                return existingData
                            }
                        }
                        
                        console.error(`Database error for ${file.name}:`, {
                            code: error.code,
                            message: error.message,
                            details: error.details,
                            hint: error.hint,
                        })
                        throw new Error(error.message || `Database error: ${JSON.stringify(error)}`)
                    }
                    return data
                } catch (error: any) {
                    console.error(`Error uploading ${file.name}:`, {
                        error,
                        message: error?.message,
                        stack: error?.stack,
                        name: error?.name,
                        code: error?.code,
                    })
                    
                    // Don't show error toast for duplicate images (they're already handled)
                    if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
                        console.warn(`Skipping duplicate image: ${file.name}`)
                        return null
                    }
                    
                    const errorMessage = error?.message || error?.error_description || 'Unknown error occurred'
                    toast.error(`Failed to upload ${file.name}: ${errorMessage}`)
                    return null
                }
            })

            const results = await Promise.all(uploadPromises)
            const successfulUploads = results.filter((r) => r !== null) as ProductImage[]

            if (successfulUploads.length > 0) {
                setImages([...images, ...successfulUploads])
                toast.success(`Successfully uploaded ${successfulUploads.length} image(s)`)
                onImagesChanged?.()
            }

            setUploading(false)
        },
        [productId, images, onImagesChanged]
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
        },
        multiple: true,
        disabled: uploading || !productId,
    })

    const handleRemove = async (imageId: string, imageUrl: string) => {
        try {
            // Delete from storage
            await deleteProductImage(imageUrl)

            // Delete from database
            const { error } = await supabase
                .from('product_images')
                .delete()
                .eq('id', imageId)

            if (error) throw error

            setImages(images.filter((img) => img.id !== imageId))
            
            // If we removed the primary image, make the first remaining image primary
            const remainingImages = images.filter((img) => img.id !== imageId)
            if (remainingImages.length > 0) {
                const firstImage = remainingImages[0]
                await supabase
                    .from('product_images')
                    .update({ is_primary: true })
                    .eq('id', firstImage.id)
            }

            toast.success('Image removed')
            onImagesChanged?.()
        } catch (error: any) {
            console.error('Error removing image:', error)
            toast.error('Failed to remove image')
        }
    }

    const handleSetPrimary = async (imageId: string) => {
        try {
            // Unset all primary images
            await supabase
                .from('product_images')
                .update({ is_primary: false })
                .eq('product_id', productId)

            // Set this image as primary
            const { error } = await supabase
                .from('product_images')
                .update({ is_primary: true })
                .eq('id', imageId)

            if (error) throw error

            setImages(
                images.map((img) => ({
                    ...img,
                    is_primary: img.id === imageId,
                }))
            )
            toast.success('Primary image updated')
            onImagesChanged?.()
        } catch (error: any) {
            console.error('Error setting primary image:', error)
            toast.error('Failed to set primary image')
        }
    }

    const handleReorder = async (imageId: string, newOrder: number) => {
        try {
            const { error } = await supabase
                .from('product_images')
                .update({ display_order: newOrder })
                .eq('id', imageId)

            if (error) throw error

            // Reorder local state
            const updatedImages = [...images]
            const imageIndex = updatedImages.findIndex((img) => img.id === imageId)
            if (imageIndex !== -1) {
                updatedImages[imageIndex].display_order = newOrder
                updatedImages.sort((a, b) => {
                    if (a.display_order !== b.display_order) {
                        return a.display_order - b.display_order
                    }
                    return b.is_primary ? 1 : -1
                })
                setImages(updatedImages)
                onImagesChanged?.()
            }
        } catch (error: any) {
            console.error('Error reordering image:', error)
            toast.error('Failed to reorder image')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                        <div key={image.id} className="relative group">
                            <div className="relative w-full aspect-square rounded-lg overflow-hidden border">
                                <Image
                                    src={image.image_url}
                                    alt={`Product image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                />
                                {image.is_primary && (
                                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full p-1">
                                        <Star className="h-3 w-3 fill-current" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="icon"
                                        onClick={() => handleSetPrimary(image.id)}
                                        disabled={image.is_primary}
                                        title="Set as primary"
                                    >
                                        <Star className={cn('h-4 w-4', image.is_primary && 'fill-current')} />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleRemove(image.id, image.image_url)}
                                        title="Remove image"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-1 flex items-center justify-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReorder(image.id, index - 1)}
                                    disabled={index === 0}
                                    className="h-6 px-2"
                                >
                                    ↑
                                </Button>
                                <span className="text-xs text-muted-foreground">{index + 1}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReorder(image.id, index + 1)}
                                    disabled={index === images.length - 1}
                                    className="h-6 px-2"
                                >
                                    ↓
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div
                {...getRootProps()}
                className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                    isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
                    (uploading || !productId) && 'opacity-50 cursor-not-allowed'
                )}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Uploading images...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm font-medium">
                            {isDragActive
                                ? 'Drop the images here'
                                : 'Drag & drop images, or click to select'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            PNG, JPG, JPEG or WEBP (max 5MB each)
                        </p>
                        {!productId && (
                            <p className="text-xs text-destructive mt-2">
                                Save the product first to enable image upload
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
