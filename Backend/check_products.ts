import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      isActive: true,
      allowCredit: true,
    }
  });
  console.log('Total products:', products.length);
  console.log('Active products:', products.filter(p => p.isActive).length);
  console.log('Inactive products:', products.filter(p => !p.isActive).length);
  console.log('Credit enabled products:', products.filter(p => p.allowCredit).length);
  console.log('Sample products:', JSON.stringify(products.slice(0, 5), null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
