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
- **PWA (Progressive Web App)** support:
  - manifest.json with app metadata and icons
  - Service worker for offline caching (network-first strategy)
  - Apple mobile web app meta tags
  - Install-to-home-screen prompt banner
  - Standalone display mode (no browser chrome)
  - Custom app icons (192x192 and 512x512)
- Fixed stats: now shows "Contributors" (unique authors) instead of "Members"
- 12 seed blog posts from global authors

## Test Results
- Backend: 100% (18/18 tests passed)
- Frontend: 100% (all features working)

## Prioritized Backlog
### P0 (Next)
- Email notification system for registered users (new posts, comments on their posts)
- Real-time WebSocket discussion threads (currently polling every 5s)

### P1
- Image upload for blog posts
- Pagination for posts listing
- User following system (follow other contributors)
- Post editing and deletion

### P2
- Social sharing buttons (Twitter, LinkedIn)
- Newsletter subscription
- Admin dashboard for content moderation
- Most popular posts widget
- Related posts suggestions
