'use client'

import { useRef } from 'react'
import Barcode from 'react-barcode'
import { QRCodeCanvas } from 'qrcode.react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

interface ProductBarcodeProps {
    productId: string
    sku: string
    name: string
    barcode?: string
}

export function ProductBarcode({ productId, sku, name, barcode }: ProductBarcodeProps) {
    const barcodeRef = useRef<HTMLDivElement>(null)
    const qrRef = useRef<HTMLDivElement>(null)

    const downloadBarcode = (type: 'barcode' | 'qr') => {
        const ref = type === 'barcode' ? barcodeRef : qrRef
        if (!ref.current) return

        try {
            const svg = ref.current.querySelector('svg')
            if (!svg) return

            // Create canvas
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const svgData = new XMLSerializer().serializeToString(svg)
            const img = new Image()

            img.onload = () => {
                canvas.width = img.width
                canvas.height = img.height
                ctx.fillStyle = 'white'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0)

                // Download
                const link = document.createElement('a')
                link.download = `${sku}-${type}.png`
                link.href = canvas.toDataURL('image/png')
                link.click()

                toast.success(`${type === 'barcode' ? 'Barcode' : 'QR Code'} downloaded successfully`)
            }

            img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
        } catch (error) {
            toast.error('Failed to download')
            console.error(error)
        }
    }

    const codeValue = barcode || sku

    return (
        <Card>
            <CardHeader>
                <CardTitle>Barcode & QR Code</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="barcode">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="barcode">Barcode</TabsTrigger>
                        <TabsTrigger value="qr">QR Code</TabsTrigger>
                    </TabsList>

                    <TabsContent value="barcode" className="space-y-4">
                        <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-white">
                            <div ref={barcodeRef}>
                                <Barcode value={codeValue} width={2} height={80} displayValue={true} />
                            </div>
                            <div className="text-center">
                                <p className="font-medium">{name}</p>
                                <p className="text-sm text-muted-foreground">SKU: {sku}</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => downloadBarcode('barcode')}
                            className="w-full"
                            variant="outline"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download Barcode
                        </Button>
                    </TabsContent>

                    <TabsContent value="qr" className="space-y-4">
                        <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-white">
                            <div ref={qrRef}>
                                <QRCodeCanvas
                                    value={JSON.stringify({
                                        id: productId,
                                        sku: sku,
                                        name: name,
                                    })}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <div className="text-center">
                                <p className="font-medium">{name}</p>
                                <p className="text-sm text-muted-foreground">SKU: {sku}</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => downloadBarcode('qr')}
                            className="w-full"
                            variant="outline"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download QR Code
                        </Button>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
