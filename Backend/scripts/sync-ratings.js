const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Syncing all product ratings...');
  
  // Get all products
  const products = await prisma.product.findMany({
    select: { id: true }
  });

  console.log(`Found ${products.length} products to check.`);

  let updatedCount = 0;
  for (const product of products) {
    const aggregate = await prisma.review.aggregate({
      where: { productId: product.id, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = aggregate._avg.rating || 0;
    const totalReviews = aggregate._count.rating || 0;

    await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: averageRating,
        reviewCount: totalReviews,
      },
    });

    if (totalReviews > 0) {
      updatedCount++;
      console.log(`Updated product ${product.id} -> Rating: ${averageRating}, Count: ${totalReviews}`);
    }
  }

  console.log(`Sync complete. Updated ${updatedCount} products with active reviews.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
