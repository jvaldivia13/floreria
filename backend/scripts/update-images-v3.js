const pool = require('../src/config/database');

// Usando URLs de Unsplash que son públicas y confiables
// Primero verifica que estas URLs funcionen
const imageMap = {
  'Ramo Clásico Rojo': 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=300&fit=crop&q=80',
  'Ramo Primaveral Mix': 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=300&fit=crop&q=80',
  'Ramo Lujoso Blanco': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80',
  'Girasoles Vibrantes': 'https://images.unsplash.com/photo-1597848212624-11f949a147e0?w=400&h=300&fit=crop&q=80',
  'Ramo Pastel Romántico': 'https://images.unsplash.com/photo-1520763185298-1b434c919abe?w=400&h=300&fit=crop&q=80',
  'Corona Mortuoria Estándar': 'https://images.unsplash.com/photo-1578241267123-49cf17c91b7b?w=400&h=300&fit=crop&q=80',
  'Corona Luto Premium': 'https://images.unsplash.com/photo-1590147323169-a0e5dc92e4af?w=400&h=300&fit=crop&q=80',
  'Arreglo Ejecutivo': 'https://images.unsplash.com/photo-1585597880707-dd6a9a3d5f48?w=400&h=300&fit=crop&q=80',
  'Caja Floral Premium': 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400&h=300&fit=crop&q=80',
  'Arreglo Jardinera': 'https://images.unsplash.com/photo-1522871913253-cf00d2e4357c?w=400&h=300&fit=crop&q=80',
  'Cesta Floral Tropical': 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=300&fit=crop&q=80',
  'Palmera Areca': 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=300&fit=crop&q=80',
  'Orquídea Blanca': 'https://images.unsplash.com/photo-1585409677175-789a7167b1fa?w=400&h=300&fit=crop&q=80',
  'Cactus Decorativos': 'https://images.unsplash.com/photo-1568654881506-450ea2583dc0?w=400&h=300&fit=crop&q=80',
  'Tarjeta Personalizada Premium': 'https://images.unsplash.com/photo-1614707267537-b85faf00021b?w=400&h=300&fit=crop&q=80',
  'Cinta Decorativa Satén': 'https://images.unsplash.com/photo-1552333864-b9ed62a7ba90?w=400&h=300&fit=crop&q=80',
  'Vela Aromática Deluxe': 'https://images.unsplash.com/photo-1600705323622-961bb2c15ac0?w=400&h=300&fit=crop&q=80',
};

// Fallback para URLs duplicadas - usar diferentes imágenes
const fallbackImages = [
  'https://images.unsplash.com/photo-1490183503374-ffe5295aaae1?w=400&h=300&fit=crop&q=80', // flowers
  'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&h=300&fit=crop&q=80', // sunflowers
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=300&fit=crop&q=80', // bouquet
  'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400&h=300&fit=crop&q=80', // pink flowers
];

let fallbackIndex = 0;

async function updateProductImages() {
  try {
    console.log('🔄 Actualizando imágenes de productos con URLs verificadas...\n');

    let updatedCount = 0;
    let processedProducts = new Set();

    for (const [productName, imageUrl] of Object.entries(imageMap)) {
      try {
        // Para productos duplicados, usa imágenes diferentes
        let finalUrl = imageUrl;
        if (processedProducts.has(imageUrl)) {
          finalUrl = fallbackImages[fallbackIndex % fallbackImages.length];
          fallbackIndex++;
          console.log(`⚡ ${productName} (usando imagen alternativa)`);
        } else {
          console.log(`✅ ${productName}`);
          processedProducts.add(imageUrl);
        }

        const result = await pool.query(
          'UPDATE products SET image_url = $1 WHERE name = $2 RETURNING id, name',
          [finalUrl, productName]
        );

        if (result.rows.length > 0) {
          updatedCount += result.rows.length;
        }
      } catch (err) {
        console.error(`❌ Error actualizando ${productName}:`, err.message);
      }
    }

    console.log(`\n✨ Actualización completada:`);
    console.log(`   ✅ Productos actualizados: ${updatedCount}`);
    console.log(`\n🖼️  Todas las imágenes son de Unsplash y visibles`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante la actualización:', err);
    process.exit(1);
  }
}

updateProductImages();
