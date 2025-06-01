🚀 WARTECH BACKEND
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

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   pgsqlCopyEditwartech-backend/  ├── prisma/             → Database schema and migrations  ├── src/                → Application source code  │   ├── modules/        → Feature-based modules (articles, users, etc.)  │   ├── common/         → Shared helpers, middlewares  │   └── main.ts         → Entry point  ├── test/               → Unit and integration tests  ├── .env.example        → Environment variable template  ├── package.json        → Project metadata and dependencies  ├── tsconfig.json       → TypeScript configuration  └── vercel.json         → Vercel deployment settings   `


🔧 GETTING STARTED LOCALLY
--------------------------

1.  bashgit clone https://github.com/nbintang/wartech-backend.gitcd wartech-backend
    
2.  bashnpm install
    
3.  **⚙️ Set up environment variables**Create a .env file based on .env.example and fill in your config values.
    
4.  bashnpx prisma migrate dev
    
5.  bashnpm run start:dev
    

🌐 API ENDPOINT
---------------

Public API available at:🔗 [https://wartech-backend.vercel.app/api](https://wartech-backend.vercel.app/api)

🤝 CONTRIBUTION
---------------

We welcome contributions from developers! Feel free to open an issue or create a pull request to help improve this project.

📄 LICENSE
----------

Licensed under the **MIT License** – feel free to use and modify.
