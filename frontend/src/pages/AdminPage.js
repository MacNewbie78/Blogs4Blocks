import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import {
  Shield, Check, X, Trash2, Users, FileText, MessageCircle,
  Globe, Tag, Clock, AlertTriangle, Eye, Heart, MapPin,
  ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

function StatCard({ icon, value, label, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4" data-testid={`admin-stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <div className="font-heading font-bold text-2xl" style={{ color }}>{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function PendingCategoryCard({ cat, onApprove, onReject }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(cat.slug);
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await onReject(cat.slug);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-4 flex items-start gap-4" data-testid={`pending-cat-${cat.slug}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-600 bg-amber-50 flex-shrink-0">
        <Tag className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-heading font-bold text-base text-gray-900">{cat.name}</h4>
          <Badge className="text-xs bg-amber-100 text-amber-700 border-0">Pending</Badge>
        </div>
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{cat.description}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {cat.suggested_by && <span>Suggested by <strong className="text-gray-600">{cat.suggested_by}</strong></span>}
          {cat.created_at && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(cat.created_at).toLocaleDateString()}</span>}
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button
          size="sm"
          onClick={handleApprove}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full h-9 px-4"
          data-testid={`approve-${cat.slug}`}
        >
          <Check className="w-4 h-4 mr-1" /> Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReject}
          disabled={loading}
          className="border-red-200 text-red-600 hover:bg-red-50 rounded-full h-9 px-4"
          data-testid={`reject-${cat.slug}`}
        >
          <X className="w-4 h-4 mr-1" /> Reject
        </Button>
      </div>
    </div>
  );
}

function RecentPostRow({ post, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0" data-testid={`admin-post-${post.id}`}>
      <div className="flex-1 min-w-0">
        <Link to={`/post/${post.id}`} className="text-sm font-medium text-gray-900 hover:text-b4b-blue no-underline line-clamp-1">
          {post.title}
        </Link>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
          <span>{post.author_name}</span>
          <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{post.author_city}</span>
          <Badge variant="secondary" className="text-xs py-0 h-5">{post.category_slug.replace(/-/g, ' ')}</Badge>
          {post.is_guest && <Badge className="text-xs bg-yellow-100 text-yellow-700 border-0 py-0 h-5">guest</Badge>}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes || 0}</span>
        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views || 0}</span>
      </div>
      {confirmDelete ? (
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button size="sm" variant="destructive" className="h-7 text-xs rounded-full" onClick={() => { onDelete(post.id); setConfirmDelete(false); }} data-testid={`confirm-delete-${post.id}`}>
            Delete
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs rounded-full" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 flex-shrink-0" onClick={() => setConfirmDelete(true)} data-testid={`delete-post-${post.id}`}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}

function RecentCommentRow({ comment, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0" data-testid={`admin-comment-${comment.id}`}>
      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 mt-0.5">
        {comment.author_name?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-0.5">
          <span className="font-semibold text-gray-700">{comment.author_name}</span>
          <span>{comment.author_city}</span>
          {comment.is_guest && <Badge className="text-xs bg-yellow-100 text-yellow-700 border-0 py-0 h-4">guest</Badge>}
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(comment.created_at).toLocaleDateString()}</span>
        </div>
        <p className="text-sm text-gray-700 line-clamp-2">{comment.content}</p>
      </div>
      {confirmDelete ? (
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button size="sm" variant="destructive" className="h-7 text-xs rounded-full" onClick={() => { onDelete(comment.id); setConfirmDelete(false); }}>
            Delete
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs rounded-full" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 flex-shrink-0" onClick={() => setConfirmDelete(true)} data-testid={`delete-comment-${comment.id}`}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}

function UserRow({ u }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0" data-testid={`admin-user-${u.id}`}>
      <div className="w-8 h-8 rounded-full bg-b4b-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {u.name?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{u.name}</span>
          {u.is_admin && <Badge className="text-xs bg-indigo-100 text-indigo-700 border-0 py-0 h-4">admin</Badge>}
        </div>
        <div className="text-xs text-gray-400">{u.email} — {u.city}, {u.country}</div>
      </div>
      <span className="text-xs text-gray-400 flex-shrink-0">{new Date(u.created_at).toLocaleDateString()}</span>
    </div>
  );
}

export default function AdminPage() {
  const { user, token, API } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingCats, setPendingCats] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('b4b_token');
    if (!storedToken) { navigate('/auth'); return; }
    const timer = setTimeout(() => setAuthChecked(true), 500);
    return () => clearTimeout(timer);
  }, [navigate]);

  const headers = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, pendingRes, usersRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers: headers() }),
        axios.get(`${API}/categories/pending/list`, { headers: headers() }),
        axios.get(`${API}/admin/users`, { headers: headers() }),
      ]);
      setStats(statsRes.data);
      setPendingCats(pendingRes.data);
      setUsers(usersRes.data);
    } catch (e) {
      if (e.response?.status === 403) {
        toast.error('Admin access required');
        navigate('/');
      }
    }
    setLoading(false);
  }, [token, API, headers, navigate]);

  useEffect(() => {
    if (authChecked && user && token) fetchData();
  }, [authChecked, user, token, fetchData]);

  const handleApprove = async (slug) => {
    try {
      await axios.put(`${API}/categories/${slug}/approve`, {}, { headers: headers() });
      toast.success(`Topic "${slug}" approved!`);
      setPendingCats(prev => prev.filter(c => c.slug !== slug));
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to approve');
    }
  };

  const handleReject = async (slug) => {
    try {
      await axios.delete(`${API}/categories/${slug}/reject`, { headers: headers() });
      toast.success(`Topic suggestion rejected`);
      setPendingCats(prev => prev.filter(c => c.slug !== slug));
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to reject');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`${API}/admin/posts/${postId}`, { headers: headers() });
      toast.success('Post deleted');
      fetchData();
    } catch (e) {
      toast.error('Failed to delete post');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${API}/admin/comments/${commentId}`, { headers: headers() });
      toast.success('Comment deleted');
      fetchData();
    } catch (e) {
      toast.error('Failed to delete comment');
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-b4b-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!user.is_admin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" data-testid="admin-no-access">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <h2 className="font-heading font-bold text-xl">Admin Access Required</h2>
        <p className="text-gray-500 text-sm">You don't have permission to view this page.</p>
        <Button onClick={() => navigate('/')} className="rounded-full" data-testid="admin-go-home">Go Home</Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
    { id: 'moderation', label: `Moderation ${pendingCats.length > 0 ? `(${pendingCats.length})` : ''}`, icon: <Shield className="w-4 h-4" /> },
    { id: 'posts', label: 'Recent Posts', icon: <FileText className="w-4 h-4" /> },
    { id: 'comments', label: 'Recent Comments', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50" data-testid="admin-page">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-950 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-xl text-gray-900" data-testid="admin-heading">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Moderate content, manage topics, and monitor activity</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={fetchData} className="rounded-full" data-testid="admin-refresh">
              <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 overflow-x-auto" data-testid="admin-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                data-testid={`admin-tab-${tab.id}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6" data-testid="admin-overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<FileText className="w-5 h-5" />} value={stats.total_posts} label="Total Posts" color="#3B82F6" />
              <StatCard icon={<MessageCircle className="w-5 h-5" />} value={stats.total_comments} label="Total Comments" color="#22C55E" />
              <StatCard icon={<Users className="w-5 h-5" />} value={stats.total_users} label="Registered Users" color="#A855F7" />
              <StatCard icon={<Globe className="w-5 h-5" />} value={stats.countries_represented} label="Countries" color="#F97316" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<Tag className="w-5 h-5" />} value={stats.approved_categories} label="Active Topics" color="#14B8A6" />
              <StatCard icon={<Clock className="w-5 h-5" />} value={stats.pending_categories} label="Pending Topics" color="#D97706" />
              <StatCard icon={<AlertTriangle className="w-5 h-5" />} value={stats.guest_posts} label="Guest Posts" color="#EF4444" />
              <StatCard icon={<Shield className="w-5 h-5" />} value={users.filter(u => u.is_admin).length} label="Admins" color="#6366F1" />
            </div>
          </div>
        )}

        {/* Moderation Tab */}
        {activeTab === 'moderation' && (
          <div className="space-y-4" data-testid="admin-moderation">
            <h2 className="font-heading font-bold text-lg text-gray-900">Pending Topic Suggestions</h2>
            {pendingCats.length > 0 ? (
              <div className="space-y-3">
                {pendingCats.map(cat => (
                  <PendingCategoryCard key={cat.slug} cat={cat} onApprove={handleApprove} onReject={handleReject} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center" data-testid="no-pending">
                <Check className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">All clear! No pending topic suggestions.</p>
                <p className="text-xs text-gray-400 mt-1">User-suggested topics will appear here for your review.</p>
              </div>
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && stats && (
          <div data-testid="admin-posts">
            <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">Recent Posts</h2>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              {stats.recent_posts.map(post => (
                <RecentPostRow key={post.id} post={post} onDelete={handleDeletePost} />
              ))}
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && stats && (
          <div data-testid="admin-comments">
            <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">Recent Comments</h2>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              {stats.recent_comments.length > 0 ? (
                stats.recent_comments.map(comment => (
                  <RecentCommentRow key={comment.id} comment={comment} onDelete={handleDeleteComment} />
                ))
              ) : (
                <p className="text-center text-gray-400 py-8">No comments yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div data-testid="admin-users">
            <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">Registered Users ({users.length})</h2>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              {users.map(u => (
                <UserRow key={u.id} u={u} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
