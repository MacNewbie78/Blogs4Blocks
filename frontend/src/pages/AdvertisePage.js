import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { Megaphone, Users, Globe, FileText, Mail, TrendingUp, Check, ArrowRight, BarChart3, Target, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdvertisePage() {
  const { categories, API } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    website: '',
    budget_range: '',
    message: '',
    preferred_categories: [],
  });

  useEffect(() => {
    axios.get(`${API}/advertise/stats`).then(res => setStats(res.data)).catch(() => {});
  }, [API]);

  const toggleCategory = (slug) => {
    setForm(prev => ({
      ...prev,
      preferred_categories: prev.preferred_categories.includes(slug)
        ? prev.preferred_categories.filter(s => s !== slug)
        : [...prev.preferred_categories, slug]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_name || !form.contact_name || !form.email || !form.message) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/advertise/inquiry`, form);
      setSubmitted(true);
      toast.success('Inquiry submitted! We\'ll be in touch soon.');
    } catch {
      toast.error('Failed to submit. Please try again.');
    }
    setSubmitting(false);
  };

  const budgetOptions = [
    { label: 'Under $500/mo', value: 'under-500' },
    { label: '$500 - $2,000/mo', value: '500-2000' },
    { label: '$2,000 - $5,000/mo', value: '2000-5000' },
    { label: '$5,000+/mo', value: '5000-plus' },
    { label: 'Let\'s discuss', value: 'discuss' },
  ];

  return (
    <div className="min-h-screen" data-testid="advertise-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#E5E5E5]">
        <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(135deg, #F5DFA0 0%, #FFF8E1 40%, #E0F0FA 80%, #FDFCF8 100%)' }} />
        <div className="relative max-w-5xl mx-auto px-6 md:px-12 py-20 md:py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Megaphone className="w-5 h-5 text-[#C4942A]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-grey">Partner With Us</span>
            </div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl tracking-tighter text-[#1A1A1A] mb-6 leading-[0.95]" data-testid="advertise-title">
              Reach Marketing Professionals Worldwide
            </h1>
            <p className="text-lg text-[#555] max-w-2xl mx-auto leading-relaxed mb-10">
              Blogs 4 Blocks connects you directly with marketing decision-makers across {stats?.total_countries || '15+'} countries. Sponsored content that feels native, not intrusive.
            </p>
            <Button
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#C4942A] text-white hover:bg-[#A87E22] rounded-none font-bold px-8 py-3 h-auto text-xs uppercase tracking-widest transition-colors"
              data-testid="advertise-cta"
            >
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Audience stats */}
      {stats && (
        <section className="py-16 md:py-20 border-b border-[#E5E5E5]">
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            <div className="text-center mb-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-grey mb-3">Your Audience</p>
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A1A1A] tracking-tight" data-testid="audience-heading">
                A Growing Global Community
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { icon: <FileText className="w-5 h-5" />, value: stats.total_posts, label: 'Published Posts', color: '#C2544D' },
                { icon: <Users className="w-5 h-5" />, value: stats.total_users, label: 'Contributors', color: '#3D6B8E' },
                { icon: <Globe className="w-5 h-5" />, value: stats.total_countries, label: 'Countries', color: '#2D8B7A' },
                { icon: <BarChart3 className="w-5 h-5" />, value: stats.total_comments, label: 'Discussions', color: '#7B5E8D' },
                { icon: <Mail className="w-5 h-5" />, value: stats.newsletter_subscribers, label: 'Newsletter Subs', color: '#C4942A' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-5 border border-[#E5E5E5] text-center bg-white"
                  data-testid={`audience-stat-${i}`}
                >
                  <span className="block mb-2" style={{ color: stat.color }}>{stat.icon}</span>
                  <div className="font-heading font-black text-2xl text-[#1A1A1A]">{stat.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-brand-grey mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What we offer */}
      <section className="py-16 md:py-20 border-b border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-grey mb-3">Advertising Options</p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A1A1A] tracking-tight">
              How Sponsorship Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Target className="w-6 h-6" />,
                title: 'Sponsored Posts',
                desc: 'Your branded content published as a native post within your chosen marketing category. Includes a "Sponsored" badge and your company branding.',
                color: '#C4942A',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Featured Placement',
                desc: 'Your sponsored post featured in the homepage carousel, visible to every visitor. Premium real estate with category-themed visuals.',
                color: '#C2544D',
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'Newsletter Inclusion',
                desc: 'Your content included in our weekly digest email, reaching our entire subscriber base plus all registered users every Monday.',
                color: '#2D8B7A',
              },
            ].map((offer, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative border border-[#E5E5E5] p-8 bg-white overflow-hidden"
                data-testid={`offer-card-${i}`}
              >
                <div className="h-[3px] w-full absolute top-0 left-0" style={{ background: `linear-gradient(90deg, ${offer.color}, ${offer.color}44)` }} />
                <span className="block mb-4" style={{ color: offer.color }}>{offer.icon}</span>
                <h3 className="font-heading font-bold text-lg text-[#1A1A1A] mb-2">{offer.title}</h3>
                <p className="text-sm text-brand-grey leading-relaxed">{offer.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry form */}
      <section id="inquiry-form" className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <div className="text-center mb-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-grey mb-3">Get in Touch</p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A1A1A] tracking-tight" data-testid="inquiry-heading">
              Start Your Campaign
            </h2>
            <p className="text-sm text-brand-grey mt-2">Fill out the form below and we'll get back to you within 48 hours.</p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border border-[#2D8B7A]/30 p-10 text-center"
              style={{ background: 'linear-gradient(135deg, #E0F5EC 0%, #FDFCF8 100%)' }}
              data-testid="inquiry-success"
            >
              <Check className="w-12 h-12 text-[#2D8B7A] mx-auto mb-4" />
              <h3 className="font-heading font-bold text-xl text-[#1A1A1A] mb-2">Inquiry Received!</h3>
              <p className="text-sm text-brand-grey mb-6">Thank you for your interest. Our team will review your inquiry and reach out within 48 hours.</p>
              <Button onClick={() => navigate('/')} className="bg-[#2D8B7A] text-white hover:bg-[#247062] rounded-none font-bold px-6 py-2.5 h-auto text-xs uppercase tracking-widest">
                Back to Home
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="border border-[#E5E5E5] bg-white p-8 md:p-10 space-y-6" data-testid="inquiry-form-element">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-brand-grey mb-2 block">Company Name *</Label>
                  <Input
                    value={form.company_name}
                    onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
                    required
                    className="rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] h-11"
                    data-testid="inquiry-company"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-brand-grey mb-2 block">Contact Name *</Label>
                  <Input
                    value={form.contact_name}
                    onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
                    required
                    className="rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] h-11"
                    data-testid="inquiry-contact"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-brand-grey mb-2 block">Email *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                    className="rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] h-11"
                    data-testid="inquiry-email"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-brand-grey mb-2 block">Website</Label>
                  <Input
                    value={form.website}
                    onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                    placeholder="https://"
                    className="rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] h-11"
                    data-testid="inquiry-website"
                  />
                </div>
              </div>

              {/* Budget range */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-brand-grey mb-3 block">Budget Range</Label>
                <div className="flex flex-wrap gap-2">
                  {budgetOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, budget_range: opt.value }))}
                      className={`px-4 py-2 text-xs font-medium border transition-colors ${
                        form.budget_range === opt.value
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : 'bg-white text-brand-grey border-[#E5E5E5] hover:border-[#999]'
                      }`}
                      data-testid={`budget-${opt.value}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred categories */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-brand-grey mb-3 block">Target Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => toggleCategory(cat.slug)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                        form.preferred_categories.includes(cat.slug)
                          ? 'text-white border-transparent'
                          : 'bg-white border-[#E5E5E5] text-brand-grey hover:border-[#999]'
                      }`}
                      style={form.preferred_categories.includes(cat.slug) ? { backgroundColor: '#1A1A1A' } : {}}
                      data-testid={`cat-select-${cat.slug}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-brand-grey mb-2 block">Tell Us About Your Goals *</Label>
                <Textarea
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  required
                  rows={4}
                  placeholder="What are you looking to promote? What audience are you targeting?"
                  className="rounded-none border-[#E5E5E5] focus:border-[#1A1A1A] resize-none"
                  data-testid="inquiry-message"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C4942A] text-white hover:bg-[#A87E22] rounded-none font-bold py-3 h-auto text-xs uppercase tracking-widest transition-colors"
                data-testid="inquiry-submit"
              >
                {submitting ? 'Submitting...' : 'Submit Inquiry'}
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
