'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { SuppliersTable } from './suppliers-table'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/lib/hooks/use-user'
import { toast } from 'sonner'

export default function SuppliersPage() {
    const { isManager } = useUser()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
                    <p className="text-muted-foreground">
                        Manage your supplier relationships
                    </p>
                </div>
                {isManager ? (
                    <Button asChild>
                        <Link href="/dashboard/suppliers/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Supplier
                        </Link>
                    </Button>
                ) : (
                    <Button
                        onClick={() => toast.error('Only managers can create suppliers')}
                        disabled
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Supplier
                    </Button>
                )}
            </div>

            <Suspense fallback={<Skeleton className="h-96" />}>
                <SuppliersTable />
            </Suspense>
        </div>
    )
}
