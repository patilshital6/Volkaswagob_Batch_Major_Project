'use client'

import { StockTransfersTable } from './stock-transfers-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useUser } from '@/lib/hooks/use-user'
import { toast } from 'sonner'

export default function StockTransfersPage() {
    const { isStaff } = useUser()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Stock Transfers</h1>
                    <p className="text-muted-foreground">
                        Transfer inventory between warehouses
                    </p>
                </div>
                {isStaff ? (
                    <Link href="/dashboard/stock-transfers/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Transfer
                        </Button>
                    </Link>
                ) : (
                    <Button
                        onClick={() => toast.error('Only staff and above can create stock transfers')}
                        disabled
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Transfer
                    </Button>
                )}
            </div>
            <StockTransfersTable />
        </div>
    )
}
