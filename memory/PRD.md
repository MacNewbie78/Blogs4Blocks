# Blogs 4 Blocks - PRD

## Original Problem Statement
Build a blogging website based in New York City called "Blogs 4 Blocks." An open forum for marketing professionals worldwide to share strategies, insights, and experiences. 12 pre-loaded blogs about marketing strategies (good and bad). Users can contribute from different parts of the world. The website should be inviting, easy to navigate, cheerful, and exciting.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (collections: users, posts, comments)
- **Auth**: JWT-based + guest posting (30-day expiry)

## User Personas
1. **Registered Marketing Professional**: Creates permanent posts, receives notifications, builds community presence
2. **Guest Contributor**: Posts without account (name + city), posts expire in 30 days, no notifications
3. **Reader**: Browses, searches, reads, comments, and likes posts

## Core Requirements
- 7 marketing categories: Social Media, SEO/SEM, Influencer Marketing, Integrated Marketing, Consumer Behavior, Branding, Marketing Tools
- 10 subcategories: 4Ps of Marketing, Wheel & Spoke, SWOT Analysis, Competitor Analysis, Content Marketing, Email Marketing, Brand Storytelling, SEO Fundamentals, Paid Advertising, Market Research
- 12 pre-seeded blog posts with diverse global authors
- Comments and likes on posts
- User registration + guest posting
- City photo collage backgrounds (global feel)
- Rainbow/multicolor accent theme matching "Blogs 4 Blocks" branding

## What's Been Implemented (Feb 11, 2026)
- Full backend API with auth, posts, comments, categories, likes, stats, seed data
- HomePage with hero (city collage + rainbow title), categories bento grid, latest posts
- CategoryPage with subcategory filters, search, post grid
- PostPage with full content rendering (plain text + HTML), likes, comments section
- WritePage with TipTap rich text editor (WordPress-like toolbar: H1-H3, bold, italic, underline, strikethrough, highlight, lists, blockquote, code, alignment, links, horizontal rules)
- AuthPage with login/register tabs
- AboutPage with mission, values, how-it-works, stats
- **ProfilePage/Dashboard** with:
  - User's own posts section (color-coded)
  - Posts interacted with section (liked/commented, separately color-coded)
  - Color picker for both sections (12 color options, saved to profile)
  - Discussion thread dialog (chat-like view) when clicking interacted posts
  - 5-second auto-refresh for live-ish discussion updates
- Navbar with rainbow logo, topics dropdown, mobile responsive, profile link
- Footer with community stats, quick links, category links
- **Email Notification System** (Resend):
  - Notifies post authors when someone comments on their post
  - Notifies category followers (users who've liked/commented in a category) when new posts are published
  - Branded HTML emails with B4B rainbow branding
  - Fire-and-forget async sending (non-blocking)
  - Uses onboarding@resend.dev sender (upgradeable to notifications@blogs4blocks.com after domain verification)
- **Real-time WebSocket Discussion Threads**:
  - WebSocket endpoint at /api/ws/comments/{post_id}
  - Live "connected" indicator on comment sections
  - New comments broadcast instantly to all viewers
  - Auto-reconnect on disconnect (3s delay)
  - Ping/pong keepalive every 25s
  - Works in both PostPage comment section and ProfilePage discussion dialog
- **Image Upload System**:
  - Cover/hero image upload for blog posts (drag-and-drop area)
  - Inline image insertion in TipTap rich text editor (toolbar button)
  - Images stored in backend filesystem, served via static files
  - 5MB file size limit, image-type validation
  - Cover images displayed on blog cards and post detail pages
- **PWA (Progressive Web App)** support:
  - manifest.json with app metadata and icons
  - Service worker for offline caching (network-first strategy)
  - Apple mobile web app meta tags
  - Install-to-home-screen prompt banner
  - Standalone display mode (no browser chrome)
  - Custom app icons (192x192 and 512x512)
- Fixed stats: now shows "Contributors" (unique authors) instead of "Members"
- 12 seed blog posts from global authors
- **Dynamic Categories System** (MongoDB-based, scalable):
  - 11 pre-loaded categories: Social Media, SEO/SEM, Influencer Marketing, Integrated Marketing, Consumer Behavior, Branding, Marketing Tools, Digital Marketing, Marketing & AI, Keywords & Search Strategy, Marketing Careers
  - 18 subcategories across categories
  - "Suggest a Topic" feature: users can propose new categories
  - Moderation system: user suggestions start as "pending", admin can approve/reject
  - Auto-assigned colors from palette for new categories

## Test Results
- Backend: 100% (all tests passed across 3 iterations)
- Frontend: 95%+ (all core features working)

## Prioritized Backlog
### P0 (Next)
- Verify Resend domain for blogs4blocks.com custom sender
- Image compression/optimization on upload

### P1
- User following system (follow contributors)
- Post editing and deletion
- Pagination for posts listing
- Rich media embeds (YouTube, Twitter)

### P2
- Social sharing buttons (Twitter, LinkedIn)
- Newsletter subscription / Weekly Digest
- Admin dashboard for content moderation
- Most popular posts widget
- Related posts suggestions
