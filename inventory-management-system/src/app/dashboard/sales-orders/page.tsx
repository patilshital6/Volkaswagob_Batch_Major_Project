'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { SalesOrdersTable } from './sales-orders-table'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/lib/hooks/use-user'
import { toast } from 'sonner'

export default function SalesOrdersPage() {
    const { isStaff } = useUser()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales Orders</h1>
                    <p className="text-muted-foreground">
                        Manage customer orders and fulfillment
                    </p>
                </div>
                {isStaff ? (
                    <Button asChild>
                        <Link href="/dashboard/sales-orders/new">
                            <Plus className="mr-2 h-4 w-4" />
                            New Sales Order
                        </Link>
                    </Button>
                ) : (
                    <Button
                        onClick={() => toast.error('Only staff and above can create sales orders')}
                        disabled
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Sales Order
                    </Button>
                )}
            </div>

            <Suspense fallback={<Skeleton className="h-96" />}>
                <SalesOrdersTable />
            </Suspense>
        </div>
    )
}
