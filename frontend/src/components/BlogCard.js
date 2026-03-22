import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, MapPin, Clock, ArrowRight, Timer } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { getCategoryColor } from '../utils/colors';

export default function BlogCard({ post, index = 0 }) {
  const timeAgo = getTimeAgo(post.created_at);
  const daysLeft = post.expires_at ? getDaysLeft(post.expires_at) : null;
  const catColor = getCategoryColor(post.category_slug);

  return (
    <Link
      to={`/post/${post.id}`}
      className="group relative overflow-hidden no-underline block transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
      style={{ animationDelay: `${index * 80}ms` }}
      data-testid={`blog-card-${post.id}`}
    >
      {/* Card body with gradient background */}
      <div
        className="relative bg-white border border-[#E5E5E5] h-full flex flex-col"
        style={{
          background: `linear-gradient(45deg, ${catColor.base}14 0%, transparent 55%), #FFFFFF`,
        }}
      >
        {/* Colored accent bar at top */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${catColor.base}, ${catColor.base}66)` }} />

        {/* Cover image */}
        {post.cover_image && (
          <div className="relative h-40 overflow-hidden">
            <img
              src={`${process.env.REACT_APP_BACKEND_URL}${post.cover_image}`}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        )}

        <div className="p-5 flex flex-col flex-1">
          {/* Category badge */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5"
              style={{ color: catColor.base, backgroundColor: catColor.light }}
              data-testid={`blog-card-category-${post.id}`}
            >
              {post.category_slug.replace(/-/g, ' ')}
            </span>
            {post.is_guest && daysLeft !== null && (
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0.5 rounded-none uppercase tracking-wider font-bold ${daysLeft <= 7 ? 'border-[#C2544D] text-[#C2544D]' : 'border-brand-grey text-brand-grey'}`}
                data-testid={`blog-card-expiry-${post.id}`}
              >
                <Timer className="w-3 h-3 mr-1 inline" />
                {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3
            className="font-heading font-bold text-lg text-[#1A1A1A] mb-2 leading-snug line-clamp-2 transition-colors"
            style={{ '--hover-color': catColor.base }}
            data-testid={`blog-card-title-${post.id}`}
          >
            <span className="group-hover:text-[var(--hover-color)] transition-colors">
              {post.title}
            </span>
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-brand-grey leading-relaxed mb-4 line-clamp-2 flex-1">
            {post.excerpt}
          </p>

          {/* Author row */}
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: catColor.base }}
            >
              {post.author_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1A1A1A]">{post.author_name}</p>
              <div className="flex items-center gap-1 text-[10px] text-brand-grey">
                <MapPin className="w-2.5 h-2.5" />
                <span>{post.author_city}, {post.author_country}</span>
              </div>
            </div>
          </div>

          {/* Bottom stats bar */}
          <div
            className="flex items-center justify-between pt-3 mt-auto border-t"
            style={{ borderColor: `${catColor.base}20` }}
          >
            <div className="flex items-center gap-3 text-[10px] text-brand-grey">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" style={{ color: catColor.base }} />{post.likes || 0}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />{post.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />{timeAgo}
              </span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: catColor.base }}>
              Read <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Bottom-left gradient glow (subtle) */}
        <div
          className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none"
          style={{
            background: `radial-gradient(circle at bottom left, ${catColor.base}18 0%, transparent 70%)`,
          }}
        />
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

function getDaysLeft(expiresAt) {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
  return diff;
}
