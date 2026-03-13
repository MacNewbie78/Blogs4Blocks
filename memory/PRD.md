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
- **Analytics:** Google Analytics 4 (GA4) + Custom Email Analytics
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
15. **Subscriber Analytics Dashboard** (email open/click tracking)
16. **Like toggle** (like/unlike with persistent state)
17. **Partners system** (user connections + co-authoring)

## Key DB Collections
- `users`: {email, username, password_hash, is_admin, profile_colors}
- `posts`: {title, content, author_id, is_guest, created_at, expires_at, co_authors}
- `categories`: {name, slug, status, color}
- `comments`: {post_id, content, author_name}
- `newsletter`: {email, name, active, subscribed_at}
- `digest_log`: {sent_at, recipients, errors, posts_included, status}
- `partnerships`: {id, requester_id, target_id, requester_name, target_name, status}
- `email_events`: {digest_id, email_hash, event_type, timestamp, url}
- `user_likes`, `user_prefs`, `subcategories`

## Key API Endpoints
### Auth
- POST /api/auth/register, /api/auth/login, GET /api/auth/me

### Posts
- GET/POST /api/posts, GET/PUT/DELETE /api/posts/{id}
- POST /api/posts/{id}/like (toggle), GET /api/posts/{id}/liked

### Partners
- GET /api/users/search?q=name
- POST /api/partners/request, GET /api/partners, GET /api/partners/requests
- PUT /api/partners/{id}/accept, DELETE /api/partners/{id}

### Email Analytics
- GET /api/track/open?d=&e= (tracking pixel)
- GET /api/track/click?d=&e=&url= (click redirect)
- GET /api/admin/analytics

### Admin
- GET /api/admin/stats, /api/admin/digest-status, /api/admin/analytics
- POST /api/admin/send-digest, GET /api/admin/subscribers

## Credentials
- Admin Setup Key: b4b-admin-2024 (at /admin-setup route)

## Backlog / Future
- Refactor server.py into modular routers for scalability
- Verify HostingGuidePage is accessible at /hosting-guide
- User feedback cycle
