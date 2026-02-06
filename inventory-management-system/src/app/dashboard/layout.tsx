import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function Layout({ children }: { children: React.ReactNode }) {
    console.log('🏗️ Dashboard Layout Rendering')
    return <DashboardLayout>{children}</DashboardLayout>
}
