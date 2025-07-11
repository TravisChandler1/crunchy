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

  // Seed example orders
  await prisma.order.createMany({
    data: [
      {
        customer: 'Adebanjo Temiloluwa',
        phone: '+2348012345678',
        items: JSON.stringify([
          { name: 'Ripe Plantain Chips', quantity: 2, price: '₦4,500' }
        ]),
        status: 'pending',
        date: new Date('2024-06-01T10:00:00Z'),
      },
      {
        customer: 'Victor Olabanji',
        phone: '+2348012345679',
        items: JSON.stringify([
          { name: 'Unripe Plantain Chips', quantity: 1, price: '₦4,500' }
        ]),
        status: 'fulfilled',
        date: new Date('2024-06-02T12:00:00Z'),
      },
      {
        customer: 'Mrs. Oladele',
        phone: '+2348012345680',
        items: JSON.stringify([
          { name: 'Ripe Plantain Chips', quantity: 3, price: '₦4,500' }
        ]),
        status: 'pending',
        date: new Date('2024-06-03T14:00:00Z'),
      },
    ],
    skipDuplicates: true,
  });

  // Seed example messages
  await prisma.message.createMany({
    data: [
      {
        name: 'Ada O.',
        email: 'ada@example.com',
        message: 'Love your chips!',
        date: new Date('2024-06-01T09:00:00Z'),
      },
      {
        name: 'Victor Olabanji',
        email: 'victor@example.com',
        message: 'How do I become a distributor?',
        date: new Date('2024-06-02T11:00:00Z'),
      },
    ],
    skipDuplicates: true,
  });

  // Seed example testimonials
  await prisma.testimonial.createMany({
    data: [
      {
        name: 'Adebanjo Temiloluwa',
        text: "Crunchy Cruise Snacks are the best plantain chips I've ever tasted! Perfect crunch, perfect flavor.",
        date: new Date('2024-06-01T08:00:00Z'),
      },
      {
        name: 'Victor Olabanji',
        text: "I love both the ripe and unripe chips. The motto says it all: as you dey crunch, just dey cruise!",
        date: new Date('2024-06-02T10:00:00Z'),
      },
      {
        name: 'Mrs. Oladele',
        text: "My kids can't get enough. Always fresh and delicious!",
        date: new Date('2024-06-03T12:00:00Z'),
      },
    ],
    skipDuplicates: true,
  });

  // Seed settings (if not exists)
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, orderingEnabled: true },
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