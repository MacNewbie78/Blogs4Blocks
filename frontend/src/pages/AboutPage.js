import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Globe, Users, PenLine, Heart, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

const CITY_IMAGES = [
  'https://images.unsplash.com/photo-1603547142979-56242264e65c?w=600&q=75',
  'https://images.unsplash.com/photo-1769298084996-8ed5d3a72870?w=600&q=75',
  'https://images.unsplash.com/photo-1760459477099-ad81fd11d7c6?w=600&q=75',
  'https://images.unsplash.com/photo-1637329096986-62486d0c4380?w=600&q=75',
];

const RAINBOW = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#14B8A6', '#3B82F6', '#A855F7', '#EC4899', '#A16207', '#EF4444', '#3B82F6', '#22C55E', '#F97316'];

export default function AboutPage() {
  const { stats } = useApp();

  return (
    <div className="min-h-screen" data-testid="about-page">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-28">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {CITY_IMAGES.map((img, i) => (
            <div key={i} className="relative overflow-hidden">
              <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-white/90" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading font-black text-4xl md:text-6xl tracking-tighter mb-6" data-testid="about-title">
            {"About ".split('').map((c, i) => (
              <span key={i} style={{ color: '#0F172A' }}>{c}</span>
            ))}
            {"Blogs 4 Blocks".split('').map((c, i) => (
              <span key={i + 6} className="rainbow-letter" style={{ color: c === ' ' ? 'transparent' : RAINBOW[i % RAINBOW.length] }}>
                {c === ' ' ? '\u00A0' : c}
              </span>
            ))}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Born in the blocks of New York City, built for marketing professionals across every block on every continent.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-heading font-bold text-3xl tracking-tight text-gray-900 mb-4">The Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Marketing doesn't work the same everywhere. What drives conversions in Tokyo might fall flat in São Paulo. What goes viral in Lagos might confuse audiences in Stockholm.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong className="text-gray-900">Blogs 4 Blocks</strong> exists to bridge that gap. We're an open forum where marketing professionals from every corner of the world share what actually works in their markets — the strategies, the failures, the insights you can't find in any textbook.
              </p>
              <p className="text-gray-600 leading-relaxed">
                No gatekeeping. No paywalls. Just real marketers helping real marketers, block by block, city by city.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: <Globe className="w-6 h-6" />, title: 'Global Perspectives', desc: 'Insights from marketing pros on every continent', color: '#3B82F6' },
                { icon: <Users className="w-6 h-6" />, title: 'Open Forum', desc: 'Anyone can contribute — registered or as a guest', color: '#22C55E' },
                { icon: <PenLine className="w-6 h-6" />, title: 'Real Strategies', desc: 'Not theory — practical tactics that work in the field', color: '#A855F7' },
                { icon: <Heart className="w-6 h-6" />, title: 'Community First', desc: 'Built by marketers, for marketers, with no corporate agenda', color: '#EF4444' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow" data-testid={`about-value-${i}`}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-bold text-3xl tracking-tight text-gray-900 mb-10 text-center" data-testid="how-it-works-heading">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Explore Topics', desc: 'Browse categories from Social Media Marketing to Consumer Behavior. Find discussions relevant to your market.', color: '#3B82F6' },
              { step: '02', title: 'Share Your Insight', desc: 'Write a post about what works in your market. Share data, case studies, or hard-earned wisdom.', color: '#22C55E' },
              { step: '03', title: 'Join the Discussion', desc: 'Comment on posts, like great insights, and connect with marketers facing similar challenges worldwide.', color: '#A855F7' },
            ].map((item, i) => (
              <div key={i} className="text-center" data-testid={`how-step-${i}`}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 font-heading font-black text-xl text-white" style={{ backgroundColor: item.color }}>
                  {item.step}
                </div>
                <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-heading font-bold text-3xl tracking-tight text-gray-900 mb-10" data-testid="about-stats-heading">
              The Community So Far
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: stats.total_posts, label: 'Posts Published', color: '#3B82F6' },
                { value: stats.total_comments, label: 'Discussions', color: '#22C55E' },
                { value: stats.total_users, label: 'Members', color: '#A855F7' },
                { value: stats.countries_represented, label: 'Countries', color: '#F97316' },
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl border border-gray-100" data-testid={`about-stat-${i}`}>
                  <div className="font-heading font-black text-4xl mb-1" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-1 mb-4 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5" /> Based in New York City. Built for the world.
          </div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight mb-4" data-testid="about-cta-heading">
            Ready to Share Your Perspective?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Whether you have a full case study or a quick insight — every contribution makes the global marketing community stronger.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/write">
              <Button className="bg-white text-black hover:bg-gray-100 rounded-full font-bold px-8 py-3 h-auto shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)] hover:translate-y-[-2px] transition-all" data-testid="about-write-btn">
                <PenLine className="w-5 h-5 mr-2" /> Write a Post
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white rounded-full font-bold px-8 py-3 h-auto transition-all" data-testid="about-join-btn">
                Join the Community <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
