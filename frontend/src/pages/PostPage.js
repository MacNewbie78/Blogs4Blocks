import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import CommentSection from '../components/CommentSection';
import { ArrowLeft, Heart, Eye, MapPin, Clock, Share2, Tag, Timer } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const CATEGORY_COLORS = {
  'social-media': '#3B82F6',
  'seo-sem': '#22C55E',
  'influencer-marketing': '#A855F7',
  'integrated-marketing': '#F97316',
  'consumer-behavior': '#EF4444',
  'branding': '#FACC15',
  'marketing-tools': '#14B8A6',
};

export default function PostPage() {
  const { id } = useParams();
  const { API, token } = useApp();
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/posts/${id}`);
      setPost(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [API, id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleLike = async () => {
    if (liked) return;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`${API}/posts/${id}/like`, {}, { headers });
      setPost(prev => ({ ...prev, likes: res.data.likes }));
      setLiked(true);
      toast.success('Thanks for the love!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-b4b-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" data-testid="post-not-found">
        <p className="text-gray-500 text-lg">Post not found</p>
        <Link to="/" className="text-b4b-blue font-semibold no-underline">Back to Home</Link>
      </div>
    );
  }

  const catColor = CATEGORY_COLORS[post.category_slug] || '#3B82F6';

  // Render markdown-like content
  const renderContent = (content) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={i} className="font-heading font-bold text-xl mt-6 mb-3 text-gray-900">{line.replace(/\*\*/g, '')}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 text-gray-700 leading-relaxed">{renderInlineFormatting(line.substring(2))}</li>;
      }
      if (line.match(/^\d+\.\s/)) {
        return <li key={i} className="ml-4 text-gray-700 leading-relaxed list-decimal">{renderInlineFormatting(line.replace(/^\d+\.\s/, ''))}</li>;
      }
      if (line.startsWith('| ')) {
        return <p key={i} className="text-sm text-gray-600 font-mono bg-gray-50 px-3 py-1 rounded">{line}</p>;
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return <p key={i} className="text-gray-700 leading-relaxed mb-2">{renderInlineFormatting(line)}</p>;
    });
  };

  const renderInlineFormatting = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-900">{part.replace(/\*\*/g, '')}</strong>;
      }
      return part;
    });
  };

  const isHtmlContent = (content) => {
    return content && (content.includes('<p>') || content.includes('<h') || content.includes('<ul>') || content.includes('<ol>') || content.includes('<blockquote>'));
  };

  return (
    <div className="min-h-screen" data-testid="post-page">
      {/* Header bar */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to={`/category/${post.category_slug}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 no-underline transition-colors" data-testid="post-back-link">
            <ArrowLeft className="w-4 h-4" /> Back to {post.category_slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-full"
              data-testid="post-share-btn"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant={liked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              className={`rounded-full transition-all ${liked ? 'bg-b4b-red text-white border-b4b-red' : ''}`}
              data-testid="post-like-btn"
            >
              <Heart className={`w-4 h-4 mr-1 ${liked ? 'fill-current' : ''}`} />
              {post.likes || 0}
            </Button>
          </div>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Category + subcategory */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ backgroundColor: `${catColor}15`, color: catColor }}
            data-testid="post-category-badge"
          >
            {post.category_slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
          {post.subcategory && (
            <Badge variant="outline" className="text-xs rounded-full" data-testid="post-subcategory-badge">
              {post.subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight text-gray-900 mb-6 leading-tight" data-testid="post-title">
          {post.title}
        </h1>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="rounded-2xl overflow-hidden mb-8 border border-gray-100" data-testid="post-cover-image">
            <img
              src={`${process.env.REACT_APP_BACKEND_URL}${post.cover_image}`}
              alt={post.title}
              className="w-full h-auto max-h-[400px] object-cover"
            />
          </div>
        )}

        {/* Author + meta */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: catColor }}>
            {post.author_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{post.author_name}</p>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{post.author_city}, {post.author_country}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{post.views} views</span>
            <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{post.likes} likes</span>
          </div>
        </div>

        {/* Content */}
        <div className="blog-content text-base md:text-lg" data-testid="post-content">
          {isHtmlContent(post.content) ? (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            renderContent(post.content)
          )}
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex items-center gap-2 mt-10 pt-6 border-t border-gray-100 flex-wrap" data-testid="post-tags">
            <Tag className="w-4 h-4 text-gray-400" />
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs rounded-full">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Guest post expiration notice */}
        {post.is_guest && post.expires_at && (
          (() => {
            const daysLeft = Math.ceil((new Date(post.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
            const isExpired = post.is_expired || daysLeft <= 0;
            return (
              <div className={`mt-6 border rounded-xl p-4 text-sm flex items-start gap-3 ${isExpired ? 'bg-red-50 border-red-200 text-red-800' : daysLeft <= 7 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`} data-testid="post-guest-notice">
                <Timer className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  {isExpired ? (
                    <p className="font-medium">This guest post has expired and is no longer publicly listed.</p>
                  ) : (
                    <p>This is a guest post. It will expire on <strong>{new Date(post.expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong> ({daysLeft} {daysLeft === 1 ? 'day' : 'days'} remaining). Register an account to post permanently!</p>
                  )}
                </div>
              </div>
            );
          })()
        )}

        {/* Comment Section */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <CommentSection postId={post.id} />
        </div>
      </article>
    </div>
  );
}
