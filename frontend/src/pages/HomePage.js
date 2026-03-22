import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import BlogCard from '../components/BlogCard';
import { ArrowRight, Globe, Users, PenLine, TrendingUp, Search, Flame, Mail, Check, Megaphone, BarChart3, Share2, Brain, Palette, Wrench, Monitor, Cpu, Key, Briefcase } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1773720182544-e955f21410b3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwzfHxueWMlMjBhcmNoaXRlY3R1cmUlMjBtb2Rlcm4lMjBtaW5pbWFsaXN0fGVufDB8fHx8MTc3NDE0NDkyOHww&ixlib=rb-4.1.0&q=85&w=1600';

const CATEGORY_ICONS = {
  'social-media': <Megaphone className="w-5 h-5" />,
  'seo-sem': <BarChart3 className="w-5 h-5" />,
  'influencer-marketing': <Share2 className="w-5 h-5" />,
  'integrated-marketing': <Globe className="w-5 h-5" />,
  'consumer-behavior': <Brain className="w-5 h-5" />,
  'branding': <Palette className="w-5 h-5" />,
  'marketing-tools': <Wrench className="w-5 h-5" />,
  'digital-marketing': <Monitor className="w-5 h-5" />,
  'marketing-and-ai': <Cpu className="w-5 h-5" />,
  'keywords': <Key className="w-5 h-5" />,
  'careers': <Briefcase className="w-5 h-5" />,
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
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-[#FDFCF8]/90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            {/* Eyebrow */}
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-grey mb-6" data-testid="hero-eyebrow">
              Marketing Insights from Every Block
            </p>

            {/* Title — editorial, no rainbow */}
            <h1 className="font-heading font-light text-6xl md:text-8xl tracking-tighter mb-8 leading-[0.9] text-[#1A1A1A]" data-testid="hero-title">
              Blogs<span className="font-black">4</span>Blocks
            </h1>

            <p className="text-lg md:text-xl text-brand-grey mb-10 leading-relaxed max-w-xl">
              A global open forum where marketing professionals share strategies, insights, and real-world experiences from every corner of the world.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-lg mb-10" data-testid="hero-search-form">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-grey" />
                <Input
                  placeholder="Search marketing topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-white border border-[#E5E5E5] focus:border-[#1A1A1A] rounded-none h-12 text-sm"
                  data-testid="hero-search-input"
                />
              </div>
              <Button
                type="submit"
                className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none h-12 px-6 text-xs font-bold uppercase tracking-widest transition-colors"
                data-testid="hero-search-btn"
              >
                Search
              </Button>
            </form>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => navigate('/write')}
                className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none font-bold px-8 py-3 h-auto text-xs uppercase tracking-widest transition-colors"
                data-testid="hero-write-btn"
              >
                <PenLine className="w-4 h-4 mr-2" />
                Share Your Strategy
              </Button>
              <Button
                variant="outline"
                onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-transparent text-[#1A1A1A] border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white rounded-none font-bold px-8 py-3 h-auto text-xs uppercase tracking-widest transition-colors"
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
              className="flex flex-wrap gap-8 mt-16 pt-8 border-t border-[#E5E5E5]/60"
            >
              {[
                { icon: <TrendingUp className="w-4 h-4" />, value: stats.total_posts, label: 'Posts' },
                { icon: <Users className="w-4 h-4" />, value: stats.contributors || 0, label: 'Contributors' },
                { icon: <Globe className="w-4 h-4" />, value: stats.countries_represented, label: 'Countries' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-brand-grey">{stat.icon}</span>
                  <span className="font-heading font-black text-2xl text-[#1A1A1A]">{stat.value}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-grey">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section id="categories" className="py-20 md:py-32" data-testid="categories-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-grey mb-3">Explore</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight text-[#1A1A1A]" data-testid="categories-heading">
              Marketing Topics
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[#E5E5E5]" data-testid="categories-grid">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  to={`/category/${cat.slug}`}
                  className="relative block bg-[#FDFCF8] p-6 no-underline group hover:bg-white transition-colors min-h-[160px] flex flex-col justify-between"
                  data-testid={`category-card-${cat.slug}`}
                >
                  <div>
                    <span className="text-brand-grey mb-4 block group-hover:text-[#1A1A1A] transition-colors">
                      {CATEGORY_ICONS[cat.slug] || <BarChart3 className="w-5 h-5" />}
                    </span>
                    <h3 className="font-heading font-bold text-base text-[#1A1A1A] mb-1 group-hover:translate-x-1 transition-transform">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-brand-grey leading-relaxed line-clamp-2">{cat.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-grey">
                      {cat.post_count} posts
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-grey opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST POSTS */}
      <section className="py-20 md:py-32 border-t border-[#E5E5E5]" data-testid="latest-posts-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-grey mb-3">Fresh Perspectives</p>
              <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight text-[#1A1A1A]" data-testid="latest-heading">
                Latest Discussions
              </h2>
            </div>
            <Link
              to="/category/all"
              className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-brand-red no-underline transition-colors"
              data-testid="view-all-posts"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="posts-grid">
            {posts.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>

          <div className="sm:hidden mt-10 text-center">
            <Link
              to="/category/all"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1A1A1A] no-underline"
              data-testid="view-all-posts-mobile"
            >
              View All Posts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* POPULAR POSTS */}
      {popularPosts.length > 0 && (
        <section className="py-20 md:py-32 border-t border-[#E5E5E5]" data-testid="popular-posts-section">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-3">
                <Flame className="w-5 h-5 text-brand-red" />
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-grey">Most Engaged</p>
              </div>
              <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight text-[#1A1A1A]" data-testid="popular-heading">
                Trending Now
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="popular-posts-grid">
              {popularPosts.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEWSLETTER SECTION */}
      <section className="py-20 md:py-32 border-t border-[#E5E5E5]" data-testid="newsletter-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="bg-[#1A1A1A] p-10 md:p-20">
            <div className="max-w-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-yellow mb-6">Weekly Digest</p>
              <h2 className="font-heading font-light text-3xl md:text-4xl text-white mb-4 tracking-tight leading-tight" data-testid="newsletter-heading">
                Get the best marketing insights delivered weekly
              </h2>
              <p className="text-brand-grey text-sm leading-relaxed mb-8">
                Join the community. Every Monday, we curate the top posts, trending topics, and fresh perspectives from marketing professionals worldwide.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-brand-green font-semibold text-sm" data-testid="newsletter-success">
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
                    className="bg-white/10 border-[#333] text-white placeholder:text-[#666] rounded-none h-12 text-sm focus:border-brand-yellow"
                    data-testid="newsletter-email-input"
                  />
                  <Button
                    type="submit"
                    disabled={subscribing}
                    className="bg-brand-yellow text-[#1A1A1A] hover:bg-[#E5B800] rounded-none h-12 px-6 font-bold uppercase tracking-widest text-xs transition-colors"
                    data-testid="newsletter-submit-btn"
                  >
                    {subscribing ? '...' : 'Subscribe'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 md:py-32 border-t border-[#E5E5E5]" data-testid="cta-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-grey mb-6">Join the Conversation</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-[#1A1A1A] mb-6 tracking-tight" data-testid="cta-heading">
              Your Market. Your Insights. Your Voice.
            </h2>
            <p className="text-base text-brand-grey max-w-lg mx-auto mb-10 leading-relaxed">
              Whether you're a seasoned CMO in London or a startup marketer in Nairobi — your perspective matters.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => navigate('/write')}
                className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none font-bold px-8 py-3 h-auto text-xs uppercase tracking-widest transition-colors"
                data-testid="cta-write-btn"
              >
                <PenLine className="w-4 h-4 mr-2" />
                Write Your First Post
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white rounded-none font-bold px-8 py-3 h-auto text-xs uppercase tracking-widest transition-colors"
                data-testid="cta-join-btn"
              >
                Join the Community
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
