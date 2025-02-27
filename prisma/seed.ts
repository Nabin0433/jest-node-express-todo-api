import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.task.createMany({
    data: [
      {
        title: 'Learn Next.js',
        color: '#FF3B30',
        completed: false,
      },
      {
        title: 'Build Todo App',
        color: '#34C759',
        completed: true,
      },
      {
        title: 'Read a book',
        color: '#007AFF',
        completed: false,
      },
    ],
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
