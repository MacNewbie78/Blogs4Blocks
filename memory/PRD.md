# Blogs 4 Blocks - Product Requirements Document

## Original Problem Statement
Build a blogging website based in New York City. Title: "Blogs 4 Blocks." Goal: marketing professionals share blog posts about strategies for their demographic, creating an open forum. Inviting, easy to navigate, cheerful, exciting.

## Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend:** React.js
- **Database:** MongoDB
- **Real-time:** WebSockets
- **Email:** Resend API
- **Styling:** Tailwind CSS, shadcn/ui
- **Authentication:** JWT
- **Deployment Model:** PWA
- **Analytics:** Google Analytics 4 (GA4)
- **Scheduler:** APScheduler (AsyncIOScheduler)

## Core Requirements (All Implemented)
1. City photo background for pages
2. User registration + guest posting (guest posts expire in 30 days)
3. Registered users notified about new posts and comments (via Resend)
4. Dynamic blog categories with admin moderation
5. User profile/dashboard with custom color-coding
6. Rich text editor (TipTap) for creating posts
7. Email notifications for new posts and comments
8. Real-time discussion threads using WebSockets
9. Image uploads for blog posts
10. Progressive Web App (PWA)
11. Admin panel to moderate user-suggested topics
12. Custom logo for navbar + hero section background
13. Weekly digest feature (automated + manual)
14. Deployment guide for Hostinger

## Key DB Collections
- `users`: {email, username, password_hash, is_admin, profile_colors}
- `posts`: {title, content, author_id, is_guest, created_at, expires_at}
- `categories`: {name, slug, status, color}
- `comments`: {post_id, content, author_name}
- `newsletter`: {email, name, active, subscribed_at}
- `digest_log`: {sent_at, recipients, errors, posts_included, status}
- `user_likes`, `user_prefs`, `subcategories`

## Completed Features
- Full auth system (JWT) with registration and login
- Guest posting with 30-day expiration countdown
- Rich text editor (TipTap)
- Real-time comments via WebSocket
- Email notifications (new posts, new comments)
- Dynamic categories with admin moderation
- User profile dashboard with custom colors
- Popular/related posts (trending section)
- Post editing and deleting
- Pagination on category pages
- Newsletter subscription UI (homepage + footer)
- **Weekly Digest backend logic (APScheduler cron: every Monday 9AM UTC)**
- **Admin Newsletter tab (digest status, manual trigger, history log)**
- Admin panel (overview, moderation, posts, comments, users, newsletter)
- PWA support
- GA4 analytics
- Deployment guide for Hostinger (at /hosting-guide route - may need verification)

## Architecture
```
/app
├── backend/
│   ├── server.py (all routes, models, scheduler)
│   ├── uploads/
│   ├── tests/
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/ (BlogCard, CommentSection, Footer, Navbar, etc.)
    │   ├── pages/ (Home, Category, Post, Write, Auth, Profile, Admin, etc.)
    │   ├── context/AppContext.js
    │   └── App.js
    └── public/
```

## Key API Endpoints
- Auth: POST /api/auth/register, /api/auth/login, GET /api/auth/me
- Posts: GET/POST /api/posts, GET/PUT/DELETE /api/posts/{id}
- Comments: GET/POST /api/posts/{id}/comments
- Categories: GET /api/categories, POST /api/categories/suggest
- Newsletter: POST /api/newsletter/subscribe, /api/newsletter/unsubscribe
- Admin: GET /api/admin/stats, /api/admin/digest-status, POST /api/admin/send-digest, GET /api/admin/subscribers
- Upload: POST /api/upload
- WebSocket: /api/ws/comments/{post_id}

## Credentials
- Admin Setup Key: b4b-admin-2024 (at /admin-setup route)

## Backlog / Future
- Refactor server.py into modular routers for scalability
- Verify HostingGuidePage is accessible
- User feedback cycle
