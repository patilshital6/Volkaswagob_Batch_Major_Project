'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { WarehousesTable } from './warehouses-table'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/lib/hooks/use-user'
import { toast } from 'sonner'

export default function WarehousesPage() {
    const { isAdmin } = useUser()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
                    <p className="text-muted-foreground">
                        Manage your warehouse locations
                    </p>
                </div>
                {isAdmin ? (
                    <Button asChild>
                        <Link href="/dashboard/warehouses/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Warehouse
                        </Link>
                    </Button>
                ) : (
                    <Button
                        onClick={() => toast.error('Only admins can create warehouses')}
                        disabled
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Warehouse
                    </Button>
                )}
            </div>

            <Suspense fallback={<Skeleton className="h-96" />}>
                <WarehousesTable />
            </Suspense>
        </div>
    )
}
