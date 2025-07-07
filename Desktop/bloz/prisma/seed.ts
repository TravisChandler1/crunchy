import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: 'Ripe Plantain Chips',
        description: 'Sweet, golden, and perfectly crunchy. Made from ripe plantains for a naturally sweet snack. Enjoy the authentic taste of Nigeria in every bite!',
        image: '/ripe-plantain.jpeg',
        price: '₦4,500',
        available: true,
      },
      {
        name: 'Unripe Plantain Chips',
        description: 'Savory, green, and extra crispy. Made from unripe plantains for a classic, hearty crunch. Perfect for those who love a less sweet, more traditional flavor!',
        image: '/unripe-plantain.jpeg',
        price: '₦4,500',
        available: true,
      },
    ],
    skipDuplicates: true,
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