# 📦 Inventory Management System

A comprehensive, enterprise-grade inventory management system built with Next.js 15, TypeScript, Supabase, and shadcn/ui. This system provides complete control over inventory, warehouses, products, suppliers, purchase orders, sales orders, and stock transfers with role-based access control.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwindcss)

## ✨ Features

### 🔐 Authentication & Authorization
- **Multi-provider Authentication**: Email/password and Google OAuth
- **Role-Based Access Control (RBAC)**: Admin, Manager, and Staff roles
- **Protected Routes**: Middleware-based authentication
- **Secure Session Management**: Cookie-based sessions with Supabase

### 📊 Core Modules

#### Inventory Management
- Real-time stock tracking across multiple warehouses
- Low stock alerts and notifications
- Product variants and categorization
- Barcode generation and scanning
- Multiple product images with primary image support
- Batch and serial number tracking

#### Warehouse Management
- Multiple warehouse support
- Location-based inventory tracking
- Warehouse capacity management
- Inter-warehouse stock transfers
- Warehouse-specific reporting

#### Product Management
- Comprehensive product catalog
- SKU management
- Product categories and tags
- Image upload with Supabase Storage
- Product pricing and cost tracking
- Stock level monitoring

#### Supplier Management
- Supplier database with contact information
- Supplier performance tracking
- Purchase history
- Payment terms management

#### Purchase Orders
- Create and manage purchase orders
- Order status tracking (Pending, Approved, Received, Cancelled)
- Supplier selection
- Automatic inventory updates on receipt
- Purchase order history and reporting

#### Sales Orders
- Sales order creation and management
- Customer information tracking
- Order fulfillment workflow
- Invoice generation
- Stock deduction on order completion
- Sales analytics and reporting

#### Stock Transfers
- Inter-warehouse stock transfers
- Transfer request and approval workflow
- Transfer status tracking
- Automatic inventory adjustments
- Transfer history and audit trail

#### Reports & Analytics
- Inventory valuation reports
- Stock movement reports
- Sales analytics
- Purchase analytics
- Low stock reports
- Warehouse performance metrics
- Exportable reports (CSV/PDF)

### 🎨 User Interface
- Modern, responsive design with shadcn/ui
- Dark mode support
- Mobile-friendly interface
- Intuitive dashboard with key metrics
- Data tables with sorting, filtering, and pagination
- Real-time data updates
- Toast notifications for user feedback

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   
   Run the database schema:
   ```bash
   # Execute the SQL files in your Supabase SQL editor
   # In order:
   # 1. supabase-schema.sql
   # 2. storage-setup.sql
   # 3. fix-*.sql (any fix files as needed)
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Admin Account

After setting up the database, create your first admin user through the signup page, then manually update the role in Supabase:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## 📚 Documentation

For detailed documentation, refer to these files:

- [Quick Start Guide](QUICK_START.md) - Detailed setup instructions
- [Role Permissions](ROLE_PERMISSIONS_DETAILED.md) - RBAC documentation
- [Stock Transfer Guide](STOCK_TRANSFER_GUIDE.md) - Stock transfer workflow
- [Sales Order Flow](SALES_ORDER_FLOW.md) - Sales order process
- [Google Auth Setup](GOOGLE_AUTH_SETUP.md) - OAuth configuration
- [Security Fixes](SECURITY_FIXES_APPLIED.md) - Security implementation details
- [Implementation Status](IMPLEMENTATION_STATUS.md) - Feature completion status

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Next.js API Routes
- **Real-time**: Supabase Realtime (optional)

### DevOps
- **Version Control**: Git
- **Package Manager**: npm/yarn/pnpm
- **Linting**: ESLint
- **Type Checking**: TypeScript

## 📁 Project Structure

```
inventory-management-system/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/            # Authentication pages
│   │   ├── dashboard/         # Dashboard and main features
│   │   ├── auth/              # Auth callbacks
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Layout components
│   │   └── [feature]/        # Feature-specific components
│   ├── lib/                   # Utility libraries
│   │   ├── supabase/         # Supabase client & utilities
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Helper functions
│   │   └── validations/      # Zod schemas
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
└── *.sql                      # Database schema files
```

## 🔒 Security Features

- Row Level Security (RLS) on all tables
- Role-based permissions
- Secure authentication flow
- Protected API routes
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection via Supabase

## 🎯 Role Permissions

### Admin
- Full system access
- User management
- All CRUD operations
- System configuration
- Reports and analytics

### Manager
- Inventory management
- Purchase order approval
- Sales order management
- Stock transfer approval
- Reports viewing

### Staff
- View inventory
- Create purchase orders (requires approval)
- Create sales orders
- Request stock transfers
- Limited reporting access

For detailed permissions, see [ROLE_PERMISSIONS_DETAILED.md](ROLE_PERMISSIONS_DETAILED.md).

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build the project
npm run build
```

## 📦 Database Schema

The system uses a comprehensive PostgreSQL schema with the following main tables:

- `profiles` - User profiles with role information
- `warehouses` - Warehouse locations
- `products` - Product catalog
- `product_images` - Multiple product images
- `suppliers` - Supplier information
- `inventory` - Stock levels per warehouse
- `purchase_orders` - Purchase order headers
- `purchase_order_items` - Purchase order line items
- `sales_orders` - Sales order headers
- `sales_order_items` - Sales order line items
- `stock_transfers` - Stock transfer records

All tables implement Row Level Security (RLS) for data protection.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Other Platforms

This Next.js application can be deployed on any platform that supports Node.js:
- Netlify
- AWS Amplify
- Railway
- Render
- DigitalOcean App Platform

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

Check [GitHub Issues](../../issues) for known bugs and feature requests.

## 💬 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation files
- Review the Quick Start guide

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [TailwindCSS](https://tailwindcss.com/) - Styling framework
- [Vercel](https://vercel.com/) - Hosting platform

## 📊 Project Status

This project is actively maintained and in production. See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for the current feature status.

---

Built with ❤️ using Next.js and Supabase
