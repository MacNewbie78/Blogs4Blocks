# Blogs 4 Blocks - Product Requirements Document

## Original Problem Statement
Build a blogging website based in New York City. Title: "Blogs 4 Blocks." Goal: marketing professionals share blog posts about strategies for their demographic, creating an open forum. Inviting, easy to navigate, cheerful, exciting.

## Tech Stack
- **Backend:** FastAPI (Python) — modular router architecture
- **Frontend:** React.js
- **Database:** MongoDB
- **Real-time:** WebSockets
- **Email:** Resend API
- **Styling:** Tailwind CSS, shadcn/ui
- **Authentication:** JWT
- **Deployment Model:** PWA
- **Analytics:** Google Analytics 4 (GA4) + Custom Email Analytics
- **Scheduler:** APScheduler (AsyncIOScheduler)

## Architecture (Refactored)
```
backend/
├── server.py          # App orchestrator (~140 lines)
├── database.py        # MongoDB connection
├── auth.py            # JWT helpers + auth dependencies
├── models.py          # Pydantic models
├── email_service.py   # Resend email functions
├── websocket_manager.py # WebSocket connection manager
├── seed_data.py       # Seed categories + posts
└── routes/
    ├── auth.py        # Register, login, me
    ├── posts.py       # CRUD, like toggle, popular, related
    ├── categories.py  # CRUD, suggest, approve/reject
    ├── comments.py    # CRUD + WebSocket broadcast
    ├── admin.py       # Stats, user management, digest, analytics
    ├── newsletter.py  # Subscribe, unsubscribe, weekly digest
    ├── partners.py    # Search, request, accept, remove
    ├── profile.py     # Posts, interactions, colors
    ├── upload.py      # Image upload
    ├── tracking.py    # Email open/click tracking
    └── misc.py        # Seed, stats
```

## All Implemented Features
1. User registration + JWT auth
2. Guest posting with 30-day expiration
3. Rich text editor (TipTap)
4. Real-time comments via WebSocket
5. Email notifications (new posts, new comments) via Resend
6. Dynamic categories with admin moderation
7. User profile with custom color-coding
8. Like toggle (like/unlike with persistent state)
9. Share buttons (Twitter, LinkedIn, Facebook, Copy Link)
10. Partners system (search, request, accept/decline, co-authoring)
11. Popular/related posts
12. Pagination
13. Newsletter subscription + automated weekly digest (Monday 9AM UTC)
14. Subscriber analytics dashboard (open/click tracking)
15. Admin panel (7 tabs: Overview, Moderation, Newsletter, Analytics, Posts, Comments, Users)
16. Deployment guide at /hosting-guide
17. PWA support
18. GA4 analytics

## Key API Endpoints
- Auth: POST /api/auth/register, /login, GET /me
- Posts: GET/POST /api/posts, GET/PUT/DELETE /api/posts/{id}, POST /like, GET /liked
- Categories: GET /api/categories, /{slug}, POST /suggest
- Comments: GET/POST /api/posts/{id}/comments
- Partners: GET /api/users/search, POST /api/partners/request, GET/PUT/DELETE /api/partners
- Newsletter: POST /api/newsletter/subscribe, /unsubscribe
- Admin: GET /api/admin/stats, /digest-status, /analytics, POST /send-digest
- Tracking: GET /api/track/open, /track/click
- Upload: POST /api/upload

## Credentials
- Admin Setup Key: b4b-admin-2024 (at /admin-setup route)

## Status: COMPLETE
All features implemented, tested (34 backend tests + full frontend verification), and refactored into production-ready modular architecture.
