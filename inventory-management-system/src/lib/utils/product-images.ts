/**
 * Helper function to get the primary product image URL
 * Falls back to image_url from products table if no product_images exist
 */
export function getProductImageUrl(
    primaryImage: string | null | undefined,
    fallbackImageUrl: string | null | undefined
): string | null {
    return primaryImage || fallbackImageUrl || null
}

/**
 * Get the first image from an array of product images
 */
export function getFirstProductImage(
    images: Array<{ image_url: string; is_primary?: boolean }> | null | undefined
): string | null {
    if (!images || images.length === 0) return null
    
    // Try to find primary image first
    const primary = images.find((img) => img.is_primary)
    if (primary) return primary.image_url
    
    // Otherwise return first image
    return images[0].image_url
}
