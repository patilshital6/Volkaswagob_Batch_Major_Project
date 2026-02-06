import { createClient } from './client'

const supabase = createClient()
const BUCKET_NAME = 'product-images'

export async function uploadProductImage(file: File, productId: string): Promise<string> {
    try {
        // Validate file
        if (!file || !productId) {
            throw new Error('File and product ID are required')
        }

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        if (!validTypes.includes(file.type)) {
            throw new Error('Invalid file type. Only PNG, JPEG, JPG, and WEBP are allowed')
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('File size must be less than 5MB')
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        // Add random component to ensure uniqueness even when uploading multiple files simultaneously
        const randomSuffix = Math.random().toString(36).substring(2, 9)
        const fileName = `${productId}-${Date.now()}-${randomSuffix}.${fileExt}`
        const filePath = `products/${fileName}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.type,
            })

        if (uploadError) {
            console.error('Upload error details:', {
                message: uploadError.message,
                statusCode: uploadError.statusCode,
                name: uploadError.name,
            })
            // Check if bucket exists
            if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
                throw new Error('Storage bucket not found. Please create the "product-images" bucket in Supabase Storage.')
            }
            // Check for permission errors
            if (uploadError.message?.includes('permission') || uploadError.message?.includes('policy')) {
                throw new Error('Permission denied. Please check your storage bucket policies.')
            }
            // Check for file size errors
            if (uploadError.message?.includes('size') || uploadError.message?.includes('too large')) {
                throw new Error('File is too large. Maximum size is 5MB.')
            }
            throw new Error(uploadError.message || `Upload failed: ${JSON.stringify(uploadError)}`)
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

        if (!urlData?.publicUrl) {
            throw new Error('Failed to get image URL')
        }

        return urlData.publicUrl
    } catch (error: any) {
        console.error('Error uploading product image:', error)
        throw error
    }
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
    try {
        if (!imageUrl) return

        // Extract the file path from the URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/product-images/products/[filename]
        const urlParts = imageUrl.split('/product-images/')
        if (urlParts.length < 2) {
            console.warn('Invalid image URL format:', imageUrl)
            return
        }

        // Get the file path after 'product-images/'
        const fullPath = urlParts[1]
        
        // Remove the file
        const { error } = await supabase.storage.from(BUCKET_NAME).remove([fullPath])

        if (error) {
            console.error('Error deleting image:', error)
            // Don't throw - deletion failure shouldn't break the flow
        }
    } catch (error) {
        console.error('Error in deleteProductImage:', error)
        // Don't throw - deletion failure shouldn't break the flow
    }
}
