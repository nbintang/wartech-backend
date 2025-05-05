import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('12345678', 10);
  const totalUsers = 10;
  const totalArticles = 20;
  const users = [];
  const articles = [];

  const admin = await prisma.user.create({
    data: {
      name: `Admin`,
      password,
      email: `admin@gmail.com`,
      emailVerifiedAt: new Date(),
      role: 'ADMIN',
      acceptedTOS: true,
      image:
        'https://www.gravatar.cbom/avatar/00000000000000000000000000000000?d=mp&f=y',
    },
  });
  const reporter = await prisma.user.create({
    data: {
      name: `Reporter`,
      password,
      email: `reporter@gmail.com`,
      emailVerifiedAt: new Date(),
      role: 'REPORTER',
      acceptedTOS: true,
      image:
        'https://www.gravatar.cbom/avatar/00000000000000000000000000000000?d=mp&f=y',
    },
  });
  for (let i = 0; i < totalUsers; i++) {
    const user = await prisma.user.create({
      data: {
        name: `User ${i}`,
        password,
        email: `user-${i}@gmail.com`,
        emailVerifiedAt: new Date(),
        role: 'READER',
        acceptedTOS: true,
        image:
          'https://www.gravatar.cbom/avatar/00000000000000000000000000000000?d=mp&f=y',
      },
    });
    users.push(user);
  }

  const newCategoeries = await prisma.category.createMany({
    data: [
      { name: 'Technology', description: 'All about tech' },
      { name: 'Health', description: 'Healthcare topics' },
    ],
  });
  const categories = await prisma.category.findMany();

  if (categories.length > 0) {
    for (let i = 0; i < totalArticles; i++) {
      const article = await prisma.article.create({
        data: {
          title: `Article ${i}`,
          slug: `article-${i}`,
          content: `<p>Content of article ${i}</p></br><h1>Article ${i}</h1>`,
          status: 'PUBLISHED',
          image: 'https://dummyimage.com/600x400/000/fff',
          publishedAt: new Date(),
          author: { connect: { id: admin.id } },
          category: { connect: { id: categories[0].id } },
        },
      });
      articles.push(article);
    }
  }

  console.log('User created:', users);
  console.log('Admin created:', admin);
  console.log('Reporter created:', reporter);
  console.log('Categories created:', newCategoeries);
  console.log('Articles created:', articles);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
