'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Shield, ShieldCheck, Eye } from 'lucide-react'
import { useUser } from '@/lib/hooks/use-user'

interface UserProfile {
    id: string
    email: string
    full_name: string
    role: 'admin' | 'manager' | 'staff' | 'viewer'
    created_at: string
}

export function UserManagement() {
    const { profile: currentUserProfile, loading: userLoading } = useUser()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        if (!userLoading) {
            fetchUsers()
        }
    }, [userLoading])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, full_name, role, created_at')
                .order('created_at', { ascending: false })

            if (error) throw error

            setUsers(data || [])
        } catch (error: any) {
            toast.error('Failed to load users')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const updateUserRole = async (userId: string, newRole: 'admin' | 'manager' | 'staff' | 'viewer') => {
        setUpdatingUserId(userId)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error

            toast.success('User role updated successfully!')
            fetchUsers()
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user role')
            console.error(error)
        } finally {
            setUpdatingUserId(null)
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return (
                    <Badge variant="default" className="gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Admin
                    </Badge>
                )
            case 'manager':
                return (
                    <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Manager
                    </Badge>
                )
            case 'staff':
                return (
                    <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Staff
                    </Badge>
                )
            case 'viewer':
                return (
                    <Badge variant="outline" className="gap-1">
                        <Eye className="h-3 w-3" />
                        Viewer
                    </Badge>
                )
            default:
                return <Badge variant="outline">{role}</Badge>
        }
    }

    // Check if current user is admin
    if (userLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (currentUserProfile?.role !== 'admin') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user roles and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-10 text-muted-foreground">
                        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>You need administrator privileges to access this section.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                    Manage user roles and permissions. Total users: {users.length}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.full_name || 'Not set'}
                                            {user.id === currentUserProfile?.id && (
                                                <Badge variant="outline" className="ml-2">
                                                    You
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {user.id === currentUserProfile?.id ? (
                                                <span className="text-sm text-muted-foreground">
                                                    Can't modify own role
                                                </span>
                                            ) : (
                                                <Select
                                                    value={user.role}
                                                    onValueChange={(value) =>
                                                        updateUserRole(user.id, value as 'admin' | 'manager' | 'staff' | 'viewer')
                                                    }
                                                    disabled={updatingUserId === user.id}
                                                >
                                                    <SelectTrigger className="w-[130px]">
                                                        {updatingUserId === user.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <SelectValue />
                                                        )}
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="manager">Manager</SelectItem>
                                                        <SelectItem value="staff">Staff</SelectItem>
                                                        <SelectItem value="viewer">Viewer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2 text-sm">Role Permissions</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>
                            <strong>Admin:</strong> Full access to all features including user management
                        </li>
                        <li>
                            <strong>Manager:</strong> Can create, edit, and delete records but cannot manage users
                        </li>
                        <li>
                            <strong>Staff:</strong> Can create orders and manage inventory but cannot edit products or manage suppliers
                        </li>
                        <li>
                            <strong>Viewer:</strong> Read-only access to all data
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
