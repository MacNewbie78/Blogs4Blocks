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
- **Deployment:** PWA

## Architecture
```
/app
├── backend/
│   ├── routes/ (admin, analytics, auth, categories, comments, newsletter, partners, posts, profile, tracking, upload)
│   ├── database.py, models.py, seed_data.py, server.py
│   └── .env
├── frontend/
│   └── src/
│       ├── components/ (Navbar, BlogCard, Footer, CommentSection, RichTextEditor, InstallPrompt)
│       ├── pages/ (HomePage, PostPage, CategoryPage, WritePage, AuthPage, AboutPage, ProfilePage, AdminPage, AdminSetupPage, HostingGuidePage)
│       ├── context/ (AppContext)
│       ├── utils/ (colors.js — muted pastel color palette with card gradients)
│       └── App.js
└── DEPLOYMENT_GUIDE.md
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
13. Deployment guide for Hostinger VPS
14. Email notifications for new posts/comments
15. User profile dashboard with color-coding
16. **@username mention in comments** — autocomplete popup, mention highlighting, stored mention user IDs
17. How-to card for non-technical users
18. Community analytics dashboard on homepage

## UI Design — "Colorful Editorial" (Latest)
### Design Philosophy
- **Pastel gradient card fills** — each category has a soft, full-coverage gradient (cardFrom -> cardTo)
- **Rounded corners** (rounded-xl) on cards for warmth
- **Muted color palette** — sophisticated but fun and energetic
- **Category-specific colors** across the entire UI (cards, badges, dropdown indicators, avatars)
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

### New: @mention Feature
- Backend: `GET /api/users/search?q=prefix&post_id=id` — searches users by name prefix, prioritizes post author + commenters
- Frontend: CommentSection detects `@` typing, shows autocomplete popup, inserts `@Name`, highlights mentions in blue (#3D6B8E)

### Topics Dropdown
- Off-white background (#FDFCF8) matching landing page
- Category-colored dots and left-border for each item

## Key API Endpoints
- `GET /api/users/search` — User search for @mentions
- `POST /api/posts/{id}/comments` — Creates comment with mention extraction
- `GET /api/admin/newsletter/stats` — Newsletter analytics
- `POST /api/admin/newsletter/trigger-digest` — Manual digest trigger
- All previous endpoints preserved

## Backlog / Future
- Advertiser portal / sponsored post feature (user mentioned wanting to monetize with advertisers)

## Test Reports
- Backend: 34/34 tests passed (iteration_9-11 original features)
- Frontend: 24/24 tests passed (iteration_11 — first UI redesign)
- Combined: 25/25 tests passed (iteration_12 — @mentions, pastel cards, dropdown colors)
