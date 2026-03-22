# Blogs 4 Blocks — Product Requirements Document

## Original Problem Statement
Build a blogging website based in New York City called "Blogs 4 Blocks." Marketing professionals share blog posts about strategies that work for their demographic, creating an open forum. The website needs to be inviting, easy to navigate, cheerful, and exciting — yet elevated, refined, and sophisticated enough to attract advertisers.

## Tech Stack
- **Backend:** FastAPI (Python), MongoDB
- **Frontend:** React.js, Tailwind CSS, shadcn/ui
- **Real-time:** WebSockets
- **Email:** Resend API
- **Auth:** JWT
- **Scheduled Jobs:** APScheduler
- **Deployment Target:** Oracle Cloud Always Free (Ubuntu AMD)
- **PWA:** Yes

## Architecture
```
/app
├── backend/
│   ├── routes/
│   │   ├── admin.py        # Admin panel + featured/sponsor/inquiry management
│   │   ├── advertise.py    # NEW: Advertiser inquiry form + stats
│   │   ├── analytics.py, auth.py, categories.py, comments.py
│   │   ├── misc.py, newsletter.py, partners.py, posts.py
│   │   ├── profile.py, tracking.py, upload.py
│   │   └── __init__.py
│   ├── database.py, models.py, seed_data.py, server.py
│   └── .env
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── FeaturedCarousel.js  # NEW: Auto-rotating featured/sponsored posts
│       │   ├── BlogCard.js, CommentSection.js, Footer.js, Navbar.js
│       │   ├── RichTextEditor.js, InstallPrompt.js
│       │   └── ui/ (shadcn)
│       ├── pages/
│       │   ├── AdvertisePage.js     # NEW: Advertiser inquiry page
│       │   ├── HomePage.js, PostPage.js, CategoryPage.js, WritePage.js
│       │   ├── AuthPage.js, AboutPage.js, ProfilePage.js
│       │   ├── AdminPage.js, AdminSetupPage.js, HostingGuidePage.js
│       │   └── ...
│       ├── context/ (AppContext)
│       ├── utils/ (colors.js)
│       └── App.js
├── DEPLOYMENT_GUIDE.md (Oracle Cloud — Ubuntu AMD)
└── memory/PRD.md
```

## Completed Features
1. User registration & JWT auth
2. Guest posting (expires in 30 days)
3. Dynamic blog categories with admin moderation
4. Rich text editor (TipTap)
5. Real-time comments via WebSockets
6. Image uploads for blog posts
7. PWA support
8. Admin panel (categories, newsletter, analytics, featured/sponsor management, ad inquiries)
9. Like & share buttons
10. Partner/co-authoring system
11. Newsletter & weekly digest (APScheduler + Resend)
12. Subscriber analytics (open/click tracking)
13. Email notifications for new posts/comments
14. User profile dashboard with color-coding
15. @username mention in comments
16. **Oracle Cloud Deployment Guide (Ubuntu AMD)**
17. **Featured Posts Carousel** — Auto-rotating (5s) homepage carousel for featured posts with prev/next arrows, dot nav, category-themed gradients
18. **Sponsored Posts System** — Sponsor badge, branding bar ("Presented by"), external links, shown in carousel, blog cards, and post detail pages
19. **Advertise With Us Page** — Professional landing page with hero section, audience stats (5 metrics), advertising options (3 cards), and inquiry form
20. **Admin: Featured & Sponsored Tab** — Toggle feature/sponsor status for any post, set sponsor name/URL, view stats
21. **Admin: Advertiser Inquiries Tab** — View, manage (contacted/closed) ad inquiries from the Advertise page

## UI Design — "Colorful Editorial" (Current)
- Pastel gradient card fills per category
- Muted sophisticated color palette
- Custom b4b logo in hero section
- Category-specific colors across all UI elements
- Sponsored posts: amber/gold accent (#C4942A) for badges and branding

## Key API Endpoints
### New (This Session)
- `GET /api/posts/featured/list` — Featured posts for carousel
- `POST /api/advertise/inquiry` — Submit advertiser inquiry
- `GET /api/advertise/stats` — Community stats for advertise page (includes newsletter_subscribers)
- `PUT /api/admin/posts/{id}/feature` — Toggle featured status (admin)
- `PUT /api/admin/posts/{id}/sponsor` — Set/remove sponsor info (admin)
- `GET /api/admin/ad-inquiries` — List all ad inquiries (admin)
- `PUT /api/admin/ad-inquiries/{id}/status` — Update inquiry status (admin)

### Existing
- `GET /api/stats` — Site-wide statistics
- `GET /api/users/search` — User search for @mentions
- Full CRUD for posts, categories, users, partners, comments, newsletter

## DB Schema Additions
- `posts` collection: Added fields `is_featured`, `is_sponsored`, `sponsor_name`, `sponsor_url`, `sponsor_logo`
- `ad_inquiries` collection: `{id, company_name, contact_name, email, website, budget_range, message, preferred_categories, status, created_at}`

## Test Reports
- iteration_12: 25/25 passed (@mentions, pastel cards, dropdown colors)
- iteration_13: 22/23 passed (deployment guide, stats, mobile nav colors)
- iteration_14: 18/18 backend + all frontend passed (featured carousel, sponsored posts, advertise page, admin extensions)

## Backlog / Future
- No pending tasks. All user-requested features implemented.
