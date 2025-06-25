// prisma/seed.ts
import { PrismaClient, ArticleStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt'; // Pastikan kamu sudah menginstal bcryptjs atau bcrypt: npm install bcryptjs

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding...');

  // --- 0. Hapus data lama (Opsional, tapi direkomendasikan untuk pengembangan) ---
  console.log('Menghapus data lama...');
  try {
    // Urutan penghapusan penting karena adanya foreign key constraints
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.articleTag.deleteMany();
    await prisma.article.deleteMany();
    await prisma.category.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.user.deleteMany();
    console.log('Data lama berhasil dihapus.');
  } catch (error) {
    console.error('Gagal menghapus data lama:', error);
    // Lanjutkan saja jika ada error penghapusan, mungkin tabel kosong
  }

  // --- 1. Buat Data Pengguna (User) ---
  console.log('Membuat pengguna...');
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordReporter = await bcrypt.hash('reporter123', 10);
  const hashedPasswordReader = await bcrypt.hash('reader123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPasswordAdmin,
      role: UserRole.ADMIN,
      verified: true,
      emailVerifiedAt: new Date(),
      acceptedTOS: true,
      image: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Admin',
    },
  });

  const reporterUser = await prisma.user.create({
    data: {
      name: 'Reporter User',
      email: 'reporter@example.com',
      password: hashedPasswordReporter,
      role: UserRole.REPORTER,
      verified: true,
      emailVerifiedAt: new Date(),
      acceptedTOS: true,
      image: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Reporter',
    },
  });

  const readerUser = await prisma.user.create({
    data: {
      name: 'Reader User',
      email: 'reader@example.com',
      password: hashedPasswordReader,
      role: UserRole.READER,
      verified: true,
      emailVerifiedAt: new Date(),
      acceptedTOS: true,
      image: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Reader',
    },
  });
  console.log('Pengguna berhasil dibuat.');

  // --- 2. Buat Data Kategori (Category) ---
  console.log('Membuat kategori...');
  const technologyCategory = await prisma.category.create({
    data: {
      name: 'Technology',
      slug: 'technology',
      description: 'Latest news and updates in technology.',
    },
  });

  const programmingCategory = await prisma.category.create({
    data: {
      name: 'Programming',
      slug: 'programming',
      description: 'Articles about various programming languages and concepts.',
    },
  });

  const lifestyleCategory = await prisma.category.create({
    data: {
      name: 'Lifestyle',
      slug: 'lifestyle',
      description: 'Tips and insights for a better lifestyle.',
    },
  });
  console.log('Kategori berhasil dibuat.');

  // --- 3. Buat Data Tag (Tag) ---
  console.log('Membuat tag...');
  const javascriptTag = await prisma.tag.create({
    data: { name: 'JavaScript', slug: 'javascript' },
  });
  const reactTag = await prisma.tag.create({
    data: { name: 'React', slug: 'react' },
  });
  const nestjsTag = await prisma.tag.create({
    data: { name: 'NestJS', slug: 'nestjs' },
  });
  const webdevTag = await prisma.tag.create({
    data: { name: 'Web Development', slug: 'web-development' },
  });
  const healthTag = await prisma.tag.create({
    data: { name: 'Health', slug: 'health' },
  });
  console.log('Tag berhasil dibuat.');

  // --- 4. Buat Data Artikel (Article) ---
  console.log('Membuat artikel...');
  const article1 = await prisma.article.create({
    data: {
      title: 'Getting Started with NestJS',
      slug: 'getting-started-with-nestjs',
      content:
        'NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications.',
      image:
        'https://via.placeholder.com/800x400/FF0000/FFFFFF?text=NestJS+Intro',
      authorId: reporterUser.id,
      categoryId: programmingCategory.id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      articleTags: {
        create: [
          { tagId: nestjsTag.id },
          { tagId: javascriptTag.id },
          { tagId: webdevTag.id },
        ],
      },
    },
  });

  const article2 = await prisma.article.create({
    data: {
      title: 'The Future of Web Development with React',
      slug: 'future-of-web-dev-react',
      content:
        'React continues to evolve, bringing new features and better performance for web applications.',
      image:
        'https://via.placeholder.com/800x400/0000FF/FFFFFF?text=React+Future',
      authorId: reporterUser.id,
      categoryId: technologyCategory.id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days ago
      articleTags: {
        create: [
          { tagId: reactTag.id },
          { tagId: javascriptTag.id },
          { tagId: webdevTag.id },
        ],
      },
    },
  });

  const article3 = await prisma.article.create({
    data: {
      title: 'Healthy Habits for Programmers',
      slug: 'healthy-habits-for-programmers',
      content:
        'Maintaining good health is crucial for programmers to sustain productivity and well-being.',
      image:
        'https://via.placeholder.com/800x400/00FF00/000000?text=Healthy+Habits',
      authorId: adminUser.id,
      categoryId: lifestyleCategory.id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(new Date().setDate(new Date().getDate() - 10)), // 10 days ago
      articleTags: {
        create: [{ tagId: healthTag.id }],
      },
    },
  });

  const draftArticle = await prisma.article.create({
    data: {
      title: 'Upcoming Features in Prisma',
      slug: 'upcoming-features-prisma',
      content: "A sneak peek into what's next for Prisma ORM.",
      image:
        'https://via.placeholder.com/800x400/FFFF00/000000?text=Prisma+Draft',
      authorId: reporterUser.id,
      categoryId: programmingCategory.id,
      status: ArticleStatus.DRAFT, // This article is a draft
    },
  });
  console.log('Artikel berhasil dibuat.');

  // --- 5. Buat Data Komentar (Comment) ---
  console.log('Membuat komentar...');
  const comment1 = await prisma.comment.create({
    data: {
      content: 'This is a great introductory article to NestJS!',
      userId: readerUser.id,
      articleId: article1.id,
    },
  });

  const replyComment1 = await prisma.comment.create({
    data: {
      content: 'I agree, very helpful for beginners.',
      userId: adminUser.id,
      articleId: article1.id,
      parentId: comment1.id, // Ini adalah balasan untuk comment1
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: 'Interesting insights about React. Thanks for sharing!',
      userId: readerUser.id,
      articleId: article2.id,
    },
  });

  const comment3 = await prisma.comment.create({
    data: {
      content: 'Great tips! As a programmer, I need this.',
      userId: adminUser.id,
      articleId: article3.id,
    },
  });
  console.log('Komentar berhasil dibuat.');

  // --- 6. Buat Data Like (Like) ---
  console.log('Membuat like...');
  await prisma.like.create({
    data: {
      userId: adminUser.id,
      commentId: comment1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: reporterUser.id,
      commentId: comment1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: readerUser.id,
      commentId: comment2.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: reporterUser.id,
      commentId: comment3.id,
    },
  });
  console.log('Like berhasil dibuat.');

  console.log('Proses seeding selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
