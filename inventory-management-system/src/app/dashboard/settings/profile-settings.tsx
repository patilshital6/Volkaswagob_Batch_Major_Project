'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { profileSchema, type ProfileFormData } from '@/lib/validations/settings'
import { useUser } from '@/lib/hooks/use-user'

export function ProfileSettings() {
    const { user, profile, loading: userLoading } = useUser()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: '',
            email: '',
        },
    })

    // Update form values when profile/user data loads
    useEffect(() => {
        if (profile && user && !userLoading) {
            reset({
                full_name: profile.full_name || '',
                email: user.email || '',
            })
        }
    }, [profile, user, userLoading, reset])

    const onSubmit = async (data: ProfileFormData) => {
        if (!user?.id) {
            toast.error('User not found')
            return
        }

        setLoading(true)
        try {
            // Update profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: data.full_name })
                .eq('id', user.id)

            if (profileError) throw profileError

            // Update email if changed
            if (data.email !== user.email) {
                const { error: emailError } = await supabase.auth.updateUser({
                    email: data.email,
                })

                if (emailError) throw emailError

                toast.success('Profile updated! Please check your new email to confirm the change.')
            } else {
                toast.success('Profile updated successfully!')
            }

            // Update form with new values immediately
            reset({
                full_name: data.full_name,
                email: data.email,
            })

            // Reload to get fresh data from server
            setTimeout(() => window.location.reload(), 1500)
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (userLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                            id="full_name"
                            {...register('full_name')}
                            placeholder="Enter your full name"
                        />
                        {errors.full_name && (
                            <p className="text-sm text-red-500">{errors.full_name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            placeholder="Enter your email"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Changing your email will require verification
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Input value={profile?.role || 'viewer'} disabled className="capitalize" />
                        <p className="text-xs text-muted-foreground">
                            Contact an administrator to change your role
                        </p>
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
