import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to fix products...');
  
  // 1. Make all products active
  const result = await prisma.product.updateMany({
    data: {
      isActive: true
    }
  });
  
  console.log(`Updated ${result.count} products to be active.`);
  
  // 2. Fetch all products to verify
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      isActive: true,
      allowCredit: true
    }
  });
  
  console.log('Summary:');
  console.log(`Total Products: ${products.length}`);
  console.log(`Active Products: ${products.filter(p => p.isActive).length}`);
  console.log(`Products with Credit: ${products.filter(p => p.allowCredit).length}`);
}

main()
  .catch((e) => {
    console.error('Error fixing products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
