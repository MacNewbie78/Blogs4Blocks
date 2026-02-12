from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Set
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import resend
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'blogs4blocks-secret-key-2024')
JWT_ALGORITHM = "HS256"

# Resend email setup
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# Uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    city: str
    country: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    city: str
    country: str
    created_at: str

class GuestAuthor(BaseModel):
    name: str
    city: str
    country: str

class PostCreate(BaseModel):
    title: str
    content: str
    excerpt: str
    category_slug: str
    subcategory: Optional[str] = None
    tags: List[str] = []
    cover_image: Optional[str] = None
    guest_author: Optional[GuestAuthor] = None

class CommentCreate(BaseModel):
    content: str
    guest_author: Optional[GuestAuthor] = None

class ProfileColors(BaseModel):
    my_posts_color: str = "#3B82F6"
    interacted_color: str = "#A855F7"

class CategorySuggest(BaseModel):
    name: str
    description: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        return user
    except Exception:
        return None

async def require_user(authorization: Optional[str] = Header(None)):
    user = await get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user

# ==================== CATEGORIES SEED DATA ====================

# These get seeded into MongoDB on startup. Once in DB, they're fully dynamic.
SEED_CATEGORIES = [
    {"slug": "social-media", "name": "Social Media Marketing", "description": "Strategies for Facebook, Instagram, TikTok, LinkedIn and beyond. What platforms drive real engagement?", "color": "#3B82F6", "icon": "share-2", "status": "approved"},
    {"slug": "seo-sem", "name": "SEO / SEM", "description": "Search engine optimization and marketing tactics. Organic vs paid — what actually moves the needle?", "color": "#22C55E", "icon": "search", "status": "approved"},
    {"slug": "influencer-marketing", "name": "Influencer Marketing", "description": "Micro vs macro influencers, ROI tracking, and partnership strategies from around the globe.", "color": "#A855F7", "icon": "users", "status": "approved"},
    {"slug": "integrated-marketing", "name": "Integrated Marketing", "description": "Omnichannel campaigns that connect digital and traditional. How do you make it all work together?", "color": "#F97316", "icon": "layers", "status": "approved"},
    {"slug": "consumer-behavior", "name": "Consumer Behavior", "description": "Understanding what makes people buy. Psychology, data, and cultural differences across markets.", "color": "#EF4444", "icon": "brain", "status": "approved"},
    {"slug": "branding", "name": "Branding", "description": "Building memorable brands that resonate. Identity, positioning, and storytelling that sticks.", "color": "#FACC15", "icon": "award", "status": "approved"},
    {"slug": "marketing-tools", "name": "Marketing Tools", "description": "The best tools, platforms, and tech stacks marketers are using worldwide. Reviews and recommendations.", "color": "#14B8A6", "icon": "wrench", "status": "approved"},
    {"slug": "digital-marketing", "name": "Digital Marketing", "description": "The full spectrum of online marketing — from display ads to landing pages, funnels, and conversion optimization.", "color": "#6366F1", "icon": "monitor", "status": "approved"},
    {"slug": "marketing-and-ai", "name": "Marketing & AI", "description": "How artificial intelligence is reshaping marketing — from predictive analytics to AI-generated content and automation.", "color": "#EC4899", "icon": "cpu", "status": "approved"},
    {"slug": "keywords", "name": "Keywords & Search Strategy", "description": "Keyword research, long-tail strategy, search intent, and the evolving landscape of how people find things online.", "color": "#06B6D4", "icon": "key", "status": "approved"},
    {"slug": "careers", "name": "Marketing Careers", "description": "Career paths, job hunting, skill development, portfolio building, and navigating the marketing job market worldwide.", "color": "#D97706", "icon": "briefcase", "status": "approved"},
]

SEED_SUBCATEGORIES = [
    {"slug": "4ps-of-marketing", "name": "The 4 P's of Marketing", "parent": "integrated-marketing"},
    {"slug": "wheel-and-spoke", "name": "Wheel & Spoke Method", "parent": "integrated-marketing"},
    {"slug": "swot-analysis", "name": "SWOT Analysis", "parent": "marketing-tools"},
    {"slug": "competitor-analysis", "name": "Competitor Analysis", "parent": "marketing-tools"},
    {"slug": "content-marketing", "name": "Content Marketing", "parent": "social-media"},
    {"slug": "email-marketing", "name": "Email Marketing", "parent": "marketing-tools"},
    {"slug": "brand-storytelling", "name": "Brand Storytelling", "parent": "branding"},
    {"slug": "seo-fundamentals", "name": "SEO Fundamentals", "parent": "seo-sem"},
    {"slug": "paid-advertising", "name": "Paid Advertising", "parent": "seo-sem"},
    {"slug": "market-research", "name": "Market Research", "parent": "consumer-behavior"},
    {"slug": "chatgpt-marketing", "name": "ChatGPT for Marketing", "parent": "marketing-and-ai"},
    {"slug": "predictive-analytics", "name": "Predictive Analytics", "parent": "marketing-and-ai"},
    {"slug": "ppc-strategy", "name": "PPC Strategy", "parent": "digital-marketing"},
    {"slug": "conversion-optimization", "name": "Conversion Optimization", "parent": "digital-marketing"},
    {"slug": "keyword-research", "name": "Keyword Research", "parent": "keywords"},
    {"slug": "search-intent", "name": "Search Intent", "parent": "keywords"},
    {"slug": "portfolio-building", "name": "Portfolio Building", "parent": "careers"},
    {"slug": "freelancing", "name": "Freelancing & Consulting", "parent": "careers"},
]

# Color palette for user-suggested categories
CATEGORY_COLORS = ["#3B82F6", "#22C55E", "#A855F7", "#F97316", "#EF4444", "#FACC15", "#14B8A6", "#6366F1", "#EC4899", "#06B6D4", "#D97706", "#F43F5E", "#8B5CF6", "#10B981", "#F59E0B"]

# ==================== SEED DATA ====================

SEED_POSTS = [
    {
        "title": "How TikTok Changed the Game for Small Business Marketing",
        "excerpt": "From NYC bodegas to Tokyo ramen shops — short-form video is the great equalizer in marketing. Here's what's working in 2025.",
        "content": """Short-form video content has fundamentally shifted how small businesses reach new customers. What used to require a massive advertising budget can now be achieved with a smartphone and creativity.\n\nIn New York City, we've seen local businesses go viral overnight. A Brooklyn bakery gained 200K followers in a month just by showing their croissant-making process. But this isn't just a US phenomenon.\n\nIn Lagos, Nigeria, small fashion brands are using TikTok to reach international buyers. In São Paulo, street food vendors have built massive followings. The algorithm doesn't care about your marketing budget — it cares about engagement.\n\n**What's Working:**\n- Behind-the-scenes content showing real processes\n- Authentic storytelling over polished production\n- Trend participation with a unique brand twist\n- Consistent posting (3-5 times per week minimum)\n\n**What's Not Working:**\n- Overly corporate/scripted content\n- Ignoring comments and community engagement\n- Trying to go viral rather than building community\n\nThe real lesson? Authenticity scales. Marketing professionals who embrace this will thrive. Those clinging to traditional approaches risk irrelevance.\n\nI'd love to hear from marketers in other regions — what platforms are driving results for your small business clients?""",
        "category_slug": "social-media",
        "subcategory": "content-marketing",
        "tags": ["tiktok", "small-business", "video-marketing", "social-media"],
        "author_name": "Marcus Chen",
        "author_city": "New York",
        "author_country": "United States"
    },
    {
        "title": "The Death and Rebirth of Email Marketing in the AI Age",
        "excerpt": "Everyone said email was dead. The data says otherwise — but only if you adapt to how AI is reshaping inboxes.",
        "content": """Email marketing was supposed to be dead by now. Every year, some thought leader declares its demise. And every year, email continues to deliver the highest ROI of any digital marketing channel.\n\nBut here's the nuance: the way we do email marketing has fundamentally changed. AI-powered inbox filtering means your beautifully designed newsletters might never be seen.\n\n**The New Rules of Email Marketing:**\n\n1. **Personalization isn't optional** — Generic blasts get filtered. AI inboxes prioritize emails that match user behavior patterns.\n\n2. **Plain text outperforms designed templates** — Counter-intuitive, but plain text emails from real people outperform HTML newsletters by 2-3x in many B2B contexts.\n\n3. **Segmentation must go deeper** — Demographics aren't enough. Behavior-based triggers tied to specific actions drive 6x higher engagement.\n\n4. **Send frequency sweet spot** — Our data across 50+ clients shows 2-3 emails per week maximizes engagement without fatigue.\n\n**Global Perspective:**\nIn Japan, email etiquette differs significantly — formal subject lines perform better. In Brazil, WhatsApp business messaging has partially replaced email for B2C. Understanding your local market's communication preferences is crucial.\n\nWhat email strategies are working in your market? Drop your insights below.""",
        "category_slug": "marketing-tools",
        "subcategory": "email-marketing",
        "tags": ["email", "AI", "automation", "personalization"],
        "author_name": "Sarah Okonkwo",
        "author_city": "London",
        "author_country": "United Kingdom"
    },
    {
        "title": "Micro-Influencers Are Outperforming Celebrity Endorsements — Here's the Data",
        "excerpt": "Our analysis of 10,000 campaigns across 30 countries reveals a clear winner in the influencer debate.",
        "content": """The influencer marketing industry hit $21 billion in 2024, but not all influencer strategies are created equal. After analyzing 10,000 campaigns across 30 countries, the data is clear: micro-influencers (10K-100K followers) consistently outperform celebrity endorsements.\n\n**The Numbers:**\n- Average engagement rate for micro-influencers: 4.2%\n- Average engagement rate for mega-influencers (1M+): 1.1%\n- Cost per engagement for micro-influencers: $0.25\n- Cost per engagement for mega-influencers: $2.80\n- Conversion rate for micro-influencer recommendations: 8.7%\n- Conversion rate for celebrity endorsements: 2.1%\n\n**Why Micro-Influencers Win:**\n\nTrust. It's that simple. Their audiences see them as peers, not celebrities. When a micro-influencer in Mumbai recommends a skincare brand, their followers believe it's genuine because they've built relationships over years of authentic content.\n\n**Regional Differences:**\n- **Southeast Asia**: KOLs (Key Opinion Leaders) on platforms like Shopee Live drive direct sales\n- **Europe**: Long-form YouTube reviews outperform Instagram posts\n- **Latin America**: Instagram Reels and TikTok collaborations dominate\n- **Middle East**: Snapchat influencers still hold significant sway\n\n**Best Practices:**\n1. Choose influencers whose audience demographics match your target market\n2. Give creative freedom — scripted posts feel inauthentic\n3. Track beyond vanity metrics — measure actual conversions\n4. Build long-term partnerships, not one-off posts\n\nWhat's your experience with influencer marketing in your region?""",
        "category_slug": "influencer-marketing",
        "tags": ["influencers", "micro-influencers", "ROI", "data"],
        "author_name": "Aisha Patel",
        "author_city": "Mumbai",
        "author_country": "India"
    },
    {
        "title": "SEO in 2025: Why Most Strategies Are Already Outdated",
        "excerpt": "AI Overviews, zero-click searches, and the rise of answer engines are forcing a complete rethink of organic search strategy.",
        "content": """If your SEO strategy still revolves around keyword density and backlink building, I have bad news: the game has fundamentally changed.\n\nGoogle's AI Overviews now answer 40% of queries without users ever clicking a link. Bing's AI chat is growing. And newer answer engines are eating into traditional search share.\n\n**What's Changed:**\n\n1. **Zero-click searches dominate** — Featured snippets, knowledge panels, and AI Overviews mean ranking #1 organically isn't what it used to be.\n\n2. **E-E-A-T is everything** — Experience, Expertise, Authoritativeness, and Trustworthiness. Google is prioritizing content from real experts with demonstrable experience.\n\n3. **Topic clusters over keywords** — Individual keyword targeting is dead. Building comprehensive topic authority through interconnected content clusters is the new standard.\n\n4. **Video SEO is non-negotiable** — YouTube is the second largest search engine. If you're not optimizing video content for search, you're leaving traffic on the table.\n\n**What Still Works:**\n- Creating genuinely helpful, comprehensive content\n- Building real authority in your niche\n- Technical SEO fundamentals (site speed, mobile optimization, structured data)\n- Local SEO for businesses serving geographic areas\n\n**Global Insight:**\nIn South Korea, Naver dominates search. In China, it's Baidu. In Russia, Yandex. Each has different algorithms and ranking factors. International SEO requires platform-specific strategies.\n\nShare your SEO wins and challenges from your market below.""",
        "category_slug": "seo-sem",
        "subcategory": "seo-fundamentals",
        "tags": ["SEO", "AI", "google", "search"],
        "author_name": "Lars Erikson",
        "author_city": "Stockholm",
        "author_country": "Sweden"
    },
    {
        "title": "The Psychology of Color in Global Branding: What Works Where",
        "excerpt": "Red means luck in China but danger in the West. A deep dive into how color psychology varies across cultures and markets.",
        "content": """Color is one of the most powerful tools in a marketer's arsenal — but it's also one of the most culturally dependent. What works in one market can backfire spectacularly in another.\n\n**Color Associations by Region:**\n\n🔴 **Red:**\n- Western markets: Urgency, danger, passion, sales\n- China: Luck, prosperity, celebration\n- India: Purity, fertility\n- South Africa: Mourning\n\n🔵 **Blue:**\n- Nearly universal: Trust, stability, professionalism\n- Middle East: Safety, protection\n- Western markets: Corporate, reliable\n\n🟢 **Green:**\n- Western markets: Nature, eco-friendly, health\n- Islamic cultures: Sacred, luck\n- China: Infidelity (avoid for relationship brands)\n\n⚫ **Black:**\n- Western markets: Luxury, sophistication\n- Many Asian cultures: Bad luck, death\n- Fashion industry: Universal premium signaling\n\n**Case Studies:**\n\n1. **Coca-Cola in China**: Leveraged red's positive associations with luck and prosperity. Their Chinese New Year campaigns are masterclasses in cultural color alignment.\n\n2. **Starbucks Global**: Uses green universally but adapts store interiors and marketing materials to local color preferences.\n\n**Best Practices for Global Branding:**\n- Research color associations in every target market before finalizing brand colors\n- Create flexible brand guidelines that allow regional color adaptations\n- Test with local focus groups before major launches\n- Consider generational differences within markets\n\nWhat color strategies have you seen succeed or fail in your market?""",
        "category_slug": "branding",
        "subcategory": "brand-storytelling",
        "tags": ["branding", "color-psychology", "global", "culture"],
        "author_name": "Yuki Tanaka",
        "author_city": "Tokyo",
        "author_country": "Japan"
    },
    {
        "title": "Building an Integrated Campaign: Lessons from a $2M Product Launch",
        "excerpt": "How we coordinated 8 channels, 4 countries, and 12 content formats into one cohesive campaign — and what we'd do differently.",
        "content": """Last quarter, our agency managed a $2M integrated product launch for a consumer tech brand across the US, UK, Germany, and Australia. Here's an honest breakdown of what worked and what didn't.\n\n**The Campaign Structure:**\n\n1. **Pre-launch (6 weeks out):**\n   - Teaser content on social media\n   - Influencer seeding to 50 micro-influencers per market\n   - Email sequence to existing customer base\n   - PR outreach to 200+ publications\n\n2. **Launch Week:**\n   - Coordinated social media blitz across all platforms\n   - Live events in NYC and London\n   - Paid search and display ads\n   - YouTube pre-roll and TikTok ads\n\n3. **Post-launch (8 weeks):**\n   - UGC campaigns encouraging customer stories\n   - Retargeting sequences for website visitors\n   - Review generation campaigns\n   - Community building on Discord\n\n**Results:**\n- 47M total impressions across all channels\n- 2.3M website visits in launch week\n- 156% of sales target achieved in first month\n- Average CAC: $18 (target was $25)\n\n**What Went Wrong:**\n- Germany launch was 3 days late due to translation issues\n- Influencer content in Australia felt disconnected from main messaging\n- Email open rates in UK were 40% below projections\n\n**Key Takeaway:** Integration doesn't mean uniformity. Each market needs localized execution within a unified strategic framework.\n\nHave you managed multi-market campaigns? Share your learnings.""",
        "category_slug": "integrated-marketing",
        "subcategory": "4ps-of-marketing",
        "tags": ["integrated", "campaign", "product-launch", "omnichannel"],
        "author_name": "James O'Brien",
        "author_city": "Dublin",
        "author_country": "Ireland"
    },
    {
        "title": "Consumer Behavior Shifts Post-Pandemic: A Global Snapshot",
        "excerpt": "Three years later, some pandemic shopping habits stuck and others faded. Here's what the data shows across 15 markets.",
        "content": """The pandemic permanently altered consumer behavior in ways most marketers didn't predict. Based on our research across 15 markets, here's what's changed for good and what was temporary.\n\n**Permanent Shifts:**\n\n1. **E-commerce baseline is permanently higher**\n   - Pre-pandemic: ~14% of global retail was online\n   - Current: ~22% of global retail is online\n   - The jump happened in months, not the expected decade\n\n2. **Hybrid shopping is the norm**\n   - 73% of consumers research online before buying in-store\n   - 61% browse in-store then buy online for better prices\n   - BOPIS (Buy Online, Pick Up In-Store) grew 300% and stayed\n\n3. **Health and sustainability consciousness**\n   - 68% of global consumers are willing to pay more for sustainable products\n   - Clean label expectations have expanded from food to cosmetics, fashion, and tech\n\n**Temporary Spikes That Faded:**\n- Home fitness equipment purchases (back to pre-pandemic levels)\n- Excessive pantry stocking behavior\n- Virtual event preference over in-person\n\n**Regional Differences:**\n\n- **India**: Mobile-first commerce grew 400%. UPI payments became dominant.\n- **Japan**: Surprisingly resistant to e-commerce shift. In-store experience still king.\n- **Brazil**: Social commerce (buying directly through social media) grew fastest globally.\n- **Germany**: Privacy-conscious consumers driving cash payment persistence.\n- **UAE**: Luxury e-commerce adoption highest in the world.\n\n**Implications for Marketers:**\nUnderstand that \"post-pandemic consumer\" isn't a monolith. Each market recovered differently based on cultural values, infrastructure, and government responses.\n\nHow has consumer behavior shifted in your specific market? I'd love to build a more comprehensive global picture.""",
        "category_slug": "consumer-behavior",
        "subcategory": "market-research",
        "tags": ["consumer-behavior", "research", "global", "post-pandemic"],
        "author_name": "Maria Santos",
        "author_city": "São Paulo",
        "author_country": "Brazil"
    },
    {
        "title": "Google Ads vs Meta Ads: Where Should Your Budget Go in 2025?",
        "excerpt": "We split-tested $500K across Google and Meta for 20 different industries. The results surprised us.",
        "content": """The eternal question in paid advertising: Google or Meta? We decided to end the debate with data, split-testing $500K across both platforms for 20 different industries over 6 months.\n\n**Overall Results:**\n\n| Metric | Google Ads | Meta Ads |\n|--------|-----------|----------|\n| Avg CPC | $2.69 | $1.72 |\n| Avg CTR | 3.17% | 1.21% |\n| Avg Conversion Rate | 4.40% | 2.85% |\n| Avg CPA | $48.96 | $36.72 |\n| Avg ROAS | 4.2x | 3.8x |\n\n**The Nuance:**\n\nGoogle wins for **high-intent** purchases:\n- Emergency services (plumbers, locksmiths): Google CPA 60% lower\n- B2B software: Google conversion rate 3x higher\n- Local services: Google Maps ads dominate\n\nMeta wins for **discovery and brand building**:\n- Fashion/apparel: Meta CPA 45% lower\n- DTC brands: Meta audience building unmatched\n- Event promotion: Meta reach 4x more efficient\n\n**The Real Answer:** It's not either/or. The best-performing campaigns used both platforms in a coordinated strategy:\n1. Meta for awareness and interest\n2. Google for capturing high-intent searches driven by Meta exposure\n3. Retargeting across both platforms\n\n**Global Notes:**\n- In markets where Google dominates search (US, UK, Australia), this framework holds\n- In SE Asia, consider adding TikTok Ads to the mix\n- In Russia, Yandex Direct replaces Google\n- In China, Baidu PPC and WeChat Ads are the equivalents\n\nWhat's your paid advertising split? Share your results.""",
        "category_slug": "seo-sem",
        "subcategory": "paid-advertising",
        "tags": ["google-ads", "meta-ads", "PPC", "paid-advertising"],
        "author_name": "Alex Müller",
        "author_city": "Berlin",
        "author_country": "Germany"
    },
    {
        "title": "The Wheel and Spoke Content Strategy: Why It Still Works",
        "excerpt": "This classic content marketing framework is more relevant than ever. Here's how to implement it for modern audiences.",
        "content": """The Wheel and Spoke (or Hub and Spoke) content model has been around for years, but in an era of AI-generated content flooding every niche, it's become more important than ever for building genuine topical authority.\n\n**How It Works:**\n\nThe \"hub\" is a comprehensive, authoritative piece of content on a broad topic. The \"spokes\" are specialized pieces that dive deep into subtopics, all linking back to the hub.\n\n**Example Structure:**\n\nHub: \"The Complete Guide to Social Media Marketing in 2025\"\n\nSpokes:\n- \"Instagram Reels Strategy: A Step-by-Step Guide\"\n- \"LinkedIn B2B Marketing: What's Working Now\"\n- \"TikTok for E-commerce: Converting Views to Sales\"\n- \"Social Media Analytics Tools Compared\"\n- \"Building a Social Media Content Calendar\"\n\n**Why It Works in 2025:**\n\n1. **Topical authority signals**: Search engines reward comprehensive coverage of a topic. A well-built hub and spoke structure signals deep expertise.\n\n2. **Internal linking power**: The natural linking structure distributes page authority effectively.\n\n3. **User journey mapping**: Visitors can start at any point and navigate to exactly the depth they need.\n\n4. **Content repurposing**: Each spoke can become social posts, email sequences, and video scripts.\n\n**Implementation Tips:**\n- Start with keyword research to map your hub and spoke topics\n- Create the hub content first, even if it's not perfect\n- Publish 2-3 spokes per week\n- Update the hub monthly to keep it fresh\n- Cross-link between related spokes\n\nHave you implemented this model? What results did you see?""",
        "category_slug": "integrated-marketing",
        "subcategory": "wheel-and-spoke",
        "tags": ["content-strategy", "hub-spoke", "SEO", "content-marketing"],
        "author_name": "Priya Sharma",
        "author_city": "Delhi",
        "author_country": "India"
    },
    {
        "title": "SWOT Analysis for Digital Marketing: A Modern Framework",
        "excerpt": "The classic SWOT analysis gets a digital-age makeover. How to apply it specifically to marketing strategy in 2025.",
        "content": """SWOT analysis is a fundamental strategic tool, but most marketers apply it too broadly. Here's how to use SWOT specifically for digital marketing strategy in 2025.\n\n**Digital Marketing SWOT Framework:**\n\n**Strengths (Internal Positives):**\n- What channels are driving the best ROI?\n- What content types perform best?\n- What's your unique brand voice/positioning?\n- What first-party data do you have?\n- What technology/tools give you an edge?\n\n**Weaknesses (Internal Negatives):**\n- Which channels are underperforming?\n- Where are gaps in your marketing team's skills?\n- What's your weakest funnel stage?\n- Where do you lack data or insights?\n- What technical debt is holding you back?\n\n**Opportunities (External Positives):**\n- Emerging platforms (new social networks, AI tools)\n- Competitor gaps you can exploit\n- Market trends aligning with your strengths\n- New technologies for personalization\n- Untapped audience segments\n\n**Threats (External Negatives):**\n- Algorithm changes on key platforms\n- New competitors entering your space\n- Privacy regulations limiting targeting\n- AI-generated content competition\n- Economic conditions affecting ad spend\n\n**Making It Actionable:**\n\nThe magic happens when you cross-reference:\n- **Strength + Opportunity** = Priority initiatives\n- **Strength + Threat** = Defensive strategies\n- **Weakness + Opportunity** = Development priorities\n- **Weakness + Threat** = Risk mitigation plans\n\nWe run this exercise quarterly with all our clients. It keeps strategy dynamic and responsive.\n\nDo you use SWOT for marketing strategy? Share your approach.""",
        "category_slug": "marketing-tools",
        "subcategory": "swot-analysis",
        "tags": ["SWOT", "strategy", "framework", "analysis"],
        "author_name": "Elena Rodriguez",
        "author_city": "Mexico City",
        "author_country": "Mexico"
    },
    {
        "title": "How Competitor Analysis Saved Our Client $3M in Wasted Ad Spend",
        "excerpt": "A systematic approach to competitive intelligence that revealed our client was fighting battles they couldn't win.",
        "content": """One of our clients was spending $500K/month on Google Ads in a category dominated by three massive competitors. Their CPA was climbing every quarter, and ROAS was declining. A thorough competitor analysis revealed why — and the pivot saved them $3M annually.\n\n**Our Competitor Analysis Process:**\n\n1. **Identify the real competitive set** — Not who you think your competitors are, but who's actually showing up for your target keywords and audiences.\n\n2. **Analyze their strategy:**\n   - Ad spend estimates (tools: SEMrush, SpyFu, SimilarWeb)\n   - Content strategy and publishing frequency\n   - Social media positioning and engagement\n   - SEO authority and backlink profile\n   - Pricing and positioning\n\n3. **Find the gaps:**\n   - Keywords they're ignoring\n   - Audiences they're not reaching\n   - Channels they're underinvesting in\n   - Content topics they haven't covered\n\n**What We Found:**\nOur client was bidding on the same 500 high-volume keywords as competitors with 10x their budget. They could never win that war.\n\n**The Pivot:**\n- Shifted 70% of ad budget to 2,000 long-tail keywords competitors ignored\n- Launched a YouTube strategy (competitors had zero video presence)\n- Built comparison content targeting competitor brand searches\n- Invested in community building on LinkedIn\n\n**Results After 6 Months:**\n- CPA dropped 42%\n- ROAS improved from 2.8x to 5.1x\n- Organic traffic grew 180%\n- $3M in annual savings from eliminated wasteful spend\n\nHow do you approach competitor analysis? Share your tools and techniques.""",
        "category_slug": "marketing-tools",
        "subcategory": "competitor-analysis",
        "tags": ["competitor-analysis", "PPC", "strategy", "cost-optimization"],
        "author_name": "David Kim",
        "author_city": "Seoul",
        "author_country": "South Korea"
    },
    {
        "title": "Building a Brand That Transcends Borders: Lessons from 5 Global Success Stories",
        "excerpt": "What do Nike, IKEA, and Spotify have in common? Their brands work everywhere while feeling local. Here's how they do it.",
        "content": """Building a brand that resonates globally while feeling locally relevant is the holy grail of marketing. Let's break down how five brands achieve this seemingly impossible balance.\n\n**1. Nike — \"Just Do It\" Is Universal, Execution Is Local**\nNike's core message of athletic empowerment translates universally. But their execution varies dramatically: cricket campaigns in India, football (soccer) in Brazil, basketball in the US. The emotion is consistent; the sport is local.\n\n**2. IKEA — Consistent Experience, Localized Product**\nIKEA stores look the same worldwide, but their catalog varies by market. Smaller furniture for Japanese apartments. Brighter colors for Scandinavian light-starved winters. The brand promise (affordable, functional design) stays constant.\n\n**3. Spotify — Personalization as Brand**\nSpotify's Wrapped campaign proves that personalization at scale can be a brand identity. Everyone gets the same experience framework but with deeply personal content. It works in every market because music is universal.\n\n**4. Airbnb — \"Belong Anywhere\" Built on Local Stories**\nAirbnb's brand is built on the promise of local experiences. Their marketing uses real hosts and real homes from each market, making the brand feel local everywhere while maintaining a consistent global identity.\n\n**5. Red Bull — Content as Brand, Globally**\nRed Bull isn't an energy drink company that does marketing. It's a media company that happens to sell energy drinks. Their content strategy spans extreme sports, music, and gaming — interests that transcend borders.\n\n**Common Threads:**\n- Strong, simple core message\n- Flexible execution framework\n- Investment in understanding local culture\n- Willingness to let go of control at the local level\n- Consistent visual and tonal identity\n\nWhat global brands inspire your work? Which ones get it wrong?""",
        "category_slug": "branding",
        "subcategory": "brand-storytelling",
        "tags": ["branding", "global", "case-study", "strategy"],
        "author_name": "Fatima Al-Hassan",
        "author_city": "Dubai",
        "author_country": "UAE"
    }
]

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "city": user.city,
        "country": user.country,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id)
    return {"token": token, "user": {"id": user_id, "name": user.name, "email": user.email, "city": user.city, "country": user.country}}

@api_router.post("/auth/login")
async def login(creds: UserLogin):
    user = await db.users.find_one({"email": creds.email}, {"_id": 0})
    if not user or not verify_password(creds.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"])
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"], "city": user["city"], "country": user["country"]}}

@api_router.get("/auth/me")
async def get_me(user=Depends(require_user)):
    return {"id": user["id"], "name": user["name"], "email": user["email"], "city": user["city"], "country": user["country"]}

# ==================== CATEGORY ROUTES ====================

@api_router.get("/categories")
async def get_categories():
    cats = await db.categories.find({"status": "approved"}, {"_id": 0}).sort("name", 1).to_list(100)
    for cat in cats:
        cat["post_count"] = await db.posts.count_documents({"category_slug": cat["slug"]})
    return cats

@api_router.get("/categories/{slug}")
async def get_category(slug: str):
    cat = await db.categories.find_one({"slug": slug, "status": "approved"}, {"_id": 0})
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    subs = await db.subcategories.find({"parent": slug}, {"_id": 0}).to_list(50)
    count = await db.posts.count_documents({"category_slug": slug})
    return {**cat, "subcategories": subs, "post_count": count}

@api_router.get("/subcategories")
async def get_subcategories():
    subs = await db.subcategories.find({}, {"_id": 0}).to_list(200)
    return subs

@api_router.post("/categories/suggest")
async def suggest_category(suggestion: CategorySuggest, user=Depends(get_current_user)):
    """Allow users to suggest a new category. It goes to 'pending' status for moderation."""
    # Generate slug
    slug = suggestion.name.lower().strip().replace(' ', '-').replace('&', 'and')
    slug = ''.join(c for c in slug if c.isalnum() or c == '-')
    
    # Check for duplicates (exact slug match or similar name)
    existing = await db.categories.find_one({"slug": slug}, {"_id": 0})
    if existing:
        if existing.get("status") == "approved":
            raise HTTPException(status_code=400, detail=f"Category '{existing['name']}' already exists.")
        else:
            raise HTTPException(status_code=400, detail=f"Category '{existing['name']}' has already been suggested and is pending review.")
    
    # Also check for similar names (case insensitive)
    existing_similar = await db.categories.find_one({"name": {"$regex": f"^{suggestion.name.strip()}$", "$options": "i"}}, {"_id": 0})
    if existing_similar:
        if existing_similar.get("status") == "approved":
            raise HTTPException(status_code=400, detail=f"Category '{existing_similar['name']}' already exists.")
        else:
            raise HTTPException(status_code=400, detail=f"Category '{existing_similar['name']}' has already been suggested and is pending review.")
    
    # Pick a color from the palette
    cat_count = await db.categories.count_documents({})
    color = CATEGORY_COLORS[cat_count % len(CATEGORY_COLORS)]
    
    author_info = {}
    if user:
        author_info = {"suggested_by": user["name"], "suggested_by_id": user["id"]}
    elif suggestion:
        author_info = {"suggested_by": "Guest", "suggested_by_id": None}
    
    cat_doc = {
        "slug": slug,
        "name": suggestion.name.strip(),
        "description": suggestion.description.strip(),
        "color": color,
        "icon": "tag",
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        **author_info
    }
    await db.categories.insert_one(cat_doc)
    return {"slug": slug, "name": suggestion.name, "status": "pending", "message": "Your topic suggestion has been submitted for review. It will appear once approved."}

@api_router.get("/categories/pending/list")
async def get_pending_categories():
    """Get pending categories (for moderation view)"""
    cats = await db.categories.find({"status": "pending"}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return cats

@api_router.put("/categories/{slug}/approve")
async def approve_category(slug: str):
    """Approve a pending category"""
    result = await db.categories.update_one({"slug": slug, "status": "pending"}, {"$set": {"status": "approved"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pending category not found")
    cat = await db.categories.find_one({"slug": slug}, {"_id": 0})
    return cat

@api_router.delete("/categories/{slug}/reject")
async def reject_category(slug: str):
    """Reject and remove a pending category"""
    result = await db.categories.delete_one({"slug": slug, "status": "pending"})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pending category not found")
    return {"message": "Category suggestion rejected and removed"}

# ==================== POST ROUTES ====================

@api_router.get("/posts")
async def get_posts(category: Optional[str] = None, subcategory: Optional[str] = None, search: Optional[str] = None, limit: int = 50, skip: int = 0):
    query = {}
    if category:
        query["category_slug"] = category
    if subcategory:
        query["subcategory"] = subcategory
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    posts = await db.posts.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.posts.count_documents(query)
    return {"posts": posts, "total": total}

@api_router.get("/posts/{post_id}")
async def get_post(post_id: str):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.posts.update_one({"id": post_id}, {"$inc": {"views": 1}})
    comment_count = await db.comments.count_documents({"post_id": post_id})
    post["comment_count"] = comment_count
    return post

@api_router.post("/posts")
async def create_post(post: PostCreate, user=Depends(get_current_user)):
    post_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    is_guest = user is None
    post_doc = {
        "id": post_id,
        "title": post.title,
        "content": post.content,
        "excerpt": post.excerpt,
        "category_slug": post.category_slug,
        "subcategory": post.subcategory,
        "tags": post.tags,
        "cover_image": post.cover_image,
        "is_guest": is_guest,
        "likes": 0,
        "views": 0,
        "created_at": now,
        "updated_at": now
    }
    if is_guest and post.guest_author:
        post_doc["author_name"] = post.guest_author.name
        post_doc["author_city"] = post.guest_author.city
        post_doc["author_country"] = post.guest_author.country
        post_doc["author_id"] = None
        post_doc["expires_at"] = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    elif user:
        post_doc["author_name"] = user["name"]
        post_doc["author_city"] = user["city"]
        post_doc["author_country"] = user["country"]
        post_doc["author_id"] = user["id"]
        post_doc["expires_at"] = None
    else:
        raise HTTPException(status_code=400, detail="Guest author info required for anonymous posts")
    
    await db.posts.insert_one(post_doc)
    created = await db.posts.find_one({"id": post_id}, {"_id": 0})
    
    # Send email notifications (fire and forget)
    asyncio.create_task(notify_new_post_to_category_followers(post_doc))
    
    return created

@api_router.post("/posts/{post_id}/like")
async def like_post(post_id: str, user=Depends(get_current_user)):
    result = await db.posts.update_one({"id": post_id}, {"$inc": {"likes": 1}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    # Track the like if user is logged in
    if user:
        await db.user_likes.update_one(
            {"user_id": user["id"], "post_id": post_id},
            {"$set": {"user_id": user["id"], "post_id": post_id, "created_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
    post = await db.posts.find_one({"id": post_id}, {"_id": 0, "likes": 1})
    return {"likes": post["likes"]}

# ==================== COMMENT ROUTES ====================

@api_router.get("/posts/{post_id}/comments")
async def get_comments(post_id: str):
    comments = await db.comments.find({"post_id": post_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return comments

@api_router.post("/posts/{post_id}/comments")
async def create_comment(post_id: str, comment: CommentCreate, user=Depends(get_current_user)):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    comment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    is_guest = user is None
    comment_doc = {
        "id": comment_id,
        "post_id": post_id,
        "content": comment.content,
        "is_guest": is_guest,
        "created_at": now
    }
    if is_guest and comment.guest_author:
        comment_doc["author_name"] = comment.guest_author.name
        comment_doc["author_city"] = comment.guest_author.city
        comment_doc["author_country"] = comment.guest_author.country
    elif user:
        comment_doc["author_name"] = user["name"]
        comment_doc["author_city"] = user["city"]
        comment_doc["author_country"] = user["country"]
    else:
        raise HTTPException(status_code=400, detail="Guest author info required for anonymous comments")
    
    await db.comments.insert_one(comment_doc)
    created = await db.comments.find_one({"id": comment_id}, {"_id": 0})
    
    # Broadcast via WebSocket
    asyncio.create_task(ws_manager.broadcast(post_id, {"type": "new_comment", "comment": created}))
    
    # Email notification to post author (fire and forget)
    asyncio.create_task(notify_post_author_of_comment(post, comment_doc))
    
    return created

# ==================== SEED ROUTE ====================

@api_router.post("/seed")
async def seed_data():
    existing = await db.posts.count_documents({})
    if existing > 0:
        return {"message": f"Database already has {existing} posts. Skipping seed."}
    
    now = datetime.now(timezone.utc)
    for i, post_data in enumerate(SEED_POSTS):
        post_doc = {
            "id": str(uuid.uuid4()),
            "title": post_data["title"],
            "content": post_data["content"],
            "excerpt": post_data["excerpt"],
            "category_slug": post_data["category_slug"],
            "subcategory": post_data.get("subcategory"),
            "tags": post_data["tags"],
            "author_name": post_data["author_name"],
            "author_city": post_data["author_city"],
            "author_country": post_data["author_country"],
            "author_id": None,
            "is_guest": False,
            "is_seed": True,
            "likes": (i + 1) * 7,
            "views": (i + 1) * 23,
            "created_at": (now - timedelta(days=i * 3)).isoformat(),
            "updated_at": (now - timedelta(days=i * 3)).isoformat(),
            "expires_at": None
        }
        await db.posts.insert_one(post_doc)
    
    return {"message": f"Seeded {len(SEED_POSTS)} blog posts successfully"}

@api_router.get("/stats")
async def get_stats():
    total_posts = await db.posts.count_documents({})
    total_comments = await db.comments.count_documents({})
    # Count unique contributors (registered users + unique seed/guest author names)
    unique_authors = await db.posts.distinct("author_name")
    countries = await db.posts.distinct("author_country")
    return {
        "total_posts": total_posts,
        "total_comments": total_comments,
        "contributors": len(unique_authors),
        "countries_represented": len(countries)
    }

# ==================== PROFILE ROUTES ====================

@api_router.get("/profile/posts")
async def get_user_posts(user=Depends(require_user)):
    posts = await db.posts.find({"author_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return posts

@api_router.get("/profile/interactions")
async def get_user_interactions(user=Depends(require_user)):
    # Get posts the user liked
    liked_docs = await db.user_likes.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    liked_post_ids = [d["post_id"] for d in liked_docs]
    
    # Get posts the user commented on
    commented_docs = await db.comments.find({"author_name": user["name"], "is_guest": False}, {"_id": 0, "post_id": 1}).to_list(500)
    commented_post_ids = list(set([d["post_id"] for d in commented_docs]))
    
    # Combine unique post IDs (exclude user's own posts)
    all_ids = list(set(liked_post_ids + commented_post_ids))
    
    if not all_ids:
        return []
    
    posts = await db.posts.find(
        {"id": {"$in": all_ids}, "author_id": {"$ne": user["id"]}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Mark interaction type on each post
    for p in posts:
        p["liked"] = p["id"] in liked_post_ids
        p["commented"] = p["id"] in commented_post_ids
    
    return posts

@api_router.get("/profile/colors")
async def get_profile_colors(user=Depends(require_user)):
    prefs = await db.user_prefs.find_one({"user_id": user["id"]}, {"_id": 0})
    if not prefs:
        return {"my_posts_color": "#3B82F6", "interacted_color": "#A855F7"}
    return {"my_posts_color": prefs.get("my_posts_color", "#3B82F6"), "interacted_color": prefs.get("interacted_color", "#A855F7")}

@api_router.put("/profile/colors")
async def update_profile_colors(colors: ProfileColors, user=Depends(require_user)):
    await db.user_prefs.update_one(
        {"user_id": user["id"]},
        {"$set": {"user_id": user["id"], "my_posts_color": colors.my_posts_color, "interacted_color": colors.interacted_color}},
        upsert=True
    )
    return {"my_posts_color": colors.my_posts_color, "interacted_color": colors.interacted_color}

@api_router.get("/posts/{post_id}/comments/live")
async def get_comments_live(post_id: str):
    """Get comments sorted oldest-first for chat-like view"""
    comments = await db.comments.find({"post_id": post_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return comments

# ==================== IMAGE UPLOAD ====================

@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    # Limit to 5MB
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")
    
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = UPLOADS_DIR / filename
    
    with open(filepath, 'wb') as f:
        f.write(contents)
    
    url = f"/api/uploads/{filename}"
    return {"url": url, "filename": filename}

# ==================== EMAIL NOTIFICATIONS ====================

async def send_email_notification(to_email: str, subject: str, html_content: str):
    """Send email notification via Resend (non-blocking)"""
    if not resend.api_key:
        return
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }
        await asyncio.to_thread(resend.Emails.send, params)
    except Exception as e:
        logging.getLogger(__name__).error(f"Email send failed: {e}")

async def notify_post_author_of_comment(post, comment_doc):
    """Notify post author when someone comments on their post"""
    if not post.get("author_id"):
        return  # Can't notify seed/guest posts
    author = await db.users.find_one({"id": post["author_id"]}, {"_id": 0})
    if not author or not author.get("email"):
        return
    # Don't notify if the commenter is the author
    if comment_doc.get("author_name") == author.get("name"):
        return
    
    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-weight: 900; font-size: 20px;">
          <span style="color: #EF4444;">B</span><span style="color: #F97316;">L</span><span style="color: #FACC15;">O</span><span style="color: #22C55E;">G</span><span style="color: #14B8A6;">S</span>
          <span style="color: #22C55E;">4</span>
          <span style="color: #EF4444;">B</span><span style="color: #3B82F6;">L</span><span style="color: #22C55E;">O</span><span style="color: #A855F7;">C</span><span style="color: #3B82F6;">K</span><span style="color: #14B8A6;">S</span>
        </span>
      </div>
      <h2 style="color: #0F172A; font-size: 18px; margin-bottom: 8px;">New comment on your post</h2>
      <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
        <strong style="color: #0F172A;">{comment_doc.get('author_name', 'Someone')}</strong> 
        from {comment_doc.get('author_city', 'somewhere')} commented on 
        <strong style="color: #0F172A;">"{post['title']}"</strong>:
      </p>
      <div style="background: #F8FAFC; border-left: 3px solid #3B82F6; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0;">{comment_doc['content'][:300]}</p>
      </div>
      <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">You're receiving this because you're a registered author on Blogs 4 Blocks.</p>
    </div>
    """
    await send_email_notification(
        author["email"],
        f"New comment on \"{post['title'][:50]}\"",
        html
    )

async def notify_new_post_to_category_followers(post_doc):
    """Notify registered users who have engaged with posts in this category"""
    category = post_doc.get("category_slug")
    if not category:
        return
    
    # Find posts in same category
    cat_posts = await db.posts.find({"category_slug": category}, {"_id": 0, "id": 1}).to_list(500)
    cat_post_ids = [p["id"] for p in cat_posts]
    
    # Find users who commented on these posts
    commenters = await db.comments.distinct("author_name", {"post_id": {"$in": cat_post_ids}, "is_guest": False})
    
    # Find users who liked these posts
    likers_docs = await db.user_likes.find({"post_id": {"$in": cat_post_ids}}, {"_id": 0, "user_id": 1}).to_list(500)
    liker_ids = list(set([d["user_id"] for d in likers_docs]))
    
    # Get unique user emails (exclude the post author)
    notified = set()
    
    # Notify commenters
    for name in commenters:
        if name == post_doc.get("author_name"):
            continue
        user = await db.users.find_one({"name": name}, {"_id": 0})
        if user and user.get("email") and user["email"] not in notified:
            notified.add(user["email"])
    
    # Notify likers
    for uid in liker_ids:
        if uid == post_doc.get("author_id"):
            continue
        user = await db.users.find_one({"id": uid}, {"_id": 0})
        if user and user.get("email") and user["email"] not in notified:
            notified.add(user["email"])
    
    cat_name = category.replace('-', ' ').title()
    for email in notified:
        html = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-weight: 900; font-size: 20px;">
              <span style="color: #EF4444;">B</span><span style="color: #F97316;">L</span><span style="color: #FACC15;">O</span><span style="color: #22C55E;">G</span><span style="color: #14B8A6;">S</span>
              <span style="color: #22C55E;">4</span>
              <span style="color: #EF4444;">B</span><span style="color: #3B82F6;">L</span><span style="color: #22C55E;">O</span><span style="color: #A855F7;">C</span><span style="color: #3B82F6;">K</span><span style="color: #14B8A6;">S</span>
            </span>
          </div>
          <h2 style="color: #0F172A; font-size: 18px; margin-bottom: 8px;">New post in {cat_name}</h2>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
            <strong style="color: #0F172A;">{post_doc.get('author_name', 'Someone')}</strong> 
            from {post_doc.get('author_city', 'somewhere')} published a new post:
          </p>
          <div style="background: #F8FAFC; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <h3 style="color: #0F172A; font-size: 16px; margin: 0 0 8px 0;">{post_doc['title']}</h3>
            <p style="color: #64748B; font-size: 13px; line-height: 1.5; margin: 0;">{post_doc.get('excerpt', '')[:200]}</p>
          </div>
          <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">You're receiving this because you've engaged with {cat_name} posts on Blogs 4 Blocks.</p>
        </div>
        """
        await send_email_notification(email, f"New in {cat_name}: \"{post_doc['title'][:50]}\"", html)

# ==================== WEBSOCKET MANAGER ====================

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, post_id: str, websocket: WebSocket):
        await websocket.accept()
        if post_id not in self.active_connections:
            self.active_connections[post_id] = set()
        self.active_connections[post_id].add(websocket)
    
    def disconnect(self, post_id: str, websocket: WebSocket):
        if post_id in self.active_connections:
            self.active_connections[post_id].discard(websocket)
            if not self.active_connections[post_id]:
                del self.active_connections[post_id]
    
    async def broadcast(self, post_id: str, message: dict):
        if post_id not in self.active_connections:
            return
        dead = []
        for ws in self.active_connections[post_id]:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active_connections[post_id].discard(ws)

ws_manager = ConnectionManager()

@app.websocket("/api/ws/comments/{post_id}")
async def websocket_comments(websocket: WebSocket, post_id: str):
    await ws_manager.connect(post_id, websocket)
    try:
        while True:
            # Keep connection alive, listen for pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(post_id, websocket)
    except Exception:
        ws_manager.disconnect(post_id, websocket)

# ==================== APP SETUP ====================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    await db.posts.create_index("category_slug")
    await db.posts.create_index("created_at")
    await db.posts.create_index("author_id")
    await db.comments.create_index("post_id")
    await db.users.create_index("email", unique=True)
    await db.user_likes.create_index([("user_id", 1), ("post_id", 1)], unique=True)
    await db.user_prefs.create_index("user_id", unique=True)
    await db.categories.create_index("slug", unique=True)
    await db.subcategories.create_index("slug", unique=True)
    
    # Seed categories into MongoDB (upsert to avoid duplicates)
    for cat in SEED_CATEGORIES:
        await db.categories.update_one(
            {"slug": cat["slug"]},
            {"$setOnInsert": cat},
            upsert=True
        )
    logger.info(f"Ensured {len(SEED_CATEGORIES)} categories in database")
    
    # Seed subcategories
    for sub in SEED_SUBCATEGORIES:
        await db.subcategories.update_one(
            {"slug": sub["slug"]},
            {"$setOnInsert": sub},
            upsert=True
        )
    logger.info(f"Ensured {len(SEED_SUBCATEGORIES)} subcategories in database")
    
    # Auto-seed posts on startup
    existing = await db.posts.count_documents({})
    if existing == 0:
        now = datetime.now(timezone.utc)
        for i, post_data in enumerate(SEED_POSTS):
            post_doc = {
                "id": str(uuid.uuid4()),
                "title": post_data["title"],
                "content": post_data["content"],
                "excerpt": post_data["excerpt"],
                "category_slug": post_data["category_slug"],
                "subcategory": post_data.get("subcategory"),
                "tags": post_data["tags"],
                "author_name": post_data["author_name"],
                "author_city": post_data["author_city"],
                "author_country": post_data["author_country"],
                "author_id": None,
                "is_guest": False,
                "is_seed": True,
                "likes": (i + 1) * 7,
                "views": (i + 1) * 23,
                "created_at": (now - timedelta(days=i * 3)).isoformat(),
                "updated_at": (now - timedelta(days=i * 3)).isoformat(),
                "expires_at": None
            }
            await db.posts.insert_one(post_doc)
        logger.info(f"Auto-seeded {len(SEED_POSTS)} blog posts")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
