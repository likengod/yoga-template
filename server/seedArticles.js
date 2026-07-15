require('dotenv').config({ override: true });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding articles...');
  const articlesPath = path.join(__dirname, 'articlesFallback.json');
  if (!fs.existsSync(articlesPath)) {
    console.error('articlesFallback.json not found!');
    process.exit(1);
  }

  const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
  for (let i = 0; i < articles.length; i++) {
    const art = articles[i];
    await prisma.article.create({
      data: {
        id: art.id || `seed-article-00${i + 1}`,
        title: art.title,
        content: art.content,
        author: art.author,
        category: art.category || 'General',
        excerpt: art.excerpt || '',
        image_url: art.image_url || null,
        published: true,
        featured: i < 3, // make first 3 articles featured
        views: Math.floor(10 + Math.random() * 90)
      }
    });
  }
  console.log('Articles seeded successfully!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
