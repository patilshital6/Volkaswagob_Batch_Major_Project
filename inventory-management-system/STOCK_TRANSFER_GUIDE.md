# Stock Transfer System - Complete Guide

## 📦 Overview

Stock transfers allow you to move inventory from one warehouse to another. This is useful for:
- **Replenishing stock** at different locations
- **Balancing inventory** across warehouses
- **Moving products** to where they're needed most
- **Consolidating inventory** from multiple locations

---

## 🔄 Complete Stock Transfer Flow

### Step 1: Create Stock Transfer (Status: **pending**)

**Path:** Dashboard → Stock Transfers → New Stock Transfer

**What happens:**

1. **Fill Transfer Form:**
   - Select **From Warehouse** (source - where items are currently)
   - Select **To Warehouse** (destination - where items are going)
   - Set **Transfer Date**
   - Add **Notes** (optional)
   - Add **Products** with quantities to transfer

2. **Inventory Validation:**
   - System checks if source warehouse has enough stock
   - Only shows products available in the selected source warehouse
   - Validates quantity before allowing transfer creation

3. **Create Transfer:**
   - Transfer number auto-generated: `TR-YYYYMMDD-####` (e.g., `TR-20260130-0001`)
   - Status set to **'pending'**
   - Transfer record created in `stock_transfers` table
   - Transfer items created in `stock_transfer_items` table

**Inventory Impact:** ❌ **NO inventory changes yet** (items still in source warehouse)

**Example:**
```
Transfer: TR-20260130-0001
From: Main Warehouse
To: Branch Warehouse
Items: 10 Laptops, 50 Mice
Status: pending
```

---

### Step 2: Start Transit (Status: **in_transit**)

**Path:** Dashboard → Stock Transfers → Click Transfer → "Start Transit"

**What happens:**

1. **Status Update:**
   - Transfer status changes from 'pending' → 'in_transit'
   - Indicates items are physically being moved

**Inventory Impact:** ❌ **NO inventory changes yet** (items still in source warehouse, not yet at destination)

**Use Case:** 
- Items are packed and shipped
- In physical transit between locations
- Not yet received at destination

---

### Step 3: Complete Transfer (Status: **completed**) ⭐ **INVENTORY UPDATES HERE**

**Path:** Dashboard → Stock Transfers → Click Transfer → "Complete Transfer"

**What happens:**

For each product in the transfer:

1. **Deduct from Source Warehouse:**
   ```sql
   UPDATE inventory
   SET available_quantity = available_quantity - transfer_quantity
   WHERE product_id = X AND warehouse_id = source_warehouse
   ```

2. **Add to Destination Warehouse:**
   ```sql
   -- If inventory exists at destination:
   UPDATE inventory
   SET available_quantity = available_quantity + transfer_quantity
   WHERE product_id = X AND warehouse_id = destination_warehouse
   
   -- If inventory doesn't exist at destination:
   INSERT INTO inventory (
     product_id, 
     warehouse_id, 
     available_quantity = transfer_quantity,
     reserved_quantity = 0
   )
   ```

3. **Create Transaction Records:**
   ```sql
   -- Source warehouse (outgoing)
   INSERT INTO transactions (
     type = 'transfer_out',
     quantity = -transfer_quantity,
     reference_id = transfer_id
   )
   
   -- Destination warehouse (incoming)
   INSERT INTO transactions (
     type = 'transfer_in',
     quantity = +transfer_quantity,
     reference_id = transfer_id
   )
   ```

4. **Status Update:**
   - Transfer status changes to **'completed'**

**Inventory Impact:** ✅ **Inventory moves from source to destination**

**Example:**
```
Before Transfer:
  Main Warehouse:    100 laptops
  Branch Warehouse:  0 laptops

After Transfer (10 laptops):
  Main Warehouse:    90 laptops  ⬇️ (-10)
  Branch Warehouse:  10 laptops  ⬆️ (+10)
```

---

### Step 4: Cancel Transfer (Status: **cancelled**)

**Path:** Dashboard → Stock Transfers → Click Transfer → "Cancel Transfer"

**Available for:** 'pending' or 'in_transit' status only

**What happens:**

1. **Status Update:**
   - Transfer status changes to **'cancelled'**

**Inventory Impact:** ❌ **NO inventory changes** (items stay in source warehouse)

**Use Case:**
- Transfer was created by mistake
- Items not needed at destination anymore
- Transfer cannot be completed

---

## 📊 Status Flow Diagram

```
┌─────────┐
│ pending │  ← Transfer created, items still in source
└────┬────┘
     │
     │ [Start Transit]
     ▼
┌─────────────┐
│ in_transit  │  ← Items being moved, still in source
└────┬────────┘
     │
     │ [Complete Transfer] ⭐ Inventory updates here
     ▼
┌───────────┐
│ completed │  ← Items now in destination warehouse
└───────────┘

     OR

┌─────────┐
│pending  │
└────┬────┘
     │
     │ [Cancel Transfer]
     ▼
┌───────────┐
│ cancelled │  ← Transfer cancelled, no inventory changes
└───────────┘
```

---

## 🔍 Inventory Changes Summary

| Action | Source Warehouse | Destination Warehouse | Total Inventory |
|--------|------------------|----------------------|-----------------|
| **Create Transfer** | ➡️ No change | ➡️ No change | ➡️ Same |
| **Start Transit** | ➡️ No change | ➡️ No change | ➡️ Same |
| **Complete Transfer** | ⬇️ Decreases | ⬆️ Increases | ➡️ Same |
| **Cancel Transfer** | ➡️ No change | ➡️ No change | ➡️ Same |

**Key Point:** Total inventory across all warehouses stays the same - items are just moved between locations!

---

## 📋 Step-by-Step Example

### Scenario: Moving 20 laptops from Main Warehouse to Branch Warehouse

#### Step 1: Create Transfer
```
Transfer Number: TR-20260130-0001
From: Main Warehouse
To: Branch Warehouse
Items: 20 × Dell Laptop
Status: pending

Main Warehouse:     100 laptops
Branch Warehouse:   0 laptops
```

#### Step 2: Start Transit
```
Status: in_transit
(Items being shipped)

Main Warehouse:     100 laptops  (still here)
Branch Warehouse:   0 laptops
```

#### Step 3: Complete Transfer ⭐
```
Status: completed
(Items received at destination)

Main Warehouse:     80 laptops   ⬇️ (-20)
Branch Warehouse:   20 laptops   ⬆️ (+20)
Total:              100 laptops  (same total!)
```

---

## 🎯 Key Features

### 1. **Inventory Validation**
- ✅ Checks source warehouse has enough stock
- ✅ Prevents transferring more than available
- ✅ Shows available quantity for each product

### 2. **Multi-Product Transfers**
- ✅ Can transfer multiple products in one transfer
- ✅ Each product can have different quantities
- ✅ All products move together

### 3. **Transaction Tracking**
- ✅ Creates 'transfer_out' transaction at source
- ✅ Creates 'transfer_in' transaction at destination
- ✅ Links transactions to transfer ID for audit trail

### 4. **Status Management**
- ✅ Clear status progression (pending → in_transit → completed)
- ✅ Can cancel transfers before completion
- ✅ Visual status badges

---

## 📈 Dashboard Updates

### When Transfer is Created:
- ✅ Stock Transfers list: New transfer appears
- ❌ No inventory changes yet

### When Transfer Starts Transit:
- ✅ Status badge updates to "In Transit"
- ❌ No inventory changes yet

### When Transfer is Completed:
- ✅ Inventory page: Source warehouse quantity decreases
- ✅ Inventory page: Destination warehouse quantity increases
- ✅ Stock movement report: Shows transfer transactions
- ✅ Transaction history: Records transfer_out and transfer_in
- ✅ Inventory valuation: Updates for both warehouses

---

## ⚠️ Important Notes

### 1. **Inventory Only Updates on Completion**
- Creating a transfer does NOT move inventory
- Starting transit does NOT move inventory
- **Only completing the transfer** updates inventory

### 2. **Cannot Transfer More Than Available**
- System validates available quantity before allowing transfer
- Must have sufficient stock in source warehouse

### 3. **Destination Warehouse Inventory**
- If product doesn't exist at destination, it's created automatically
- If product exists, quantity is added to existing stock

### 4. **Cancellation**
- Can only cancel 'pending' or 'in_transit' transfers
- Cannot cancel 'completed' transfers
- Cancellation doesn't affect inventory

---

## 🔧 Current Implementation Status

### ✅ Working Features:
- Create stock transfer
- View transfer details
- Status management (pending → in_transit → completed)
- Inventory updates on completion
- Transaction records
- Validation (prevents over-transferring)

### ⚠️ Potential Issues to Fix:
1. **Column Name Mismatch**: Code uses `quantity` but database uses `available_quantity` and `reserved_quantity`
2. **Async Params**: Detail page needs Next.js 15+ async params fix
3. **Inventory Query**: May need to use correct column names

---

## 🚀 How to Use

### Creating a Transfer:
1. Go to **Dashboard → Stock Transfers**
2. Click **"New Stock Transfer"**
3. Select source warehouse (from)
4. Select destination warehouse (to)
5. Add products and quantities
6. Click **"Create Transfer"**

### Processing a Transfer:
1. Go to **Stock Transfers** list
2. Click on the transfer
3. Click **"Start Transit"** when items are being moved
4. Click **"Complete Transfer"** when items arrive at destination
5. ✅ Inventory automatically updates!

---

**Stock transfers are a powerful way to manage inventory across multiple warehouse locations!** 🎯
