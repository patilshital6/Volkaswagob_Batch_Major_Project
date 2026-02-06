import { use } from 'react'
import { WarehouseForm } from '@/components/warehouses/warehouse-form'

export default function EditWarehousePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    return <WarehouseForm warehouseId={id} />
}
