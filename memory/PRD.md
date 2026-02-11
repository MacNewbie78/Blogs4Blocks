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
- PostPage with full content rendering, likes, comments section
- WritePage for both registered and guest post submission
- AuthPage with login/register tabs
- AboutPage with mission, values, how-it-works, stats
- Navbar with rainbow logo, topics dropdown, mobile responsive
- Footer with community stats, quick links, category links
- 12 seed blog posts from global authors (NYC, London, Mumbai, Tokyo, Stockholm, Dublin, São Paulo, Berlin, Mexico City, Seoul, Delhi, Dubai)

## Test Results
- Backend: 100% (12/12 tests passed)
- Frontend: 95% (all major flows working)

## Prioritized Backlog
### P0 (Next)
- Email notification system for registered users (new posts, comments on their posts)
- User profile/dashboard page

### P1
- Rich text editor for post content (markdown support)
- Pagination for posts listing
- Image upload for blog posts

### P2
- Social sharing buttons (Twitter, LinkedIn)
- Newsletter subscription
- Admin dashboard for content moderation
- Most popular posts widget
- Related posts suggestions
