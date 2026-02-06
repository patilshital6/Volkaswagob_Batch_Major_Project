import { use, Suspense } from 'react'
import { ProductDetail } from './product-detail'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    return (
        <Suspense fallback={<Skeleton className="h-96" />}>
            <ProductDetail productId={id} />
        </Suspense>
    )
}
