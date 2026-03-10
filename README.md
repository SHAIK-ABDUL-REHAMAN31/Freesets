# Freesets

**Discover, copy, and save the absolute highest-quality AI image & video generation prompts.**

Freesets is a curated prompt directory built for creators, designers, and AI enthusiasts. Browse thousands of prompts across categories like product photography, architecture, portraits, logos, and more — then copy them directly into your favorite AI tools.

---

## 📸 Screenshots

> _Screenshots coming soon — run the project locally to see it in action._

---

## 🛠 Tech Stack

| Layer           | Technology                                                       |
| --------------- | ---------------------------------------------------------------- |
| **Framework**   | [Next.js 14](https://nextjs.org/) (App Router, Server Components)|
| **Language**    | [TypeScript](https://www.typescriptlang.org/)                    |
| **Styling**     | [Tailwind CSS 3](https://tailwindcss.com/) + custom design tokens|
| **Database**    | [MongoDB Atlas](https://www.mongodb.com/atlas) via Mongoose 8    |
| **Auth**        | JWT (jose for Edge, jsonwebtoken for Node.js) + httpOnly cookies |
| **Payments**    | [Stripe](https://stripe.com/) Checkout + Customer Portal         |
| **File Storage**| [Cloudinary](https://cloudinary.com/)                            |
| **State**       | [Zustand](https://zustand-demo.pmnd.rs/)                        |
| **Email**       | [Resend](https://resend.com/)                                   |
| **Validation**  | [Zod](https://zod.dev/)                                         |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** ([download](https://nodejs.org/))
- **MongoDB Atlas** account ([sign up](https://www.mongodb.com/cloud/atlas/register))
- **Cloudinary** account ([sign up](https://cloudinary.com/users/register_free))
- **Stripe** account ([sign up](https://dashboard.stripe.com/register))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/freesets.git
cd freesets

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Open .env.local and fill in all required values (MongoDB URI, Stripe keys, etc.)

# 4. Seed the database with sample data
npm run seed

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Default Admin Account

After running the seed script:

| Field    | Value             |
| -------- | ----------------- |
| Email    | `admin@freesets.io` |
| Password | `Admin@1234!`     |

---

## 📁 Project Structure

```
freesets/
├── app/                    # Next.js App Router pages and layouts
│   ├── (admin)/            # Admin dashboard and management pages
│   ├── (auth)/             # Login and signup pages
│   ├── (dashboard)/        # User dashboard, collections, settings
│   ├── (marketing)/        # Public marketing pages (pricing)
│   ├── (platform)/         # Browse, search, prompt detail pages
│   └── api/                # REST API route handlers
├── components/             # Reusable React components
│   ├── auth/               # AuthGuard, LoginForm, SignupForm
│   ├── billing/            # PricingTable, PlanBadge
│   ├── layout/             # Header, Footer, Sidebar
│   ├── prompts/            # PromptCard, PromptGrid, PromptDetail
│   └── ui/                 # Shared UI primitives (Button, Dialog, etc.)
├── config/                 # App configuration (plans, cloudinary, etc.)
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, SEO helpers, constants
│   └── seo/                # Metadata and JSON-LD generators
├── middleware.ts            # Edge middleware for auth and admin protection
├── public/                 # Static assets (icons, OG images)
│   ├── icons/              # AI tool SVG icons, Freesets logo
│   └── og/                 # Default OpenGraph fallback image
├── scripts/                # Database seed scripts
├── server/                 # Backend logic
│   ├── cloudinary/         # Cloudinary upload helpers
│   ├── db/                 # MongoDB connection and Mongoose models
│   ├── middleware/          # API auth middleware (withAuth wrapper)
│   ├── services/           # Business logic (auth, stripe, user, prompt)
│   ├── utils/              # Error handling, helpers
│   └── validators/         # Zod validation schemas
├── stores/                 # Zustand state stores (auth, UI)
└── types/                  # Shared TypeScript types and interfaces
```

---

## 🌍 Deployment

### Deploy to Vercel

1. Push your repository to GitHub
2. Connect the repo to [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Ensure your MongoDB Atlas cluster allows connections from Vercel's IP ranges (or use `0.0.0.0/0` for development)
5. Set up Stripe webhooks to point to `https://your-domain.com/api/webhooks/stripe`
6. Deploy 🚀

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create a branch** for your feature: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to your branch: `git push origin feature/amazing-feature`
5. **Open a Pull Request** against `main`

### Guidelines

- Follow the existing code style and project structure
- Use TypeScript strict mode — no `any` types unless absolutely necessary
- Write server components by default; only add `'use client'` when React hooks or event handlers are needed
- All API routes must call `connectDB()` before any database operation
- Use `jose` for JWT operations in Edge runtime (`middleware.ts`), and `jsonwebtoken` in Node.js API routes

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
