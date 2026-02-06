'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { warehouseSchema, WarehouseFormData } from '@/lib/validations/warehouse'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Manager {
    id: string
    full_name: string
    email: string
}

export function WarehouseForm({ warehouseId }: { warehouseId?: string }) {
    const [managers, setManagers] = useState<Manager[]>([])
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(!!warehouseId)
    const router = useRouter()
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<WarehouseFormData>({
        resolver: zodResolver(warehouseSchema) as any,
        defaultValues: {
            is_active: true,
        },
    })

    useEffect(() => {
        fetchManagers()
        if (warehouseId) {
            fetchWarehouse()
        }
    }, [warehouseId])

    const fetchManagers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .in('role', ['admin', 'manager'])
                .order('full_name')

            if (error) throw error
            setManagers(data || [])
        } catch (error) {
            console.error('Error fetching managers:', error)
        }
    }

    const fetchWarehouse = async () => {
        if (!warehouseId) return

        try {
            const { data, error } = await supabase
                .from('warehouses')
                .select('*')
                .eq('id', warehouseId)
                .single()

            if (error) throw error

            Object.keys(data).forEach((key) => {
                setValue(key as any, data[key])
            })
        } catch (error) {
            toast.error('Failed to load warehouse')
            console.error(error)
        } finally {
            setInitialLoading(false)
        }
    }

    const onSubmit = async (data: WarehouseFormData) => {
        setLoading(true)

        try {
            if (warehouseId) {
                const { error } = await supabase
                    .from('warehouses')
                    .update(data)
                    .eq('id', warehouseId)

                if (error) throw error
                toast.success('Warehouse updated successfully')
            } else {
                const { error } = await supabase
                    .from('warehouses')
                    .insert([data])

                if (error) throw error
                toast.success('Warehouse created successfully')
            }

            router.push('/dashboard/warehouses')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to save warehouse')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return <div className="flex items-center justify-center py-10">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/warehouses">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {warehouseId ? 'Edit Warehouse' : 'New Warehouse'}
                    </h1>
                    <p className="text-muted-foreground">
                        {warehouseId ? 'Update warehouse information' : 'Add a new warehouse location'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Warehouse Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Warehouse Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter warehouse name"
                                    {...register('name')}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    placeholder="City, State"
                                    {...register('location')}
                                />
                                {errors.location && (
                                    <p className="text-sm text-destructive">{errors.location.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Full Address</Label>
                            <textarea
                                id="address"
                                placeholder="Enter full address"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...register('address')}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity (units)</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    placeholder="10000"
                                    {...register('capacity')}
                                />
                                {errors.capacity && (
                                    <p className="text-sm text-destructive">{errors.capacity.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="manager_id">Warehouse Manager</Label>
                                <Select
                                    value={watch('manager_id') || 'none'}
                                    onValueChange={(value) => setValue('manager_id', value === 'none' ? null : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select manager" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Manager</SelectItem>
                                        {managers.map((manager) => (
                                            <SelectItem key={manager.id} value={manager.id}>
                                                {manager.full_name} ({manager.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/dashboard/warehouses">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {warehouseId ? 'Update Warehouse' : 'Create Warehouse'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
