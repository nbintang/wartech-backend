[![My Skills](https://skillicons.dev/icons?i=nest,ts)](https://skillicons.dev)  WARTECH BACKEND  
==================

🔧 The official backend for **Warta Technologies** – a modern tech news portal bringing you the **latest** and **future** developments in technology.

🧠 ABOUT THE PROJECT
--------------------

**Warta Technologies** is a web-based news platform focused on delivering current and futuristic technology insights. It offers curated articles, trending news, and deep-dive analyses on innovation and the tech world.

This repository powers the backend of the platform, built for scalability and ease of integration with the frontend client.

🛠️ TECH STACK USES
-------------------

This project uses a modern, modular, and scalable stack for building a secure, fast, and maintainable backend:

### 📦 Core Runtime & Language

*   **Node.js** – JavaScript runtime built on Chrome's V8 engine.
    
*   **TypeScript** – A statically-typed superset of JavaScript, used across the entire backend to improve code safety, readability, and tooling support.
    

### 🧱 Framework & Structure

*   **NestJS** – A progressive Node.js framework that promotes clean architecture, dependency injection, and modularization.
    
*   **Prisma ORM** – Provides type-safe and performant database access for MySQL, with full support for schema modeling and migrations.
    

### 🗄️ Database

*   **MySQL** – A reliable and popular open-source relational database used to store user accounts, article content, and platform metadata.
    

### 🔐 Authentication & Authorization

*   **Passport.js** – Middleware used with NestJS for handling authentication strategies. Includes:
    
    *   passport-local for login with email & password.
        
    *   passport-jwt for JWT-based session management.
        

### 🧾 Validation & Schema Definition

*   **Zod** – A TypeScript-first schema validation library used for request body validation and form input verification.
    

### ☁️ File Uploads & Image Processing

*   **Cloudinary** – Cloud-based image & video management used to store and optimize user-uploaded media (e.g., profile pictures, article images).
    
*   **Sharp** – High-performance image processing library used for resizing, compressing, and transforming images before upload.
    

### 🧪 Logging & Debugging

*   **Winston** – A robust and customizable logging library used to handle structured logging, error tracking, and debugging across environments.
    
📁 PROJECT STRUCTURE
--------------------
```md
.
└── wartech-backend/
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    ├── src/
    │   ├── main.ts
    │   ├── common/
    │   │   ├── filters/
    │   │   ├── guards/
    │   │   ├── decorators/
    │   │   └── interceptors/
    │   ├── auth/
    │   │   ├── auth.module.ts
    │   │   ├── auth.controller.ts
    │   │   ├── auth.service.ts
    │   │   ├── strategies/
    │   │   ├── guards/
    │   │   ├── decorators/
    │   │   └── dto/
    │   ├── users/
    │   │   ├── users.module.ts
    │   │   ├── users.controller.ts
    │   │   ├── users.service.ts
    │   │   └── dto/
    │   ├── articles/
    │   │   ├── articles.module.ts
    │   │   ├── articles.controller.ts
    │   │   ├── articles.service.ts
    │   │   └── dto/
    │   └── ...others
    ├── test/
    │   └── auth.e2e-spec.ts
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── tsconfig.json
    ├── vercel.json
    └── README.md
```

🔧 GETTING STARTED LOCALLY
--------------------------
```bash
git clone https://github.com/nbintang/wartech-backend.git
cd wartech-backend
```
```bash
npm install
```

🔧 ⚙️ Set up environment variables
--------------------------
Create a .env file based on .env.example and fill in the configuration values.
```bash
npx prisma migrate dev
```
```bash
npm run start:dev
```

🌐 API ENDPOINT
---------------

Public API available at:🔗 [https://wartech-backend.vercel.app/api](https://wartech-backend.vercel.app/api)

🤝 CONTRIBUTION
---------------

We welcome contributions from developers! Feel free to open an issue or create a pull request to help improve this project.

📄 LICENSE
----------

Licensed under the **MIT License** – feel free to use and modify.
