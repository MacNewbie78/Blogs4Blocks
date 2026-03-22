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
│   ├── routes/ (admin, analytics, auth, categories, comments, newsletter, partners, posts, profile, tracking, upload, misc)
│   ├── database.py, models.py, seed_data.py, server.py
│   └── .env
├── frontend/
│   └── src/
│       ├── components/ (Navbar, BlogCard, Footer, CommentSection, RichTextEditor, InstallPrompt)
│       ├── pages/ (HomePage, PostPage, CategoryPage, WritePage, AuthPage, AboutPage, ProfilePage, AdminPage, AdminSetupPage, HostingGuidePage)
│       ├── context/ (AppContext)
│       ├── utils/ (colors.js — muted pastel color palette with card gradients)
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
8. Admin panel (categories, newsletter, analytics)
9. Like & share buttons
10. Partner/co-authoring system
11. Newsletter & weekly digest (APScheduler + Resend)
12. Subscriber analytics (open/click tracking)
13. Email notifications for new posts/comments
14. User profile dashboard with color-coding
15. @username mention in comments — autocomplete popup, mention highlighting, stored mention user IDs
16. How-to card for non-technical users
17. Community analytics dashboard on homepage
18. **Oracle Cloud Deployment Guide (Ubuntu AMD)** — comprehensive 7-step in-app guide + full DEPLOYMENT_GUIDE.md with performance tips, swap setup, troubleshooting, MongoDB Atlas integration
19. **Mobile nav category colors** — colored dots matching category palette (was grey, now uses getCategoryColor)
20. Footer deployment guide link

## UI Design — "Colorful Editorial" (Current)
### Design Philosophy
- **Pastel gradient card fills** — each category has a soft, full-coverage gradient (cardFrom -> cardTo)
- **Rounded corners** (rounded-xl) on cards for warmth
- **Muted color palette** — sophisticated but fun and energetic
- **Category-specific colors** across the entire UI (cards, badges, dropdown indicators, avatars, mobile nav dots)
- **Custom b4b logo** in hero section (side-by-side with title)
- **Colorful title lettering** — each letter in Blogs4Blocks has a unique muted tone

### Key Color Palette (from /utils/colors.js)
- Slate Blue: #3D6B8E / card: #B8DCF0->#E0F0FA (Social Media)
- Warm Amber: #C4942A / card: #F5DFA0->#FFF8E1 (SEO/SEM)
- Dusty Rose: #B4687A / card: #E8B8D0->#FBE8F0 (Influencer Marketing)
- Deep Teal: #2D8B7A / card: #A8E6CF->#E0F5EC (Integrated Marketing)
- Plum: #7B5E8D / card: #C8B8E0->#EDE5F5 (Consumer Behavior)
- Coral/Terracotta: #C2544D / card: #F0B8B0->#FDE8E5 (Branding)
- Burnt Orange: #BF6B3A / card: #F0C8A0->#FFF0E0 (Marketing Tools)
- Sage Green: #5C8A6E / card: #B0D8C0->#E0F0E8 (Digital Marketing)

## Key API Endpoints
- `GET /api/stats` — Site-wide statistics (total_posts, total_comments, total_users, total_countries)
- `GET /api/users/search` — User search for @mentions
- `POST /api/posts/{id}/comments` — Creates comment with mention extraction
- `GET /api/admin/newsletter/stats` — Newsletter analytics
- `POST /api/admin/newsletter/trigger-digest` — Manual digest trigger
- All CRUD endpoints for posts, categories, users, partners

## Backlog / Future
- **P1: Advertiser portal / sponsored post feature** (user mentioned wanting to monetize with advertisers)

## Test Reports
- iteration_12: 25/25 tests passed (previous session — @mentions, pastel cards, dropdown colors)
- iteration_13: 22/23 tests passed (this session — deployment guide, stats, mobile nav colors, footer link). Minor: /api/health not implemented (non-issue)
