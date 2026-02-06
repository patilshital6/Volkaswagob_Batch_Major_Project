import { Suspense } from 'react'
import { InventoryTable } from './inventory-table'
import { Skeleton } from '@/components/ui/skeleton'

export default function InventoryPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
                <p className="text-muted-foreground">
                    View and manage stock levels across all warehouses
                </p>
            </div>

            <Suspense fallback={<Skeleton className="h-96" />}>
                <InventoryTable />
            </Suspense>
        </div>
    )
}
