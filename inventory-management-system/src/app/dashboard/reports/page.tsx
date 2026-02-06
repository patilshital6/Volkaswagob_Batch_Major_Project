'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InventoryValuation } from './inventory-valuation'
import { StockMovement } from './stock-movement'
import { LowStockAlerts } from './low-stock-alerts'
import { SalesAnalytics } from './sales-analytics'
import { PurchaseAnalytics } from './purchase-analytics'

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                <p className="text-muted-foreground">
                    View detailed reports and analytics for your inventory
                </p>
            </div>

            <Tabs defaultValue="valuation" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="valuation">Inventory Valuation</TabsTrigger>
                    <TabsTrigger value="movement">Stock Movement</TabsTrigger>
                    <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                    <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
                    <TabsTrigger value="purchases">Purchase Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="valuation">
                    <InventoryValuation />
                </TabsContent>

                <TabsContent value="movement">
                    <StockMovement />
                </TabsContent>

                <TabsContent value="low-stock">
                    <LowStockAlerts />
                </TabsContent>

                <TabsContent value="sales">
                    <SalesAnalytics />
                </TabsContent>

                <TabsContent value="purchases">
                    <PurchaseAnalytics />
                </TabsContent>
            </Tabs>
        </div>
    )
}
