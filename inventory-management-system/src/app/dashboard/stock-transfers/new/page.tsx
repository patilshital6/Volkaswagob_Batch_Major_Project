import { StockTransferForm } from '../stock-transfer-form'

export default function NewStockTransferPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">New Stock Transfer</h1>
                <p className="text-muted-foreground">
                    Transfer inventory between warehouses
                </p>
            </div>
            <StockTransferForm />
        </div>
    )
}
