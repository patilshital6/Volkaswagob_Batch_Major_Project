'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { X, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadProductImage, deleteProductImage } from '@/lib/supabase/storage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
    productId?: string
    currentImageUrl?: string
    onImageUploaded: (imageUrl: string) => void
    onImageRemoved: () => void
}

export function ImageUpload({
    productId,
    currentImageUrl,
    onImageUploaded,
    onImageRemoved,
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null)

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (!productId) {
                toast.error('Please save the product first before uploading an image')
                return
            }

            const file = acceptedFiles[0]
            if (!file) return

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB')
                return
            }

            setUploading(true)
            try {
                // Create local preview
                const objectUrl = URL.createObjectURL(file)
                setPreview(objectUrl)

                // Upload to Supabase
                const imageUrl = await uploadProductImage(file, productId)

                onImageUploaded(imageUrl)
                toast.success('Image uploaded successfully')
            } catch (error: any) {
                toast.error(error.message || 'Failed to upload image')
                setPreview(currentImageUrl || null)
            } finally {
                setUploading(false)
            }
        },
        [productId, currentImageUrl, onImageUploaded]
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
        },
        maxFiles: 1,
        disabled: uploading,
    })

    const handleRemove = async () => {
        if (currentImageUrl) {
            try {
                await deleteProductImage(currentImageUrl)
            } catch (error) {
                console.error('Error deleting image:', error)
            }
        }
        setPreview(null)
        onImageRemoved()
        toast.success('Image removed')
    }

    return (
        <div className="space-y-4">
            {preview ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                    <Image
                        src={preview}
                        alt="Product image"
                        fill
                        className="object-contain"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemove}
                        disabled={uploading}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={cn(
                        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
                        uploading && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    <input {...getInputProps()} />
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <p className="text-sm font-medium">
                                {isDragActive ? 'Drop the image here' : 'Drag & drop an image, or click to select'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                PNG, JPG, JPEG or WEBP (max 5MB)
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
