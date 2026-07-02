import { PrismaClient } from '@prisma/client';
import { SEED_ARTICLES } from '../src/utils/seedData';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 15 Indian Yoga articles to MySQL...');
  let count = 0;
  for (const article of SEED_ARTICLES) {
    try {
      await prisma.article.create({
        data: article
      });
      count++;
    } catch (e) {
      console.error('Failed to insert article:', article.title, e);
    }
  }
  console.log(`Successfully seeded ${count} articles.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
