# Blogs 4 Blocks - PRD

## Original Problem Statement
Build a blogging website based in New York City called "Blogs 4 Blocks." An open forum for marketing professionals worldwide to share strategies, insights, and experiences. 12 pre-loaded blogs about marketing strategies (good and bad). Users can contribute from different parts of the world. The website should be inviting, easy to navigate, cheerful, and exciting.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (collections: users, posts, comments, categories, subcategories, user_likes, user_prefs)
- **Auth**: JWT-based + guest posting (30-day expiry)
- **Email**: Resend API
- **Real-time**: WebSockets
- **Analytics**: Google Analytics 4 (GA4)

## User Personas
1. **Registered Marketing Professional**: Creates permanent posts, receives notifications, builds community presence
2. **Guest Contributor**: Posts without account (name + city), posts expire in 30 days, no notifications
3. **Reader**: Browses, searches, reads, comments, and likes posts
4. **Admin**: Manages content, moderates topic suggestions, promotes/demotes users

## Core Requirements
- 11 marketing categories with 18 subcategories
- 12 pre-seeded blog posts with diverse global authors
- Comments, likes, and real-time discussions on posts
- User registration + guest posting
- City photo collage backgrounds (global feel)
- Rainbow/multicolor accent theme
- Rich text editor (TipTap) with image uploads
- Email notifications (Resend)
- WebSocket real-time comments
- PWA support
- Dynamic categories with user suggestions and admin moderation
- Admin panel for content and user management

## What's Been Implemented

### Core Platform (Feb 11, 2026)
- Full backend API with auth, posts, comments, categories, likes, stats, seed data
- HomePage with hero (city collage + rainbow title), categories bento grid, latest posts
- CategoryPage with subcategory filters, search, post grid
- PostPage with full content rendering, likes, comments section
- WritePage with TipTap rich text editor
- AuthPage with login/register tabs
- AboutPage with mission, values, how-it-works, stats
- ProfilePage/Dashboard with color-coded sections
- Navbar with custom logo, topics dropdown, mobile responsive
- Footer with community stats, quick links

### Features (Feb 11, 2026)
- Email Notifications via Resend (new posts, comments)
- Real-time WebSocket Discussion Threads
- Image Upload System (cover images + inline)
- PWA support (manifest, service worker, install prompt)
- Dynamic Categories (MongoDB-based, user suggestions, admin moderation)

### Admin System (Feb 12, 2026)
- Admin Dashboard (`/admin`): Overview stats, moderation queue, recent posts/comments, user management
- Admin Setup Page (`/admin-setup`): Self-service admin promotion with secret key
- User Promotion/Demotion: Toggle admin status for any user from admin panel
- Topic Moderation: Approve/reject user-suggested categories
- Content Moderation: Delete posts and comments
- Google Analytics 4 (GA4) integration

### P1 Features (Mar 12, 2026)
- **Guest Post Expiration**: Guest posts automatically hidden from listings after 30 days. BlogCard shows countdown badge, PostPage shows colored expiration notice (red=expired, amber=<7 days, yellow=active)
- **New Post Notifications**: All registered users receive email notification via Resend when new posts are published (async, non-blocking)
- Admin stats now include expired_guest_posts count

## Key API Endpoints
- `/api/auth/{register, login, me}` - User authentication
- `/api/posts/...` - CRUD for blog posts (with `include_expired` param)
- `/api/categories` - Dynamic categories
- `/api/admin/self-promote` - Self-service admin setup with secret key
- `/api/admin/users/{user_id}/toggle-admin` - Promote/demote users
- `/api/admin/stats` - Dashboard statistics (incl. expired guest posts)
- `/api/admin/users` - List all users
- `/api/admin/posts/{id}` - Delete posts
- `/api/admin/comments/{id}` - Delete comments
- `/api/upload` - Image uploads
- `/api/ws/comments/{post_id}` - Real-time comments WebSocket

## Credentials
- **Demo Admin**: demo@b4b.com / password123
- **Admin Setup Key**: b4b-admin-2024 (set via ADMIN_SETUP_KEY in backend/.env)

## Prioritized Backlog

### P1
- Custom Profile Color-Coding (user-selected colors for dashboard sections)
- Post editing and deletion by author
- Pagination for posts listing

### P2
- Social sharing buttons
- Newsletter subscription / Weekly Digest
- Most popular posts widget
- Related posts suggestions
- Self-hosting/deployment guidance (Hostinger VPS)
