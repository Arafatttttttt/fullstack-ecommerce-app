# E-Commerce Full Stack Application

A modern, feature-rich e-commerce platform built with React, TypeScript, Node.js, Express, Prisma, and MySQL. This project demonstrates a complete full-stack application with user authentication, product management, shopping cart, orders, reviews, and payment integration.

## 🚀 Features

### User Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Product Browsing**: Browse products with search, filtering, and pagination
- **Shopping Cart**: Add/remove items, update quantities
- **Order Management**: Place orders, track status, cancel orders
- **Reviews & Ratings**: Write and view product reviews (only for delivered orders)
- **Profile Management**: View and manage user profile
- **Location Selection**: Auto-detect and select delivery address using OpenStreetMap
- **Smart Personalization**: 
  - Recently viewed products
  - Recommended products based on browsing history
  - Resume shopping from last session

### Admin Features
- **Product Management**: CRUD operations for products
- **Multiple Image Upload**: Upload multiple images per product
- **Order Management**: View and manage all orders

### Payment Options
- **Card Payment**: Stripe integration for secure card payments
- **Cash on Delivery (COD)**: Pay on delivery option
- **UPI Payment**: UPI ID validation and payment processing

### UI/UX
- **Modern Design**: Amazon-inspired UI with modern design system
- **Responsive Layout**: Mobile-first responsive design
- **Skeleton Loaders**: Smooth loading states with skeleton loaders
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Dark Navbar**: Professional navigation bar
- **Card-based Layout**: Modern card-based UI components

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Vite** as build tool
- **Leaflet** for map integration (OpenStreetMap)

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **MySQL** database
- **JWT** for authentication
- **Multer** for file uploads
- **Stripe** for payment processing
- **Bcrypt** for password hashing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**
- **Git**

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "full stack prj"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in the backend directory with the following:
```

Create `backend/.env`:
```env
DATABASE_URL="mysql://username:password@localhost:3306/ecommerce_db"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
PORT=5000
STRIPE_SECRET_KEY="your-stripe-secret-key"
FRONTEND_URL="http://localhost:5173"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
# npx prisma db seed
```

**Note**: Make sure MySQL is running and create a database named `ecommerce_db` (or update the DATABASE_URL in `.env`).

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in the frontend directory:
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start Frontend Server

```bash
cd frontend
npm run dev
```

The frontend application will run on `http://localhost:5173`

## 📁 Project Structure

```
full stack prj/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files (database, env)
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware (auth, error handling)
│   │   ├── routes/          # API routes
│   │   ├── server.ts        # Express server setup
│   │   └── utils/           # Utility functions (JWT, validation)
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   ├── uploads/             # Uploaded images
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── layout/      # Layout components (Navbar, Footer)
│   │   │   └── skeletons/   # Skeleton loaders
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store and slices
│   │   ├── services/        # API service functions
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── hooks/           # Custom React hooks
│   ├── public/              # Static assets
│   └── package.json
│
└── README.md
```

## 🔐 Default Admin Account

To create an admin account, you can either:
1. Use the registration endpoint and manually update the database to set `role: 'admin'`
2. Use Prisma Studio: `npx prisma studio` and create a user with `role: 'admin'`

## 🎨 Design System

The application follows a consistent design system:
- **Primary Color**: Orange (#f97316)
- **Status Colors**: Green (success), Red (error), Yellow (warning), Blue (info)
- **Typography**: Consistent font sizes and weights
- **Spacing**: 4px base spacing scale
- **Components**: Reusable card, button, badge components

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove cart item

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/cancel` - Cancel order

### Reviews
- `GET /api/products/:id/reviews` - Get product reviews
- `POST /api/products/:id/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## 🧪 Testing

```bash
# Backend tests (if available)
cd backend
npm test

# Frontend tests (if available)
cd frontend
npm test
```

## 🚢 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the TypeScript code: `npm run build`
3. Start the server: `npm start`
4. Ensure MySQL database is accessible

### Frontend Deployment
1. Set production API URL in `.env`
2. Build the project: `npm run build`
3. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

## 📄 License



## 👤 Author

Mynzhassar Arafat

## 🙏 Acknowledgments

- Design inspiration from Amazon
- OpenStreetMap for free map services
- Tailwind CSS for utility-first styling
- Prisma for excellent ORM experience

