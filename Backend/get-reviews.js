const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.review.findMany({ include: { product: true, user: true } })
  .then(r => console.log(JSON.stringify(r, null, 2)))
  .finally(() => p.$disconnect());