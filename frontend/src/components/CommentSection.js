import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { Send, MapPin, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';

export default function CommentSection({ postId }) {
  const { user, token, API } = useApp();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [guestCountry, setGuestCountry] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/posts/${postId}/comments`);
      setComments(res.data);
    } catch (e) {
      console.error(e);
    }
  }, [API, postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const payload = { content: content.trim() };
      if (!user) {
        if (!guestName.trim() || !guestCity.trim()) {
          setSubmitting(false);
          return;
        }
        payload.guest_author = {
          name: guestName.trim(),
          city: guestCity.trim(),
          country: guestCountry.trim() || 'Unknown'
        };
      }
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API}/posts/${postId}/comments`, payload, { headers });
      setContent('');
      setGuestName('');
      setGuestCity('');
      setGuestCountry('');
      fetchComments();
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  return (
    <div data-testid="comment-section">
      <h3 className="font-heading font-bold text-xl mb-6">
        Discussion ({comments.length})
      </h3>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 rounded-2xl p-5" data-testid="comment-form">
        {!user && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <Input
              placeholder="Your name *"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="bg-white border-2 border-gray-100 focus:border-black rounded-xl"
              data-testid="comment-guest-name"
            />
            <Input
              placeholder="City *"
              value={guestCity}
              onChange={(e) => setGuestCity(e.target.value)}
              className="bg-white border-2 border-gray-100 focus:border-black rounded-xl"
              data-testid="comment-guest-city"
            />
            <Input
              placeholder="Country"
              value={guestCountry}
              onChange={(e) => setGuestCountry(e.target.value)}
              className="bg-white border-2 border-gray-100 focus:border-black rounded-xl"
              data-testid="comment-guest-country"
            />
          </div>
        )}
        <Textarea
          placeholder="Share your thoughts, experiences, or questions..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="bg-white border-2 border-gray-100 focus:border-black rounded-xl mb-3 resize-none"
          data-testid="comment-content"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {user ? `Posting as ${user.name}` : 'Posting as guest (no notifications)'}
          </p>
          <Button
            type="submit"
            disabled={submitting || !content.trim()}
            className="bg-black text-white hover:bg-gray-800 rounded-full font-bold shadow-[3px_3px_0px_0px_rgba(59,130,246,0.4)] hover:translate-y-[-1px] transition-all"
            data-testid="comment-submit-btn"
          >
            <Send className="w-4 h-4 mr-1.5" />
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="bg-white border border-gray-100 rounded-xl p-4" data-testid={`comment-${comment.id}`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-b4b-teal flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {comment.author_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{comment.author_name}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {comment.author_city}, {comment.author_country}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  {comment.is_guest && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">guest</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-10 text-gray-400" data-testid="no-comments">
            <p className="text-sm">No comments yet. Be the first to share your perspective!</p>
          </div>
        )}
      </div>
    </div>
  );
}
