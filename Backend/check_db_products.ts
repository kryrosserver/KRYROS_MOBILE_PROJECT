
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
  });
  console.log('Total products:', products.length);
  products.forEach(p => {
    console.log(`- ${p.name} (ID: ${p.id}, Active: ${p.isActive}, Category: ${p.category.name}, Slug: ${p.slug})`);
  });

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
  console.log('\nCategories:');
  categories.forEach(c => {
    console.log(`- ${c.name} (ID: ${c.id}, Slug: ${c.slug}, Products: ${c._count.products})`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
