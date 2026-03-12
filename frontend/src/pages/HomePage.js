import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import BlogCard from '../components/BlogCard';
import { ArrowRight, Globe, Users, PenLine, TrendingUp, Sparkles, Search, Flame, Mail, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const CITY_IMAGES = [
  'https://images.unsplash.com/photo-1603547142979-56242264e65c?w=600&q=75',
  'https://images.unsplash.com/photo-1769298084996-8ed5d3a72870?w=600&q=75',
  'https://images.unsplash.com/photo-1760459477099-ad81fd11d7c6?w=600&q=75',
  'https://images.unsplash.com/photo-1637329096986-62486d0c4380?w=600&q=75',
];

const RAINBOW = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#14B8A6', '#3B82F6', '#A855F7', '#EC4899', '#A16207', '#EF4444', '#3B82F6', '#22C55E', '#F97316'];
const TITLE = "BLOGS 4 BLOCKS";

const CATEGORY_ICONS = {
  'social-media': '📱',
  'seo-sem': '🔍',
  'influencer-marketing': '🌟',
  'integrated-marketing': '🔗',
  'consumer-behavior': '🧠',
  'branding': '🏷️',
  'marketing-tools': '🛠️',
  'digital-marketing': '💻',
  'marketing-and-ai': '🤖',
  'keywords': '🔑',
  'careers': '💼',
};

export default function HomePage() {
  const { categories, stats, API } = useApp();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    axios.get(`${API}/posts?limit=6`).then(res => setPosts(res.data.posts)).catch(() => {});
    axios.get(`${API}/posts/popular/list?limit=4`).then(res => setPopularPosts(res.data)).catch(() => {});
  }, [API]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribing(true);
    try {
      await axios.post(`${API}/newsletter/subscribe`, { email: newsletterEmail.trim() });
      setSubscribed(true);
      toast.success('You\'re subscribed to the weekly digest!');
    } catch (err) {
      toast.error('Failed to subscribe. Try again.');
    }
    setSubscribing(false);
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        {/* City collage background */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {CITY_IMAGES.map((img, i) => (
            <div key={i} className="relative overflow-hidden">
              <img
                src={img}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-white/85" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            {/* Rainbow title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black tracking-tighter mb-6 leading-[0.9]" data-testid="hero-title">
              {TITLE.split('').map((char, i) => (
                <span
                  key={i}
                  className="rainbow-letter"
                  style={{
                    color: char === ' ' ? 'transparent' : RAINBOW[i % RAINBOW.length],
                    textShadow: char !== ' ' ? '2px 2px 0px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
              A global open forum where marketing professionals share strategies, insights, and real-world experiences from every corner of the world.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mb-8" data-testid="hero-search-form">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search marketing topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/90 border-2 border-gray-200 focus:border-black rounded-full h-12 text-base"
                  data-testid="hero-search-input"
                />
              </div>
              <Button
                type="submit"
                className="bg-black text-white hover:bg-gray-800 rounded-full h-12 px-6 font-bold shadow-[3px_3px_0px_0px_rgba(59,130,246,0.5)] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)] transition-all"
                data-testid="hero-search-btn"
              >
                Search
              </Button>
            </form>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate('/write')}
                className="bg-black text-white hover:bg-gray-800 rounded-full font-bold px-8 py-3 h-auto text-base shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(59,130,246,0.5)] transition-all"
                data-testid="hero-write-btn"
              >
                <PenLine className="w-5 h-5 mr-2" />
                Share Your Strategy
              </Button>
              <Button
                variant="outline"
                onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-black border-2 border-black hover:bg-gray-50 rounded-full font-bold px-8 py-3 h-auto text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                data-testid="hero-explore-btn"
              >
                Explore Topics
              </Button>
            </div>
          </motion.div>

          {/* Stats strip */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-6 mt-12"
            >
              {[
                { icon: <TrendingUp className="w-4 h-4" />, value: stats.total_posts, label: 'Posts', color: '#3B82F6' },
                { icon: <Users className="w-4 h-4" />, value: stats.contributors || 0, label: 'Contributors', color: '#A855F7' },
                { icon: <Globe className="w-4 h-4" />, value: stats.countries_represented, label: 'Countries', color: '#22C55E' },
                { icon: <Sparkles className="w-4 h-4" />, value: stats.total_comments, label: 'Discussions', color: '#F97316' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-100">
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                  <span className="font-heading font-bold text-lg">{stat.value}</span>
                  <span className="text-sm text-gray-500">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section id="categories" className="py-16 md:py-24 bg-white" data-testid="categories-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight text-gray-900 mb-3" data-testid="categories-heading">
              Explore Marketing Topics
            </h2>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl">
              Dive into discussions from marketing professionals across every discipline and every continent.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="categories-grid">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Link
                  to={`/category/${cat.slug}`}
                  className="relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between no-underline group transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-gray-200 min-h-[160px]"
                  style={{ backgroundColor: `${cat.color}10` }}
                  data-testid={`category-card-${cat.slug}`}
                >
                  <div>
                    <span className="text-3xl mb-3 block">{CATEGORY_ICONS[cat.slug] || '📊'}</span>
                    <h3 className="font-heading font-bold text-lg text-gray-900 mb-1 group-hover:translate-x-1 transition-transform">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{cat.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                      {cat.post_count} posts
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST POSTS */}
      <section className="py-16 md:py-24 bg-gray-50/50" data-testid="latest-posts-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight text-gray-900 mb-3" data-testid="latest-heading">
                Latest Discussions
              </h2>
              <p className="text-base md:text-lg text-gray-500">
                Fresh perspectives from marketing professionals worldwide.
              </p>
            </div>
            <Link
              to="/category/all"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-b4b-blue hover:underline no-underline"
              data-testid="view-all-posts"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="posts-grid">
            {posts.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>

          <div className="sm:hidden mt-8 text-center">
            <Link
              to="/category/all"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-b4b-blue no-underline"
              data-testid="view-all-posts-mobile"
            >
              View All Posts <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* POPULAR POSTS */}
      {popularPosts.length > 0 && (
        <section className="py-16 md:py-24 bg-white" data-testid="popular-posts-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-6 h-6 text-orange-500" />
                <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight text-gray-900" data-testid="popular-heading">
                  Trending Now
                </h2>
              </div>
              <p className="text-base md:text-lg text-gray-500">
                The most liked and viewed posts from the community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" data-testid="popular-posts-grid">
              {popularPosts.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEWSLETTER SECTION */}
      <section className="py-16 md:py-24 bg-gray-50/50" data-testid="newsletter-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-950 to-black p-8 md:p-14">
            <div className="absolute top-0 right-0 w-64 h-64 bg-b4b-blue/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-b4b-purple/10 rounded-full blur-3xl" />
            <div className="relative max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-6 h-6 text-b4b-blue" />
                <span className="text-sm font-semibold text-b4b-blue uppercase tracking-wider">Weekly Digest</span>
              </div>
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-3 tracking-tight" data-testid="newsletter-heading">
                Get the best marketing insights delivered weekly
              </h2>
              <p className="text-gray-400 text-sm md:text-base mb-6">
                Join the community. Every Monday, we curate the top posts, trending topics, and fresh perspectives from marketing professionals worldwide.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-green-400 font-semibold" data-testid="newsletter-success">
                  <Check className="w-5 h-5" /> You're subscribed! Check your inbox on Monday.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md" data-testid="newsletter-form">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="bg-white/10 border-gray-700 text-white placeholder:text-gray-500 rounded-full h-12"
                    data-testid="newsletter-email-input"
                  />
                  <Button
                    type="submit"
                    disabled={subscribing}
                    className="bg-b4b-blue text-white hover:bg-blue-600 rounded-full h-12 px-6 font-bold"
                    data-testid="newsletter-submit-btn"
                  >
                    {subscribing ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 md:py-24 bg-white" data-testid="cta-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gray-950 p-8 md:p-16">
            {/* Subtle city images in background */}
            <div className="absolute inset-0 grid grid-cols-4 opacity-10">
              {CITY_IMAGES.map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-full object-cover" />
              ))}
            </div>
            <div className="relative text-center">
              <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4 tracking-tight" data-testid="cta-heading">
                Your Market. Your Insights. Your Voice.
              </h2>
              <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                Whether you're a seasoned CMO in London or a startup marketer in Nairobi — your perspective matters. Join the global conversation.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => navigate('/write')}
                  className="bg-white text-black hover:bg-gray-100 rounded-full font-bold px-8 py-3 h-auto text-base shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)] hover:translate-y-[-2px] transition-all"
                  data-testid="cta-write-btn"
                >
                  <PenLine className="w-5 h-5 mr-2" />
                  Write Your First Post
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white rounded-full font-bold px-8 py-3 h-auto text-base transition-all"
                  data-testid="cta-join-btn"
                >
                  Join the Community
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
