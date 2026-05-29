-- Florería Seed Data (Datos de Prueba)

-- 1. CATEGORÍAS
INSERT INTO categories (name, description) VALUES
  ('Ramos', 'Ramos de flores variadas para todas las ocasiones'),
  ('Arreglos', 'Arreglos florales en recipientes especiales'),
  ('Coronas', 'Coronas y aros para despedidas y conmemoraciones'),
  ('Plantas', 'Plantas vivas y macetas decorativas'),
  ('Accesorios', 'Tarjetas, cintas, velas y otros complementos')
ON CONFLICT (name) DO NOTHING;

-- 2. PRODUCTOS (Ramos)
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, is_available) VALUES
  ('Ramo Clásico Rojo', 'Ramo de 12 rosas rojas frescas con follaje', 89.90,
   (SELECT id FROM categories WHERE name = 'Ramos'), 'https://via.placeholder.com/300?text=Ramo+Rojo', 15, true),

  ('Ramo Primaveral Mix', 'Combinación de tulipanes, margaritas y ranúnculos', 75.50,
   (SELECT id FROM categories WHERE name = 'Ramos'), 'https://via.placeholder.com/300?text=Ramo+Primavera', 20, true),

  ('Ramo Lujoso Blanco', 'Ramo premium con rosas blancas y lisianthus', 129.90,
   (SELECT id FROM categories WHERE name = 'Ramos'), 'https://via.placeholder.com/300?text=Ramo+Blanco', 8, true),

  ('Girasoles Vibrantes', 'Ramo de 10 girasoles frescos y alegres', 65.00,
   (SELECT id FROM categories WHERE name = 'Ramos'), 'https://via.placeholder.com/300?text=Girasoles', 12, true),

  ('Ramo Pastel Romántico', 'Rosas, peonías y eucalipto en tonos pastel', 99.90,
   (SELECT id FROM categories WHERE name = 'Ramos'), 'https://via.placeholder.com/300?text=Ramo+Pastel', 10, true);

-- 3. PRODUCTOS (Arreglos)
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, is_available) VALUES
  ('Arreglo Ejecutivo', 'Arreglo elegante en caja de diseño moderno', 145.00,
   (SELECT id FROM categories WHERE name = 'Arreglos'), 'https://via.placeholder.com/300?text=Arreglo+Ejecutivo', 6, true),

  ('Caja Floral Premium', 'Flores variadas en caja redonda de lujo', 189.90,
   (SELECT id FROM categories WHERE name = 'Arreglos'), 'https://via.placeholder.com/300?text=Caja+Floral', 5, true),

  ('Arreglo Jardinera', 'Combinación de flores en maceta cerámica', 110.00,
   (SELECT id FROM categories WHERE name = 'Arreglos'), 'https://via.placeholder.com/300?text=Jardinera', 8, true),

  ('Cesta Floral Tropical', 'Hibiscus, anthurium y flores tropicales', 125.50,
   (SELECT id FROM categories WHERE name = 'Arreglos'), 'https://via.placeholder.com/300?text=Tropical', 7, true);

-- 4. PRODUCTOS (Coronas)
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, is_available) VALUES
  ('Corona Mortuoria Estándar', 'Corona tradicional para despedidas', 95.00,
   (SELECT id FROM categories WHERE name = 'Coronas'), 'https://via.placeholder.com/300?text=Corona', 10, true),

  ('Corona Luto Premium', 'Corona elegante con flores blancas y doradas', 155.00,
   (SELECT id FROM categories WHERE name = 'Coronas'), 'https://via.placeholder.com/300?text=Corona+Luto', 4, true);

-- 5. PRODUCTOS (Plantas)
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, is_available) VALUES
  ('Orquídea Blanca', 'Orquídea en maceta con atención de floración', 85.00,
   (SELECT id FROM categories WHERE name = 'Plantas'), 'https://via.placeholder.com/300?text=Orquídea', 9, true),

  ('Palmera Areca', 'Palmera ornamental para interiores', 120.00,
   (SELECT id FROM categories WHERE name = 'Plantas'), 'https://via.placeholder.com/300?text=Palmera', 5, true),

  ('Cactus Decorativos', 'Conjunto de 3 cactus en macetas', 55.00,
   (SELECT id FROM categories WHERE name = 'Plantas'), 'https://via.placeholder.com/300?text=Cactus', 15, true);

-- 6. PRODUCTOS (Accesorios)
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, is_available) VALUES
  ('Tarjeta Personalizada Premium', 'Tarjeta de felicitación con diseño personalizado', 12.90,
   (SELECT id FROM categories WHERE name = 'Accesorios'), 'https://via.placeholder.com/300?text=Tarjeta', 50, true),

  ('Cinta Decorativa Satén', 'Cinta satén para envolver flores', 8.50,
   (SELECT id FROM categories WHERE name = 'Accesorios'), 'https://via.placeholder.com/300?text=Cinta', 100, true),

  ('Vela Aromática Deluxe', 'Vela perfumada de larga duración', 35.00,
   (SELECT id FROM categories WHERE name = 'Accesorios'), 'https://via.placeholder.com/300?text=Vela', 20, true);

-- 7. USUARIO ADMIN
INSERT INTO users (email, password_hash, first_name, last_name, phone, address, city, country, role, is_active)
VALUES ('admin@floreria.com', '$2a$10$YIjLDK0qZlE7bxd7P9F6y.0rXpT3x2mVhXdPV5W8N.TqE3A5RYX/O', 'Admin', 'Florería', '987654321', 'Av. Flores 123', 'Lima', 'Perú', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- 8. USUARIO DE PRUEBA (cliente)
INSERT INTO users (email, password_hash, first_name, last_name, phone, address, city, country, role, is_active)
VALUES ('cliente@example.com', '$2a$10$YIjLDK0qZlE7bxd7P9F6y.0rXpT3x2mVhXdPV5W8N.TqE3A5RYX/O', 'Juan', 'Cliente', '999888777', 'Av. Test 456', 'Lima', 'Perú', 'cliente', true)
ON CONFLICT (email) DO NOTHING;

-- 9. CUPONES
INSERT INTO coupons (code, description, discount_type, discount_value, max_usage_count, usage_count, is_active, created_at, updated_at)
VALUES
  ('BIENVENIDA10', 'Cupón de bienvenida con 10% descuento', 'percentage', 10.00, 100, 0, true, NOW(), NOW()),
  ('VERANO20', 'Descuento de verano 20%', 'percentage', 20.00, 50, 0, true, NOW(), NOW()),
  ('CLIENTE50', 'Descuento de S/50 para clientes leales', 'fixed', 50.00, 20, 0, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;
