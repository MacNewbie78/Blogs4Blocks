import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '../components/ui/badge';

const CATEGORY_COLORS = {
  'social-media': '#3B82F6',
  'seo-sem': '#22C55E',
  'influencer-marketing': '#A855F7',
  'integrated-marketing': '#F97316',
  'consumer-behavior': '#EF4444',
  'branding': '#FACC15',
  'marketing-tools': '#14B8A6',
};

export default function BlogCard({ post, index = 0 }) {
  const catColor = CATEGORY_COLORS[post.category_slug] || '#3B82F6';
  const timeAgo = getTimeAgo(post.created_at);

  return (
    <Link
      to={`/post/${post.id}`}
      className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 no-underline block"
      style={{ animationDelay: `${index * 80}ms` }}
      data-testid={`blog-card-${post.id}`}
    >
      {/* Color bar at top */}
      <div className="h-1.5 w-full" style={{ backgroundColor: catColor }} />

      <div className="p-5 sm:p-6">
        {/* Category + meta */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge
            variant="secondary"
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${catColor}15`, color: catColor }}
            data-testid={`blog-card-category-${post.id}`}
          >
            {post.category_slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
          {post.subcategory && (
            <span className="text-xs text-gray-400">
              {post.subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-heading font-bold text-lg text-gray-900 mb-2 group-hover:text-b4b-blue transition-colors leading-snug line-clamp-2" data-testid={`blog-card-title-${post.id}`}>
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Author + stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: catColor }}>
              {post.author_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-800">{post.author_name}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                <span>{post.author_city}, {post.author_country}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes || 0}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views || 0}</span>
          </div>
        </div>

        {/* Time + Read more */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-b4b-blue opacity-0 group-hover:opacity-100 transition-opacity">
            Read more <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function getTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
