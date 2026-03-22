import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, MapPin, Clock, ArrowRight, Timer } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export default function BlogCard({ post, index = 0 }) {
  const timeAgo = getTimeAgo(post.created_at);
  const daysLeft = post.expires_at ? getDaysLeft(post.expires_at) : null;

  return (
    <Link
      to={`/post/${post.id}`}
      className="group relative bg-white border border-[#E5E5E5] overflow-hidden hover:border-[#1A1A1A]/20 transition-all duration-500 no-underline block"
      style={{ animationDelay: `${index * 80}ms` }}
      data-testid={`blog-card-${post.id}`}
    >
      {/* Cover image */}
      {post.cover_image ? (
        <div className="relative h-44 overflow-hidden">
          <img
            src={`${process.env.REACT_APP_BACKEND_URL}${post.cover_image}`}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
      ) : (
        <div className="h-px w-full bg-brand-yellow" />
      )}

      <div className="p-6">
        {/* Category + meta */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-grey"
            data-testid={`blog-card-category-${post.id}`}
          >
            {post.category_slug.replace(/-/g, ' ')}
          </span>
          {post.is_guest && daysLeft !== null && (
            <Badge
              variant="outline"
              className={`text-[10px] px-2 py-0.5 rounded-none uppercase tracking-wider font-bold ${daysLeft <= 7 ? 'border-brand-red text-brand-red' : 'border-brand-grey text-brand-grey'}`}
              data-testid={`blog-card-expiry-${post.id}`}
            >
              <Timer className="w-3 h-3 mr-1 inline" />
              {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="font-heading font-bold text-lg text-[#1A1A1A] mb-3 group-hover:text-brand-red transition-colors leading-snug line-clamp-2" data-testid={`blog-card-title-${post.id}`}>
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-brand-grey leading-relaxed mb-5 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Author + stats */}
        <div className="flex items-center justify-between pt-4 border-t border-[#F4F4F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold bg-[#1A1A1A]">
              {post.author_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-xs font-medium text-[#1A1A1A]">{post.author_name}</p>
              <div className="flex items-center gap-1 text-[10px] text-brand-grey">
                <MapPin className="w-2.5 h-2.5" />
                <span>{post.author_city}, {post.author_country}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-brand-grey">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes || 0}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views || 0}</span>
          </div>
        </div>

        {/* Time + Read more */}
        <div className="flex items-center justify-between mt-4">
          <span className="flex items-center gap-1 text-[10px] text-brand-grey">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity">
            Read <ArrowRight className="w-3 h-3" />
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

function getDaysLeft(expiresAt) {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
  return diff;
}
