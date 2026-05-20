const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- DEBUG: Google Pixel 6 Stock Status ---');
    const products = await prisma.product.findMany({
      where: { name: { contains: 'Google Pixel 6', mode: 'insensitive' } },
      include: { 
        inventory: true, 
        variants: true 
      }
    });
    
    if (products.length === 0) {
      console.log('No products found matching "Google Pixel 6"');
      return;
    }

    console.log(`Found ${products.length} matching products:`);
    products.forEach((p, i) => {
      console.log(`\nProduct ${i + 1}: ${p.name} (ID: ${p.id})`);
      console.log(`- Base Stock: ${p.inventory?.stock ?? 'N/A'}`);
      console.log(`- Allow Backorder: ${p.inventory?.allowBackorder ?? 'N/A'}`);
      console.log(`- Variants (${p.variants.length}):`);
      p.variants.forEach(v => {
        console.log(`  * ${v.name}: ${v.value} (Stock: ${v.stock}) (ID: ${v.id})`);
      });
    });
    console.log('\n--- END DEBUG ---');
  } catch (error) {
    console.error('Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
