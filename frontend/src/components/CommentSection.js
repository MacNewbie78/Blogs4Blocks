import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { Send, MapPin, Clock, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';

function getWsUrl() {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
  return backendUrl.replace(/^http/, 'ws');
}

export default function CommentSection({ postId }) {
  const { user, token, API } = useApp();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [guestCountry, setGuestCountry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);

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

  useEffect(() => {
    const wsUrl = `${getWsUrl()}/api/ws/comments/${postId}`;
    let ws;
    let pingInterval;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
          pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) ws.send('ping');
          }, 25000);
        };

        ws.onmessage = (event) => {
          if (event.data === 'pong') return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'new_comment' && data.comment) {
              setComments(prev => {
                if (prev.some(c => c.id === data.comment.id)) return prev;
                return [data.comment, ...prev];
              });
            }
          } catch (e) {}
        };

        ws.onclose = () => {
          setWsConnected(false);
          clearInterval(pingInterval);
          setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setWsConnected(false);
          ws.close();
        };
      } catch (e) {
        setWsConnected(false);
      }
    };

    connect();

    return () => {
      clearInterval(pingInterval);
      if (ws) ws.close();
    };
  }, [postId]);

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
      <div className="flex items-center gap-3 mb-8">
        <h3 className="font-heading font-bold text-xl text-[#1A1A1A]">
          Discussion ({comments.length})
        </h3>
        <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${wsConnected ? 'text-brand-green' : 'text-brand-grey'}`} data-testid="ws-status">
          {wsConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {wsConnected ? 'Live' : 'Connecting...'}
        </span>
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-10 bg-white border border-[#E5E5E5] p-5" data-testid="comment-form">
        {!user && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <Input placeholder="Your name *" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="bg-[#FDFCF8] border border-[#E5E5E5] focus:border-[#1A1A1A] rounded-none" data-testid="comment-guest-name" />
            <Input placeholder="City *" value={guestCity} onChange={(e) => setGuestCity(e.target.value)} className="bg-[#FDFCF8] border border-[#E5E5E5] focus:border-[#1A1A1A] rounded-none" data-testid="comment-guest-city" />
            <Input placeholder="Country" value={guestCountry} onChange={(e) => setGuestCountry(e.target.value)} className="bg-[#FDFCF8] border border-[#E5E5E5] focus:border-[#1A1A1A] rounded-none" data-testid="comment-guest-country" />
          </div>
        )}
        <Textarea
          placeholder="Share your thoughts, experiences, or questions..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="bg-[#FDFCF8] border border-[#E5E5E5] focus:border-[#1A1A1A] rounded-none mb-3 resize-none"
          data-testid="comment-content"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-brand-grey">
            {user ? `Posting as ${user.name}` : 'Posting as guest'}
          </p>
          <Button
            type="submit"
            disabled={submitting || !content.trim()}
            className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none font-bold uppercase tracking-widest text-xs transition-colors"
            data-testid="comment-submit-btn"
          >
            <Send className="w-3.5 h-3.5 mr-2" />
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-px bg-[#E5E5E5]">
        {comments.map(comment => (
          <div key={comment.id} className="bg-[#FDFCF8] p-5" data-testid={`comment-${comment.id}`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {comment.author_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-[#1A1A1A]">{comment.author_name}</span>
                  <span className="flex items-center gap-1 text-xs text-brand-grey">
                    <MapPin className="w-3 h-3" />
                    {comment.author_city}, {comment.author_country}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-brand-grey">
                    <Clock className="w-3 h-3" />
                    {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  {comment.is_guest && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-grey border border-[#E5E5E5] px-2 py-0.5">guest</span>
                  )}
                </div>
                <p className="text-sm text-[#404040] leading-relaxed">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {comments.length === 0 && (
        <div className="text-center py-12 text-brand-grey" data-testid="no-comments">
          <p className="text-sm">No comments yet. Be the first to share your perspective!</p>
        </div>
      )}
    </div>
  );
}
