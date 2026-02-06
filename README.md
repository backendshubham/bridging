# RatnaVeda: Next-Gen Gemstone Inventory & QR Discovery System

A comprehensive, high-performance web application for managing gemstone inventory with QR code integration, built with Node.js, Express, EJS, PostgreSQL, and Redis.

## 🚀 Features

### Admin Dashboard
- **Complete Inventory Management**: Add, edit, delete, and organize gemstones
- **Media Management**: Upload high-resolution images with AWS S3 integration
- **Category Management**: Organize gemstones by categories (Precious/Semi-Precious)
- **QR Code Generation**: Automatic QR code generation for each gemstone
- **Master QR Code**: Single QR code for entire catalog access
- **Analytics Dashboard**: View statistics, recent additions, and most-scanned items
- **Settings Management**: Update privacy policy and terms & conditions without developer help

### Customer Portal
- **Frictionless Browsing**: No login required for customers
- **Advanced Filtering**: Filter by carat, price, type, category, and search
- **Product Details**: Comprehensive product pages with specifications, certifications, and galleries
- **QR Code Scanning**: Direct access to products via QR codes
- **Mobile Responsive**: Optimized for all devices
- **Certificate Display**: Clear visibility of authenticity certificates

## 🛠️ Tech Stack

- **Backend**: Node.js (Express)
- **Frontend**: EJS (Embedded JavaScript)
- **Database**: PostgreSQL with Knex.js ORM
- **Caching**: Redis for zero-lag filtering
- **Storage**: AWS S3 for image hosting (with local fallback)
- **Security**: Helmet, rate limiting, session management
- **QR Codes**: QRCode library for generation

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Redis (optional, for caching)
- AWS S3 account (optional, for cloud storage)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jewels
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure:
   - Database credentials
   - Redis connection (optional)
   - AWS S3 credentials (optional)
   - Session secret
   - Application URL

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb ratnaveda

   # Run migrations
   npm run migrate

   # Seed default data
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🔐 Default Admin Credentials

After running seeds:
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change the default password immediately after first login!

## 📁 Project Structure

```
ratnaveda/
├── config/              # Configuration files (AWS, Redis, Multer)
├── controllers/         # Route controllers
├── database/
│   ├── migrations/      # Knex migrations
│   └── seeds/          # Database seeds
├── middleware/         # Custom middleware (auth, cache)
├── public/             # Static assets
│   ├── css/           # Stylesheets
│   └── js/            # JavaScript files
├── routes/             # Route definitions
├── utils/              # Utility functions
├── views/              # EJS templates
│   ├── admin/         # Admin views
│   ├── customer/      # Customer-facing views
│   └── partials/      # Shared partials
├── uploads/            # Local uploads (if not using S3)
├── server.js           # Main server file
└── package.json        # Dependencies
```

## 🎨 Design System

The application uses a modern, gemstone-inspired design system with:
- **Primary Colors**: Deep purple gradient palette
- **Typography**: Inter (body) + Playfair Display (headings)
- **Responsive Breakpoints**: Mobile-first approach
- **Touch Targets**: Minimum 44x44px for mobile
- **Accessibility**: WCAG 2.1 AA compliant

## 🔒 Security Features

- Password hashing with bcrypt
- Session-based authentication
- Rate limiting
- Helmet.js security headers
- Input validation
- SQL injection protection (via Knex)

## 📱 QR Code Usage

### Master QR Code
- Generate from Admin Dashboard → Master QR
- Display at shop entrance
- Links to complete catalog

### Product QR Codes
- Automatically generated for each gemstone
- Print and attach to physical jewelry tags
- Direct link to product page
- Tracks scan count for analytics

## 🚀 Deployment

### AWS EC2 Setup
1. Launch EC2 instance
2. Install Node.js, PostgreSQL, and Redis
3. Set up environment variables
4. Run migrations and seeds
5. Use PM2 or similar for process management

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_NAME=ratnaveda
DB_USER=your-db-user
DB_PASSWORD=your-db-password
REDIS_HOST=your-redis-host
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET_NAME=your-bucket-name
SESSION_SECRET=your-very-secure-secret
APP_URL=https://your-domain.com
```

## 📊 Database Schema

### Tables
- `admins`: Admin user accounts
- `categories`: Gemstone categories
- `gemstones`: Main inventory table
- `settings`: System settings (privacy, terms, etc.)

## 🧪 Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Run seeds
npm run seed
```

## 📝 API Routes

### Admin Routes (`/admin`)
- `GET /admin/login` - Login page
- `POST /admin/login` - Authenticate
- `GET /admin/dashboard` - Dashboard
- `GET /admin/gemstones` - List gemstones
- `GET /admin/gemstones/create` - Create form
- `POST /admin/gemstones` - Create gemstone
- `GET /admin/gemstones/:id/edit` - Edit form
- `POST /admin/gemstones/:id` - Update gemstone
- `POST /admin/gemstones/:id/delete` - Delete gemstone
- `GET /admin/categories` - Manage categories
- `GET /admin/master-qr` - Generate master QR
- `GET /admin/settings` - System settings

### Customer Routes (`/`)
- `GET /` - Catalog (homepage)
- `GET /catalog` - Catalog with filters
- `GET /product/:sku` - Product detail page
- `GET /privacy-policy` - Privacy policy
- `GET /terms-conditions` - Terms & conditions

## 🤝 Contributing

This is a proprietary project by Renix Solutions. For contributions or inquiries, please contact the development team.

## 📄 License

Copyright © 2026 Renix Solutions. All rights reserved.

## 🆘 Support

For technical support or questions:
- Email: info@ratnaveda.com
- Documentation: See inline code comments

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Inventory alerts
- [ ] Export functionality
- [ ] API endpoints for mobile apps

---

**Built with ❤️ by Renix Solutions**

