# Planora – Social Media Planner

> **A premium, high‑performance SaaS platform** for managing social media campaigns, content, analytics, and AI assistance.

![Planora Preview](https://social-media-planner-rose.vercel.app/assets/logo_golden-DUSUNAil.png)

## 📖 Overview
Planora is a premium‑looking SaaS web application designed to help creators and marketers schedule, manage, and optimize their social‑media content.

The app features:
- **Authentication** via Supabase (Google OAuth & email)
- **Dashboard, Calendar, Content Library, Campaigns, Analytics, AI Assistant, Profile, and Settings** pages
- A **glass‑morphism / dark‑cream** visual theme with elegant gold accents
- **Responsive mobile-first layout** for seamless usage on desktop and mobile
- **SPA routing** hosted on Vercel
- **Performance‑focused enhancements** (lazy‑loaded routes, reduced animations on mobile, reduced‑motion support)

## 🛠️ Tech Stack 
- **Frontend Framework:** React 18
- **Build Tool / Bundler:** Vite
- **Routing:** React Router v6
- **Global State Management:** Zustand
- **Backend & Auth:** Supabase (PostgreSQL, Auth, Storage)
- **Animations:** Framer Motion
- **Hosting:** Vercel

## 🚀 Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/deepakdube1102/Planora.git
cd Planora
```

### 2. Install dependencies
Make sure you have Node.js installed (v18+ recommended).
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (you can copy from `.env.example` if available) and add your API keys:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_KEY=your_gemini_api_key  # Optional: For AI Assistant features
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The app supports Hot Module Replacement (HMR).

## 📦 Production Deployment (Vercel)
This project is configured for seamless deployment on Vercel.

1. Connect your GitHub repository to Vercel.
2. Add the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_KEY`) in the Vercel project settings.
3. Vercel automatically builds the project using `npm run build` (`vite build`) and serves the static files.
4. The included `vercel.json` ensures direct navigation to nested routes works correctly without 404 errors by rewriting all paths to `index.html`.

## ⚡ Performance Optimizations
- **Code-Splitting:** Route-level code splitting using React `lazy` and `Suspense` reduces the initial bundle size by over 60%.
- **Mobile Optimizations:** On devices with screens ≤ 768px, animation durations are capped, and expensive CSS properties like `backdrop-filter` are disabled to ensure smooth 60fps scrolling and interaction.
- **Accessibility:** Honors the `prefers-reduced-motion` media query to disable animations for users who prefer it.

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
