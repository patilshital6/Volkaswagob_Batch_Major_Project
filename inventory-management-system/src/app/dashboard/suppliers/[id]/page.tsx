'use client'

import { use, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Edit, Mail, Phone, MapPin, FileText, Eye } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Supplier {
    id: string
    name: string
    contact_person: string | null
    email: string | null
    phone: string | null
    address: string | null
    payment_terms: string | null
    is_active: boolean
    created_at: string
}

interface PurchaseOrder {
    id: string
    po_number: string
    status: string
    total_amount: number
    created_at: string
    expected_date: string | null
    received_date: string | null
    warehouse: {
        name: string
    } | null
}

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [supplier, setSupplier] = useState<Supplier | null>(null)
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchSupplier()
        fetchPurchaseOrders()
    }, [id])

    const fetchSupplier = async () => {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            setSupplier(data)
        } catch (error) {
            toast.error('Failed to load supplier')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchPurchaseOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('purchase_orders')
                .select(`
                    id,
                    po_number,
                    status,
                    total_amount,
                    created_at,
                    expected_date,
                    received_date,
                    warehouse:warehouses(name)
                `)
                .eq('supplier_id', id)
                .order('created_at', { ascending: false })

            if (error) throw error

            // Transform data to match interface (Supabase returns nested relations as arrays)
            const orders: PurchaseOrder[] = (data || []).map((po: any) => ({
                id: po.id,
                po_number: po.po_number,
                status: po.status,
                total_amount: po.total_amount,
                created_at: po.created_at,
                expected_date: po.expected_date,
                received_date: po.received_date,
                warehouse: Array.isArray(po.warehouse) ? po.warehouse[0] : po.warehouse,
            }))
            setPurchaseOrders(orders)
        } catch (error) {
            console.error('Failed to load purchase orders:', error)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge variant="secondary">Draft</Badge>
            case 'sent':
                return <Badge variant="outline">Sent</Badge>
            case 'partial':
                return <Badge variant="outline">Partially Received</Badge>
            case 'received':
                return <Badge variant="default">Received</Badge>
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center py-10">Loading...</div>
    }

    if (!supplier) {
        return (
            <div className="text-center py-10">
                <p className="text-muted-foreground">Supplier not found</p>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/suppliers">Back to Suppliers</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/suppliers">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{supplier.name}</h1>
                        <p className="text-muted-foreground">Supplier Details</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href={`/dashboard/suppliers/${supplier.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Contact Person</p>
                                <p className="font-medium">{supplier.contact_person || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{supplier.email || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-medium">{supplier.phone || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Address</p>
                                <p className="font-medium">{supplier.address || 'Not provided'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Business Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Payment Terms</p>
                            <p className="font-medium">{supplier.payment_terms || 'Not specified'}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant={supplier.is_active ? 'default' : 'secondary'} className="mt-1">
                                {supplier.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Created</p>
                            <p className="font-medium">
                                {new Date(supplier.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Purchase Order History</CardTitle>
                </CardHeader>
                <CardContent>
                    {purchaseOrders.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>PO Number</TableHead>
                                        <TableHead>Warehouse</TableHead>
                                        <TableHead>Order Date</TableHead>
                                        <TableHead>Expected Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total Amount</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchaseOrders.map((po) => (
                                        <TableRow key={po.id}>
                                            <TableCell className="font-medium">{po.po_number}</TableCell>
                                            <TableCell>{po.warehouse?.name || 'Unknown Warehouse'}</TableCell>
                                            <TableCell>
                                                {new Date(po.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                {po.expected_date
                                                    ? new Date(po.expected_date).toLocaleDateString('en-US', {
                                                          year: 'numeric',
                                                          month: 'short',
                                                          day: 'numeric',
                                                      })
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(po.status)}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                ${po.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/dashboard/purchase-orders/${po.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-2" />
                            <p>No purchase orders yet</p>
                            <p className="text-sm mt-1">Create a purchase order to track orders from this supplier</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
