# Database Setup Guide

This document describes how to set up the PostgreSQL database for the Florería Tulipanes application.

## Prerequisites

- PostgreSQL 12+ installed and running
- Node.js installed
- Environment variables configured in `.env` file

## Environment Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=floreria_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
```

Adjust these values according to your PostgreSQL installation.

## Setup Steps

### 1. Create the Database

First, create the PostgreSQL database manually:

```bash
createdb floreria_db
```

Or using psql:

```bash
psql -U postgres -c "CREATE DATABASE floreria_db;"
```

### 2. Initialize the Schema

Run the initialization script to create all tables, indexes, and constraints:

```bash
node scripts/init-db.js
```

This script will:
- Read the SQL schema from `scripts/init-db.sql`
- Create all 9 tables with proper constraints and foreign keys
- Create all necessary indexes for performance
- Display success confirmation

### 3. Verify the Setup

You can verify the setup by connecting to the database and listing tables:

```bash
psql -U postgres -d floreria_db -c "\dt"
```

You should see the following tables:
- categories
- users
- products
- cart_items
- orders
- order_items
- reviews
- coupons
- wishlist

## Database Schema Overview

### Categories
- Stores product categories (e.g., "Arreglos", "Complementos")
- Fields: id, name, description, created_at, updated_at

### Users
- Stores user information with roles (cliente/admin)
- Fields: id, email, password_hash, first_name, last_name, phone, address, city, postal_code, country, role, is_active, created_at, updated_at

### Products
- Stores product information
- Fields: id, name, description, price, category_id, image_url, stock_quantity, is_available, created_at, updated_at

### Cart Items
- Stores items in user shopping carts (temporary)
- Fields: id, user_id, product_id, quantity, added_at

### Orders
- Stores customer orders with status tracking
- Status values: pendiente, procesando, enviado, entregado
- Fields: id, user_id, order_number, total_amount, status, shipping_address, shipping_city, shipping_postal_code, shipping_country, notes, created_at, updated_at

### Order Items
- Stores individual items in each order
- Fields: id, order_id, product_id, quantity, unit_price, subtotal

### Reviews
- Stores product reviews with 1-5 star ratings
- Fields: id, product_id, user_id, rating, title, comment, is_verified_purchase, helpful_count, created_at, updated_at

### Coupons
- Stores coupon codes with usage limits and expiration dates
- Discount types: percentage, fixed
- Fields: id, code, description, discount_type, discount_value, min_order_amount, max_usage_count, usage_count, max_per_user, is_active, start_date, end_date, created_at, updated_at

### Wishlist
- Stores user wishlists
- Fields: id, user_id, product_id, added_at

## Indexes

The schema includes strategic indexes for optimal query performance:
- Email and role lookups on users
- Category and availability lookups on products
- User and status lookups on orders
- Product lookups on reviews and wishlist items
- Coupon code lookups

## Connection Testing

When the application starts, it will automatically test the database connection. If the connection fails, the application will exit with an error message.

## Resetting the Database

To reset the database completely:

```bash
# Drop the existing database
dropdb floreria_db

# Create a new one
createdb floreria_db

# Reinitialize the schema
node scripts/init-db.js
```

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running: `pg_isready`
- Check host, port, and credentials in `.env`

### Database Does Not Exist
- Create the database using `createdb floreria_db`

### Permission Denied
- Check PostgreSQL user permissions
- Ensure the user specified in `.env` has the correct privileges

### Tables Already Exist
- The schema creation will fail if tables already exist
- Drop the database and recreate it using the steps above

## Notes

- All password fields are stored as hashes (bcrypt recommended in implementation)
- Timestamps use PostgreSQL's `CURRENT_TIMESTAMP` for consistency
- Foreign key constraints prevent data integrity issues
- All monetary values use DECIMAL(10, 2) for accuracy
- Stock quantities and ratings are constrained to valid ranges
