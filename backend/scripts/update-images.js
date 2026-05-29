const pool = require('../src/config/database');

// Mapping de productos a keywords de Unsplash
const imageMap = {
  'Ramo Clásico Rojo': 'red roses bouquet',
  'Ramo Primaveral Mix': 'spring flowers bouquet',
  'Ramo Lujoso Blanco': 'white flowers bouquet',
  'Girasoles Vibrantes': 'sunflowers bright',
  'Ramo Pastel Romántico': 'pink roses romantic',
  'Corona Mortuoria Estándar': 'funeral wreath flowers',
  'Corona Luto Premium': 'funeral flowers arrangement',
  'Arreglo Ejecutivo': 'professional flower arrangement',
  'Caja Floral Premium': 'luxury flower box',
  'Arreglo Jardinera': 'garden flower arrangement',
  'Cesta Floral Tropical': 'tropical flowers basket',
  'Palmera Areca': 'areca palm plant',
  'Orquídea Blanca': 'white orchid plant',
  'Cactus Decorativos': 'decorative cactus plant',
  'Tarjeta Personalizada Premium': 'greeting card luxury',
  'Cinta Decorativa Satén': 'decorative satin ribbon',
  'Vela Aromática Deluxe': 'luxury scented candle',
};

// Generar URL de Unsplash basada en keyword
function getUnsplashUrl(keyword) {
  const baseUrl = 'https://images.unsplash.com/';

  // URLs de imágenes específicas de alta calidad de Unsplash
  const images = {
    'red roses bouquet': 'photo-1567048871567-a1d016f58178?w=400&h=300&fit=crop',
    'spring flowers bouquet': 'photo-1562181286-d3fee7d55364?w=400&h=300&fit=crop',
    'white flowers bouquet': 'photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
    'sunflowers bright': 'photo-1597848212624-11f949a147e0?w=400&h=300&fit=crop',
    'pink roses romantic': 'photo-1520763185298-1b434c919abe?w=400&h=300&fit=crop',
    'funeral wreath flowers': 'photo-1578241267123-49cf17c91b7b?w=400&h=300&fit=crop',
    'funeral flowers arrangement': 'photo-1590147323169-a0e5dc92e4af?w=400&h=300&fit=crop',
    'professional flower arrangement': 'photo-1585597880707-dd6a9a3d5f48?w=400&h=300&fit=crop',
    'luxury flower box': 'photo-1561181286-d3fee7d55364?w=400&h=300&fit=crop',
    'garden flower arrangement': 'photo-1522871913253-cf00d2e4357c?w=400&h=300&fit=crop',
    'tropical flowers basket': 'photo-1519046904884-53103b34b206?w=400&h=300&fit=crop',
    'areca palm plant': 'photo-1518895949257-7621c3c786d7?w=400&h=300&fit=crop',
    'white orchid plant': 'photo-1585409677175-789a7167b1fa?w=400&h=300&fit=crop',
    'decorative cactus plant': 'photo-1568654881506-450ea2583dc0?w=400&h=300&fit=crop',
    'greeting card luxury': 'photo-1614707267537-b85faf00021b?w=400&h=300&fit=crop',
    'decorative satin ribbon': 'photo-1552333864-b9ed62a7ba90?w=400&h=300&fit=crop',
    'luxury scented candle': 'photo-1600705323622-961bb2c15ac0?w=400&h=300&fit=crop',
  };

  return baseUrl + (images[keyword] || 'photo-1505618346881-b72b27e84530?w=400&h=300&fit=crop');
}

async function updateProductImages() {
  try {
    console.log('🔄 Iniciando actualización de imágenes de productos...\n');

    let updatedCount = 0;
    let skipCount = 0;

    for (const [productName, keyword] of Object.entries(imageMap)) {
      const imageUrl = getUnsplashUrl(keyword);

      // Actualizar productos por nombre
      const result = await pool.query(
        'UPDATE products SET image_url = $1 WHERE name = $2 RETURNING id, name',
        [imageUrl, productName]
      );

      if (result.rows.length > 0) {
        updatedCount += result.rows.length;
        console.log(`✅ ${productName}`);
        console.log(`   URL: ${imageUrl}`);
      } else {
        console.log(`⚠️  ${productName} - No encontrado en BD`);
        skipCount++;
      }
    }

    console.log(`\n✨ Actualización completada:`);
    console.log(`   ✅ Productos actualizados: ${updatedCount}`);
    console.log(`   ⚠️  Saltados: ${skipCount}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante la actualización:', err);
    process.exit(1);
  }
}

updateProductImages();
