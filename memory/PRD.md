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
│   ├── routes/ (admin, analytics, auth, categories, newsletter, partners, posts, users)
│   ├── database.py, models.py, seed_data.py, server.py
│   └── .env
├── frontend/
│   └── src/
│       ├── components/ (Navbar, BlogCard, Footer, CommentSection, RichTextEditor, InstallPrompt)
│       ├── pages/ (HomePage, PostPage, CategoryPage, WritePage, AuthPage, AboutPage, ProfilePage, AdminPage, AdminSetupPage, HostingGuidePage)
│       ├── context/ (AppContext)
│       ├── utils/ (colors.js — muted color palette)
│       └── App.js
└── DEPLOYMENT_GUIDE.md
```

## Completed Features (All Tested & Working)
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

## UI Design — "Metropolitan Editorial with Color" (Latest)
### Design Philosophy
- **Muted/matted color palette** — sophisticated, darker pigments (not bright rainbow, not monochrome)
- **Category-specific gradients** flowing from bottom-left to upper-right on cards
- **Colorful title lettering** — each letter in Blogs4Blocks has a unique muted tone
- **Editorial layout** — clean typography (Outfit headings, DM Sans body), sharp corners (rounded-none), uppercase labels
- **Warm off-white background** (#FDFCF8) with subtle noise texture

### Key Color Palette (from /utils/colors.js)
- Slate Blue: #3D6B8E (Social Media)
- Warm Amber: #C4942A (SEO/SEM)
- Dusty Rose: #B4687A (Influencer Marketing)
- Deep Teal: #2D8B7A (Integrated Marketing)
- Plum: #7B5E8D (Consumer Behavior)
- Coral/Terracotta: #C2544D (Branding, primary CTA color)
- Burnt Orange: #BF6B3A (Marketing Tools)
- Sage Green: #5C8A6E (Digital Marketing)
- Steel Blue: #4A6FA5 (Marketing & AI)

### Hero Section
- Custom b4b building-block logo placed to the right of the title text
- No background images — clean warm off-white (#FDFCF8) background
- Side-by-side layout: text left, logo right (stacks on mobile)
- Stats strip at bottom showing Posts, Contributors, Countries
- Colored accent bar at top
- Gradient from bottom-left (category color, 14% opacity) to transparent upper-right
- Category badge with matching color
- Author avatar in category color
- Stats bar at bottom showing likes, views, time

### Special Sections
- **How-to Card** — 3-step guide for non-technical users on how to post
- **Community Stats Card** — Posts, Discussions, Contributors, Countries with individual colored stat boxes

## Backlog / Future
- No additional features requested
- User indicated they are ready to proceed ("I'll probably take it from there")
- **Potential:** Advertiser portal / sponsored post feature (user mentioned wanting to monetize with advertisers)

## Test Reports
- Backend: 34/34 tests passed (iteration_9-11)
- Frontend: 24/24 tests passed (iteration_11 — latest UI redesign)
