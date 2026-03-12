import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { MapPin, Heart, Mail, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

const RAINBOW = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#14B8A6', '#3B82F6', '#A855F7', '#EC4899', '#A16207'];

export default function Footer() {
  const { categories, stats, API } = useApp();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      await axios.post(`${API}/newsletter/subscribe`, { email: email.trim() });
      setSubscribed(true);
      toast.success('Subscribed to weekly digest!');
    } catch (err) {
      toast.error('Failed to subscribe');
    }
    setSubscribing(false);
  };

  return (
    <footer className="bg-gray-950 text-white mt-auto" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-0.5 mb-4">
              {"BLOGS4BLOCKS".split('').map((char, i) => (
                <span key={i} className="font-heading text-lg font-black" style={{ color: RAINBOW[i % RAINBOW.length] }}>
                  {char}
                </span>
              ))}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              A global open forum for marketing professionals to share strategies, insights, and experiences from every corner of the world.
            </p>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <MapPin className="w-3.5 h-3.5" />
              <span>Based in New York City</span>
            </div>
          </div>

          {/* Topics */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Topics</h4>
            <div className="flex flex-col gap-2.5">
              {categories.slice(0, 7).map(cat => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors no-underline"
                  data-testid={`footer-cat-${cat.slug}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors no-underline" data-testid="footer-home">Home</Link>
              <Link to="/write" className="text-sm text-gray-300 hover:text-white transition-colors no-underline" data-testid="footer-write">Write a Post</Link>
              <Link to="/about" className="text-sm text-gray-300 hover:text-white transition-colors no-underline" data-testid="footer-about">About</Link>
              <Link to="/auth" className="text-sm text-gray-300 hover:text-white transition-colors no-underline" data-testid="footer-auth">Sign In / Register</Link>
            </div>
          </div>

          {/* Newsletter + Stats */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Weekly Digest</h4>
            {subscribed ? (
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-4" data-testid="footer-subscribed">
                <Check className="w-4 h-4" /> Subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mb-4" data-testid="footer-newsletter-form">
                <p className="text-xs text-gray-500 mb-2">Top posts in your inbox every Monday.</p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 rounded-full h-9 text-xs"
                    data-testid="footer-newsletter-email"
                  />
                  <Button type="submit" disabled={subscribing} size="sm" className="bg-b4b-blue text-white hover:bg-blue-600 rounded-full text-xs px-3" data-testid="footer-newsletter-btn">
                    <Mail className="w-3 h-3" />
                  </Button>
                </div>
              </form>
            )}
            {stats && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xl font-heading font-bold text-b4b-blue">{stats.total_posts}</div>
                  <div className="text-xs text-gray-500">Posts</div>
                </div>
                <div>
                  <div className="text-xl font-heading font-bold text-b4b-green">{stats.total_comments}</div>
                  <div className="text-xs text-gray-500">Comments</div>
                </div>
                <div>
                  <div className="text-xl font-heading font-bold text-b4b-purple">{stats.contributors || 0}</div>
                  <div className="text-xs text-gray-500">Contributors</div>
                </div>
                <div>
                  <div className="text-xl font-heading font-bold text-b4b-orange">{stats.countries_represented}</div>
                  <div className="text-xs text-gray-500">Countries</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Blogs 4 Blocks. Built with <Heart className="w-3 h-3 inline text-b4b-red" /> in NYC for the world.
          </p>
          <p className="text-xs text-gray-600">
            Marketing professionals helping marketing professionals.
          </p>
        </div>
      </div>
    </footer>
  );
}
