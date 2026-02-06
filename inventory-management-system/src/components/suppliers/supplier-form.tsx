'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supplierSchema, SupplierFormData } from '@/lib/validations/supplier'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export function SupplierForm({ supplierId }: { supplierId?: string }) {
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(!!supplierId)
    const router = useRouter()
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<SupplierFormData>({
        resolver: zodResolver(supplierSchema) as any,
        defaultValues: {
            is_active: true,
        },
    })

    useEffect(() => {
        if (supplierId) {
            fetchSupplier()
        }
    }, [supplierId])

    const fetchSupplier = async () => {
        if (!supplierId) return

        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('id', supplierId)
                .single()

            if (error) throw error

            Object.keys(data).forEach((key) => {
                setValue(key as any, data[key])
            })
        } catch (error) {
            toast.error('Failed to load supplier')
            console.error(error)
        } finally {
            setInitialLoading(false)
        }
    }

    const onSubmit = async (data: SupplierFormData) => {
        setLoading(true)

        try {
            if (supplierId) {
                const { error } = await supabase
                    .from('suppliers')
                    .update(data)
                    .eq('id', supplierId)

                if (error) throw error
                toast.success('Supplier updated successfully')
            } else {
                const { error } = await supabase
                    .from('suppliers')
                    .insert([data])

                if (error) throw error
                toast.success('Supplier created successfully')
            }

            router.push('/dashboard/suppliers')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to save supplier')
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
                    <Link href="/dashboard/suppliers">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {supplierId ? 'Edit Supplier' : 'New Supplier'}
                    </h1>
                    <p className="text-muted-foreground">
                        {supplierId ? 'Update supplier information' : 'Add a new supplier'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Supplier Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Supplier Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter supplier name"
                                    {...register('name')}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact_person">Contact Person</Label>
                                <Input
                                    id="contact_person"
                                    placeholder="Enter contact name"
                                    {...register('contact_person')}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="supplier@example.com"
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    placeholder="+1 (555) 000-0000"
                                    {...register('phone')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <textarea
                                id="address"
                                placeholder="Enter full address"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...register('address')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment_terms">Payment Terms</Label>
                            <Input
                                id="payment_terms"
                                placeholder="e.g., Net 30, Net 60"
                                {...register('payment_terms')}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/dashboard/suppliers">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {supplierId ? 'Update Supplier' : 'Create Supplier'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
