#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'floreria_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

async function seedData() {
  const client = await pool.connect();

  try {
    console.log('Seeding database with sample data...');

    // Insert categories
    await client.query(`
      INSERT INTO categories (name, description) VALUES
      ('Rosas', 'Hermosas rosas de colores variados'),
      ('Tulipanes', 'Tulipanes frescos y elegantes'),
      ('Arreglos', 'Arreglos florales especiales'),
      ('Complementos', 'Tarjetas, lazos y regalos')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✓ Categories inserted');

    // Insert products with images
    await client.query(`
      INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, is_available) VALUES
      ('Rosa Roja Premium', 'Docena de rosas rojas de calidad premium', 99.99, 1, 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&h=500&fit=crop', 50, true),
      ('Rosa Blanca Elegante', 'Docena de rosas blancas perfectas para bodas', 89.99, 1, 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=500&h=500&fit=crop', 40, true),
      ('Tulipán Multicolor', 'Mezcla de tulipanes en varios colores', 79.99, 2, 'https://images.unsplash.com/photo-1520763217646-be87aeb24082?w=500&h=500&fit=crop', 35, true),
      ('Arreglo Romántico', 'Arreglo especial con rosas y lirios', 149.99, 3, 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500&h=500&fit=crop', 20, true),
      ('Arreglo de Cumpleaños', 'Colorido arreglo para celebraciones', 119.99, 3, 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500&h=500&fit=crop', 25, true),
      ('Tarjeta de Felicitación', 'Tarjeta elegante para acompañar regalos', 12.99, 4, 'https://images.unsplash.com/photo-1565447666747-69f6646db940?w=500&h=500&fit=crop', 100, true),
      ('Lazo Satinado', 'Lazo de seda para decorar arreglos', 9.99, 4, 'https://images.unsplash.com/photo-1599908056357-5b0e88fbda2d?w=500&h=500&fit=crop', 150, true),
      ('Jarrón Decorativo', 'Jarrón de vidrio para flores', 34.99, 4, 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=500&h=500&fit=crop', 30, true)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✓ Products inserted');

    console.log('\n✅ Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedData();
