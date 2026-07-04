# 🏙️ UrbanFix — Smart City Civic Engagement Platform

[![React](https://img.shields.io/badge/Frontend-React%20%2F%20Vite-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Laravel](https://img.shields.io/badge/Backend-Laravel%2011-red?style=for-the-badge&logo=laravel)](https://laravel.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Clerk](https://img.shields.io/badge/Auth-Clerk%20Security-6C47FF?style=for-the-badge&logo=clerk)](https://clerk.com)

**UrbanFix** is a next-generation Smart City application designed to bridge the gap between citizens and municipal authorities. It enables residents to report local issues (potholes, public lighting, waste, vandalism) in real-time, allows city workers to resolve them efficiently, and provides administrators with a comprehensive dashboard to monitor city-wide operations.

---

## 🚀 Key Features & Role-Based Flows

UrbanFix features three distinct portals tailored to different users:

| Citizen Portal 🧑 | City Worker Portal 👷 | Admin Command Center 📊 |
| :--- | :--- | :--- |
| **Interactive Map & Reports**: Explore active civic issues in the neighborhood. | **Assigned Task Manager**: View, track, and update assigned cleanup tasks. | **Live Analytics**: Monitor civic issues reported, resolved, and pending. |
| **Report an Issue**: Smart form to upload images, category, and exact location. | **Progress Reporting**: Update ticket statuses (Pending ➡️ In Progress ➡️ Resolved). | **Worker Allocation**: Assign workers to specific tickets and manage teams. |
| **Personal Dashboard**: Track submitted complaints and status updates in real-time. | **Mobile-Responsive**: Designed to be used on-the-go by maintenance teams. | **Database Moderation**: Edit, delete, and filter tickets or user roles. |

---

## 🏗️ System Architecture

```mermaid
graph TD
    %% Frontend Components
    subgraph Client ["Client Side (Vite + React)"]
        Citizen[Citizen UI]
        Worker[Worker UI]
        Admin[Admin UI]
        Clerk[Clerk Auth Client]
    end

    %% Backend Server
    subgraph Server ["Backend (Laravel API)"]
        Router[API Routes]
        Middleware[Auth Middleware]
        Controllers[Controllers]
        Mail[Notification Mailer]
    end

    %% Database Layer
    subgraph Database ["Database Layer"]
        Postgres[(PostgreSQL)]
    end

    %% Interaction Flows
    Citizen -->|Reports & Feeds| Router
    Worker -->|Job Status Updates| Router
    Admin -->|User & Job Control| Router
    Clerk -.->|Session Token| Middleware
    Router --> Middleware
    Middleware --> Controllers
    Controllers -->|Eloquent ORM| Postgres
```

---

## 💾 Database Schema

```mermaid
erDiagram
    USERS {
        bigint id PK
        string name
        string email
        string clerk_id UK
        string role "citizen | worker | admin"
        timestamp created_at
    }
    REPORTS {
        bigint id PK
        string title
        text description
        string category "infrastructure | waste | lighting | other"
        string status "pending | in_progress | resolved"
        string latitude
        string longitude
        string image_url
        bigint user_id FK
        timestamp created_at
    }
    JOBS {
        bigint id PK
        bigint report_id FK
        bigint worker_id FK
        timestamp assigned_at
        timestamp resolved_at
    }

    USERS ||--o{ REPORTS : "creates"
    REPORTS ||--|| JOBS : "resolves"
    USERS ||--o{ JOBS : "works_on"
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Shadcn/UI, Lucide Icons, React Router.
- **Backend**: Laravel 11, Eloquent ORM, RESTful API Controllers.
- **Authentication**: Clerk Auth (secured JWT token propagation to Laravel).
- **Database**: PostgreSQL (Migrations and Seeders included).

---

## ⚙️ Quick Start Guide

### Prerequisites
- Node.js (v18+)
- PHP (v8.2+) & Composer
- PostgreSQL Database

### 1. Clone & Setup Backend
```bash
cd smartCity-main/Backend/backend
composer install
cp .env.example .env
```
*Configure database credentials and Clerk keys in your `.env` file, then run migrations:*
```bash
php artisan migrate --seed
php artisan serve
```

### 2. Setup Frontend
```bash
cd ../../smartCity-main/UI\ Design
npm install
npm run dev
```

The application will be running locally at `http://localhost:5173`.

---

## ✨ Design Concept & Aesthetics

UrbanFix is designed with a premium, clean aesthetic inspired by modern enterprise dashboards:
- **HSL Tailwind Palettes**: Smooth, accessible slate and indigo accents.
- **Micro-Animations**: Hover-triggered translations and smooth accordion expansions.
- **Responsive Layout**: Designed mobile-first for field workers and desktop-first for city admins.
