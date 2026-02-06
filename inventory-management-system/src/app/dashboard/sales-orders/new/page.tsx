import { SalesOrderForm } from '../sales-order-form'

export default function NewSalesOrderPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">New Sales Order</h1>
                <p className="text-muted-foreground">
                    Create a new sales order for customer fulfillment
                </p>
            </div>
            <SalesOrderForm />
        </div>
    )
}
