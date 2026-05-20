import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const p = await prisma.product.findFirst({
    where: { name: { contains: 'Google Pixel 6', mode: 'insensitive' } },
    include: { inventory: true, variants: true }
  });
  
  if (!p) {
    console.log('Product not found');
    return;
  }

  console.log('Current State:');
  console.log(JSON.stringify(p, null, 2));

  // If inventory is missing or stock is 0, let's update it so the user can test the checkout
  if (!p.inventory || p.inventory.stock <= 0) {
    console.log('\nUpdating stock to 100 for testing...');
    await prisma.inventory.upsert({
      where: { productId: p.id },
      update: { stock: 100 },
      create: { productId: p.id, stock: 100 }
    });
    console.log('Stock updated successfully');
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
