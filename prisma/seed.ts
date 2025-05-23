import bcrypt from 'bcrypt';
import { PrismaClient } from './generated';

const prisma = new PrismaClient();

async function main() {
  // Hash password for all users
  const password = await bcrypt.hash('12345678', 10);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      password,
      email: 'admin@gmail.com',
      emailVerifiedAt: new Date(),
      role: 'ADMIN',
      acceptedTOS: true,
      verified: true,
      image:
        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    },
  });

  const reporter = await prisma.user.create({
    data: {
      name: 'Reporter',
      password,
      email: 'reporter@gmail.com',
      emailVerifiedAt: new Date(),
      role: 'REPORTER',
      acceptedTOS: true,
      verified: true,
      image:
        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    },
  });

  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: `User ${i}`,
        password,
        email: `user-${i}@gmail.com`,
        emailVerifiedAt: new Date(),
        role: 'READER',
        acceptedTOS: true,
        verified: true,
        image:
          'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
      },
    });
    users.push(user);
  }

  // Create Categories
  const categoryData = [
    { name: 'Technology', slug: 'technology', description: 'All about tech' },
    { name: 'Health', slug: 'health', description: 'Healthcare topics' },
    { name: 'Finance', slug: 'finance', description: 'Finance and business' },
  ];

  await prisma.category.createMany({
    data: categoryData,
  });

  const categories = await prisma.category.findMany();

  // Create Tags
  const tagData = [
    { name: 'JavaScript', slug: 'javascript' },
    { name: 'Wellness', slug: 'wellness' },
    { name: 'Startup', slug: 'startup' },
  ];

  await prisma.tag.createMany({
    data: tagData,
  });

  const tags = await prisma.tag.findMany();

  // Create Articles
  for (let i = 0; i < 20; i++) {
    const article = await prisma.article.create({
      data: {
        title: `Article ${i}`,
        slug: `article-${i}`,
        content: `<p>Content of article ${i}</p><h1>Article ${i}</h1>`,
        status: 'PUBLISHED',
        image: 'https://dummyimage.com/600x400/000/fff',
        publishedAt: new Date(),
        author: {
          connect: { id: admin.id },
        },
        category: {
          connect: { id: categories[i % categories.length].id },
        },
      },
    });

    // Assign 1-2 tags per article
    const assignedTags = [tags[i % tags.length], tags[(i + 1) % tags.length]];
    for (const tag of assignedTags) {
      await prisma.articleTag.create({
        data: {
          articleId: article.id,
          tagId: tag.id,
        },
      });
    }

    // Generate random likes and comments
    const likedBy = users.filter((_, idx) => (idx % (i + 1)) % 3 === 0);
    for (const user of likedBy) {
      await prisma.like.create({
        data: {
          userId: user.id,
          articleId: article.id,
        },
      });

      await prisma.comment.create({
        data: {
          content: `Nice article ${i}!`,
          userId: user.id,
          articleId: article.id,
        },
      });
    }
  }
  console.log('✅ Seed completed.');
  console.log({
    admin,
    reporter,
    users,
    categories,
    tags,
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
