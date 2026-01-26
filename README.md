# Freelance Hub 🚀

A powerful, all-in-one dashboard designed for freelancers and small agencies to manage projects, clients, time tracking, and finances. Built with modern web technologies for performance and scalability.

## ✨ Features

- **📊 Dashboard Overview**: Real-time insights into active projects, total revenue, and upcoming deadlines.
- **📁 Project Management**: 
  - Create and track projects (Planning, In Progress, Completed).
  - Manage budgets, deadlines, and currencies (PLN, USD, EUR).
  - File storage for contracts and briefs.
- **👥 Client CRM**: 
  - Manage client database with contact details.
  - Track "Life Time Value" (LTV) and project history per client.
- **⏱️ Time Tracking**: 
  - Log hours for specific project stages.
  - View burn rates and remaining budget calculations.
- **✅ Task Management**: 
  - Integrated Todo lists for every project.
  - Quick status toggles and deletion.
- **🔒 Secure**: Built on top of Supabase Auth and Row Level Security.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏗️ Architecture

This project follows a **Service-Repository** pattern to ensure code maintainability and separation of concerns.

### Directory Structure

- **`src/app`**: Next.js App Router pages and layouts.
- **`src/app/dashboard/actions.ts`**: **Controller Layer**. Handles form submissions, validation, and revalidation. content.
- **`src/services/*`**: **Data Access Layer (DAL)**. Contains all direct database interactions.
  - `projects.ts`: Project CRUD & stats.
  - `clients.ts`: Client management.
  - `tasks.ts`: Task operations.
  - `files.ts`: Storage bucket operations.
  - `users.ts`: User profile fetching.
- **`src/components`**: Reusable UI components.

### Data Flow

1. **User Action**: User submits a form (e.g., "Create Project").
2. **Server Action**: `src/app/dashboard/actions.ts` receives the `FormData`.
3. **Service Call**: Action calls `createProjectService()` from `src/services/projects.ts`.
4. **Database**: Service communicates with Supabase.
5. **Response**: Action revalidates the path and redirects the user.

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/tj0517/freelancer_hub.git
   cd freelance-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📝 License

This project is open-source and available under the simple MIT License.
