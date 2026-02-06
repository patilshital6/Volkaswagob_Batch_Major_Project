'use client'

import { Button } from '@/components/ui/button'
import { FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface InvoiceData {
    order: {
        id: string
        order_number: string
        order_date: string
        status: string
        total_amount: number
        customer_name: string
        customer_email?: string
        customer_phone?: string
        shipping_address?: string
    }
    items: Array<{
        product_name: string
        sku: string
        quantity: number
        unit_price: number
        total: number
    }>
}

interface GenerateInvoiceButtonProps {
    invoiceData: InvoiceData
    variant?: 'default' | 'outline' | 'ghost'
}

export function GenerateInvoiceButton({ invoiceData, variant = 'outline' }: GenerateInvoiceButtonProps) {
    const [generating, setGenerating] = useState(false)

    const generatePDF = async () => {
        setGenerating(true)
        try {
            const doc = new jsPDF()
            const { order, items } = invoiceData

            // Set fonts
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(20)

            // Header
            doc.text('SALES INVOICE', 105, 20, { align: 'center' })

            // Company Info (you can customize this)
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text('Your Company Name', 20, 35)
            doc.text('123 Business Street', 20, 40)
            doc.text('City, State 12345', 20, 45)
            doc.text('Phone: (555) 123-4567', 20, 50)

            // Invoice Info
            doc.setFont('helvetica', 'bold')
            doc.text('Invoice Details:', 140, 35)
            doc.setFont('helvetica', 'normal')
            doc.text(`Invoice #: ${order.order_number}`, 140, 40)
            doc.text(`Date: ${new Date(order.order_date).toLocaleDateString()}`, 140, 45)
            doc.text(`Status: ${order.status.toUpperCase()}`, 140, 50)

            // Customer Info
            doc.setFont('helvetica', 'bold')
            doc.text('Bill To:', 20, 65)
            doc.setFont('helvetica', 'normal')
            doc.text(order.customer_name, 20, 70)
            if (order.customer_email) {
                doc.text(order.customer_email, 20, 75)
            }
            if (order.customer_phone) {
                doc.text(order.customer_phone, 20, 80)
            }
            if (order.shipping_address) {
                doc.text(order.shipping_address, 20, 85)
            }

            // Line Items Table
            const tableData = items.map((item) => [
                item.sku,
                item.product_name,
                item.quantity.toString(),
                `$${item.unit_price.toFixed(2)}`,
                `$${item.total.toFixed(2)}`,
            ])

            autoTable(doc, {
                startY: 100,
                head: [['SKU', 'Product', 'Qty', 'Unit Price', 'Total']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [71, 85, 105] },
                styles: { fontSize: 10 },
                columnStyles: {
                    2: { halign: 'center' },
                    3: { halign: 'right' },
                    4: { halign: 'right' },
                },
            })

            // Get the final Y position after the table
            const finalY = (doc as any).lastAutoTable.finalY || 100

            // Totals Section
            const totalsY = finalY + 15
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)

            // Subtotal
            const subtotal = items.reduce((sum, item) => sum + item.total, 0)
            doc.text('Subtotal:', 140, totalsY)
            doc.text(`$${subtotal.toFixed(2)}`, 185, totalsY, { align: 'right' })

            // Tax (you can add tax calculation here)
            const tax = 0
            doc.text('Tax:', 140, totalsY + 7)
            doc.text(`$${tax.toFixed(2)}`, 185, totalsY + 7, { align: 'right' })

            // Total
            doc.setFontSize(14)
            doc.text('Total:', 140, totalsY + 17)
            doc.text(`$${order.total_amount.toFixed(2)}`, 185, totalsY + 17, { align: 'right' })

            // Footer
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text('Thank you for your business!', 105, totalsY + 35, { align: 'center' })
            doc.text('Terms: Payment due within 30 days', 105, totalsY + 40, { align: 'center' })

            // Save the PDF
            doc.save(`invoice-${order.order_number}.pdf`)
            toast.success('Invoice generated successfully')
        } catch (error) {
            console.error('Error generating PDF:', error)
            toast.error('Failed to generate invoice')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <Button onClick={generatePDF} disabled={generating} variant={variant}>
            {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <FileText className="mr-2 h-4 w-4" />
            )}
            {generating ? 'Generating...' : 'Generate Invoice'}
        </Button>
    )
}
