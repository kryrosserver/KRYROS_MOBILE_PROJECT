import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const p = await prisma.product.findFirst({
    where: { name: { contains: 'Google Pixel 6', mode: 'insensitive' } },
    include: { inventory: true, variants: true }
  });
  console.log(JSON.stringify(p, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
