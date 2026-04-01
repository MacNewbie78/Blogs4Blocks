# Blogs 4 Blocks — Product Requirements Document

## Original Problem Statement
Build a blogging website based in New York City called "Blogs 4 Blocks." Marketing professionals share blog posts about strategies that work for their demographic, creating an open forum. Inviting, easy to navigate, cheerful, exciting — yet elevated and refined enough to attract advertisers.

## Tech Stack
- **Backend:** FastAPI (Python), MongoDB
- **Frontend:** React.js, Tailwind CSS, shadcn/ui, Framer Motion
- **Payments:** Stripe (via emergentintegrations)
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
│   │   ├── admin.py        # Admin + featured/sponsor/inquiry management
│   │   ├── advertise.py    # Advertiser inquiry form + stats
│   │   ├── payments.py     # Stripe checkout, status, webhook, rate card
│   │   ├── analytics, auth, categories, comments, misc
│   │   ├── newsletter, partners, posts, profile, tracking, upload
│   │   └── __init__.py
│   ├── database.py, models.py, seed_data.py, server.py
│   └── .env
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── CityBackground.js    # 30 world city backgrounds with fade
│       │   ├── FeaturedCarousel.js   # Featured/sponsored posts carousel
│       │   ├── BlogCard.js, CommentSection.js, Footer.js, Navbar.js
│       │   └── ui/ (shadcn)
│       ├── pages/
│       │   ├── AdvertisePage.js      # Rate card + Stripe checkout
│       │   ├── PaymentSuccessPage.js # Payment status polling
│       │   ├── HomePage, PostPage, CategoryPage, WritePage
│       │   ├── AuthPage, AboutPage, ProfilePage
│       │   ├── AdminPage, AdminSetupPage, HostingGuidePage
│       │   └── ...
│       ├── utils/
│       │   ├── cityBackgrounds.js   # 30 iconic city photos data
│       │   └── colors.js            # Muted pastel color palette
│       └── App.js
├── DEPLOYMENT_GUIDE.md (Oracle Cloud — Ubuntu AMD)
└── memory/PRD.md
```

## All Completed Features
1. User registration & JWT auth
2. Guest posting (expires in 30 days)
3. Dynamic blog categories with admin moderation
4. Rich text editor (TipTap)
5. Real-time comments via WebSockets
6. Image uploads for blog posts
7. PWA support
8. Admin panel (categories, newsletter, analytics, featured/sponsor, bookings, inquiries)
9. Like & share buttons
10. Partner/co-authoring system
11. Newsletter & weekly digest (APScheduler + Resend)
12. Subscriber analytics (open/click tracking)
13. Email notifications for new posts/comments
14. User profile dashboard
15. @username mention in comments
16. Oracle Cloud Deployment Guide (Ubuntu AMD)
17. Featured Posts Carousel (auto-rotating, 7 posts)
18. Sponsored Posts System (badge, branding bar, admin management)
19. **Advertise Page with Stripe Payment** — Full rate card pricing, interactive configurator, Stripe Checkout
20. **Payment Success Page** — Status polling, success/error/timeout states
21. **City Background System** — 30 iconic world city photos that fade in behind content. Homepage = Statue of Liberty (static). Other pages = deterministic-random city per route.
22. Admin: Featured & Sponsored management tab
23. Admin: Advertiser Inquiries management tab

## Rate Card (from user's spreadsheet)
| Ad Size | 1 Run | 4 Runs | 8 Runs |
|---------|-------|--------|--------|
| Small   | $100  | $360   | $640   |
| Medium  | $175  | $630   | $1,120 |
| Large   | $300  | $1,080 | $1,920 |

Placement Multipliers: Standard (1x), Premium (1.25x), Top Tier (1.5x)

## Test Reports
- iteration_12: 25/25 passed
- iteration_13: 22/23 passed
- iteration_14: 18/18 backend + all frontend passed
- iteration_15: 22/22 backend + all frontend passed (Stripe, city backgrounds, payment success)

## Pre-Launch Checklist
- [ ] Swap Stripe test key for live key in backend .env on Oracle Cloud
- [ ] Set CORS_ORIGINS to real domain
- [ ] Configure Resend with verified domain sender
- [ ] Clean seed/test data for fresh launch
- [ ] Set up admin account via /admin-setup on production

## Backlog / Future
- Sponsored post analytics dashboard (views, clicks, engagement for advertisers)
- Advertiser self-service portal for managing campaigns
- User can swap city background photos (currently stock; swappable by replacing files in cityBackgrounds.js)
