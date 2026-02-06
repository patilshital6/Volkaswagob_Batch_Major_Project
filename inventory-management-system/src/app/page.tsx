'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
    Package2, 
    BarChart3, 
    Warehouse, 
    TrendingUp, 
    Shield, 
    Zap, 
    CheckCircle2,
    ArrowRight,
    Users,
    FileText,
    Bell
} from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Home() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Check if user is already logged in
        const checkUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                router.push('/dashboard')
            }
        }
        checkUser()
    }, [router])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
            },
        },
    }

    const features = [
        {
            icon: Package2,
            title: 'Product Management',
            description: 'Track products with SKU, categories, pricing, and multiple images',
            color: 'text-blue-500',
        },
        {
            icon: Warehouse,
            title: 'Multi-Warehouse',
            description: 'Manage inventory across multiple locations with real-time tracking',
            color: 'text-green-500',
        },
        {
            icon: TrendingUp,
            title: 'Real-time Analytics',
            description: 'Comprehensive reports and analytics with visual charts and graphs',
            color: 'text-purple-500',
        },
        {
            icon: BarChart3,
            title: 'Sales & Purchase Orders',
            description: 'Streamlined order management with automated inventory updates',
            color: 'text-orange-500',
        },
        {
            icon: Bell,
            title: 'Low Stock Alerts',
            description: 'Automated alerts when products fall below reorder levels',
            color: 'text-red-500',
        },
        {
            icon: Shield,
            title: 'Role-Based Access',
            description: 'Secure access control with admin, manager, staff, and viewer roles',
            color: 'text-indigo-500',
        },
    ]

    const benefits = [
        'Real-time inventory tracking',
        'Multi-warehouse support',
        'Automated stock alerts',
        'Comprehensive analytics',
        'Role-based permissions',
        'Mobile-responsive design',
    ]

    if (!mounted) {
        return null
    }

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Animated Header */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50"
            >
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 font-bold text-xl"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                            <Package2 className="h-6 w-6 text-primary" />
                        </motion.div>
                        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Inventory Management
                        </span>
                    </motion.div>
                    <div className="flex gap-4">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="ghost" asChild>
                                <Link href="/login">Log in</Link>
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button asChild>
                                <Link href="/signup">Sign up</Link>
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </motion.header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="container mx-auto px-4 py-20 lg:py-32">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-8"
                        >
                            <motion.div variants={itemVariants} className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                                >
                                    <Zap className="h-4 w-4" />
                                    <span>Streamline Your Inventory Operations</span>
                                </motion.div>
                                <motion.h1
                                    initial={{ y: 60, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
                                    className="text-5xl lg:text-7xl font-bold tracking-tight"
                                >
                                    <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                        Inventory Management
                                    </span>
                                    <br />
                                    <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                        Made Simple
                                    </span>
                                </motion.h1>
                                <motion.p
                                    initial={{ y: 60, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
                                    className="text-xl text-muted-foreground max-w-2xl"
                                >
                                    Manage your products, warehouses, and stock levels with real-time tracking,
                                    comprehensive analytics, and automated alerts. Built for modern businesses.
                                </motion.p>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button size="lg" className="w-full sm:w-auto" asChild>
                                        <Link href="/signup">
                                            Get Started Free
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                                        <Link href="/login">Log in</Link>
                                    </Button>
                                </motion.div>
                            </motion.div>

                            {/* Benefits List */}
                            <motion.div
                                variants={itemVariants}
                                className="grid grid-cols-2 gap-3 pt-4"
                            >
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={benefit}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        <span className="text-sm text-muted-foreground">{benefit}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Right Content - GIF/Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="relative"
                        >
                            <motion.div
                                animate={{
                                    y: [0, -20, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                className="relative w-full h-[500px] rounded-2xl overflow-hidden border-4 border-primary/20 shadow-2xl"
                            >
                                {/* Placeholder for GIF - Replace with your actual GIF */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
                                    <div className="text-center space-y-4 p-8">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <Package2 className="h-32 w-32 text-primary/30 mx-auto" />
                                        </motion.div>
                                        <p className="text-sm text-muted-foreground">
                                            Add your inventory management GIF here
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Place your GIF file in: <code className="bg-muted px-2 py-1 rounded">public/landing-hero.gif</code>
                                        </p>
                                    </div>
                                </div>
                                {/* Uncomment and use this when you have a GIF */}
                                <Image
                                    src="/landing-hero.gif"
                                    alt="Inventory Management System"
                                    fill
                                    className="object-cover"
                                    priority
                                    unoptimized
                                />
                            </motion.div>
                            {/* Floating Cards */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">Real-time Updates</p>
                                        <p className="text-xs text-muted-foreground">Live inventory tracking</p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                        <BarChart3 className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">Analytics Dashboard</p>
                                        <p className="text-xs text-muted-foreground">Insights & reports</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="container mx-auto px-4 py-20 bg-white/50 dark:bg-gray-800/50">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center space-y-4 mb-16"
                    >
                        <h2 className="text-4xl lg:text-5xl font-bold">
                            Powerful Features for{' '}
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Modern Businesses
                            </span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to manage your inventory efficiently and scale your operations
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                variants={itemVariants}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="group relative p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:shadow-xl transition-all duration-300"
                            >
                                <motion.div
                                    whileHover={{ rotate: [0, -10, 10, 0] }}
                                    transition={{ duration: 0.5 }}
                                    className={`h-12 w-12 rounded-lg ${feature.color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                                >
                                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                </motion.div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileHover={{ width: '100%' }}
                                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-b-xl"
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* Stats Section */}
                <section className="container mx-auto px-4 py-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        {[
                            { label: 'Products', value: 'Unlimited', icon: Package2 },
                            { label: 'Warehouses', value: 'Multi-Location', icon: Warehouse },
                            { label: 'Real-time', value: 'Live Updates', icon: Zap },
                            { label: 'Secure', value: 'RBAC Enabled', icon: Shield },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                className="text-center space-y-2"
                            >
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                                    className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4"
                                >
                                    <stat.icon className="h-8 w-8" />
                                </motion.div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* CTA Section */}
                <section className="container mx-auto px-4 py-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-12 text-center text-white"
                    >
                        <motion.div
                            animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                            }}
                            transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary opacity-50"
                            style={{
                                backgroundSize: '200% 200%',
                            }}
                        />
                        <div className="relative z-10 space-y-6">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-4xl lg:text-5xl font-bold"
                            >
                                Ready to Get Started?
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-xl opacity-90 max-w-2xl mx-auto"
                            >
                                Join thousands of businesses managing their inventory efficiently
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
                                        <Link href="/signup">
                                            Start Free Trial
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                                        <Link href="/login">Log in</Link>
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </section>
            </main>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
            >
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Package2 className="h-5 w-5 text-primary" />
                            <span className="font-semibold">Inventory Management System</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} All rights reserved.
                        </p>
                    </div>
                </div>
            </motion.footer>
        </div>
    )
}
