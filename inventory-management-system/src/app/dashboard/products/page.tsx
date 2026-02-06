'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ProductsTable } from './products-table'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/lib/hooks/use-user'
import { toast } from 'sonner'

export default function ProductsPage() {
    const { isStaff } = useUser()

    console.log('📦 Products Page Rendering')
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">
                        Manage your product catalog
                    </p>
                </div>
                {isStaff ? (
                    <Button asChild>
                        <Link href="/dashboard/products/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Link>
                    </Button>
                ) : (
                    <Button
                        onClick={() => toast.error('Only staff and above can create products')}
                        disabled
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                )}
            </div>

            <Suspense fallback={<Skeleton className="h-96" />}>
                <ProductsTable />
            </Suspense>
        </div>
    )
}
