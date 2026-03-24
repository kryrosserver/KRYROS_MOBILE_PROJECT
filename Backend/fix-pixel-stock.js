const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const p = await prisma.product.findFirst({
      where: { name: { contains: 'Google Pixel 6', mode: 'insensitive' } },
      include: { inventory: true }
    });
    
    if (!p) {
      console.log('Product not found');
      return;
    }

    console.log('Current State:', JSON.stringify(p, null, 2));

    if (!p.inventory || p.inventory.stock <= 0) {
      console.log('\nUpdating stock to 100 for testing...');
      await prisma.inventory.upsert({
        where: { productId: p.id },
        update: { stock: 100 },
        create: { productId: p.id, stock: 100 }
      });
      console.log('Stock updated successfully');
    } else {
      console.log('\nStock is already positive:', p.inventory.stock);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
