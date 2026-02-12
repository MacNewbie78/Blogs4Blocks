import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { PenLine, Send, AlertCircle, ImagePlus, X, Plus, Lightbulb } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import RichTextEditor from '../components/RichTextEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import { toast } from 'sonner';

export default function WritePage() {
  const { user, token, categories, API } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category_slug: '',
    subcategory: '',
    tags: '',
  });
  const [guestData, setGuestData] = useState({
    name: '',
    city: '',
    country: '',
  });
  const [subcategories, setSubcategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef(null);

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API}/upload`, formData);
      setCoverImage(res.data.url);
    } catch (err) {
      setError('Failed to upload cover image. Max size is 5MB.');
    }
    setCoverUploading(false);
    e.target.value = '';
  };

  const handleCategoryChange = async (value) => {
    setFormData(prev => ({ ...prev, category_slug: value, subcategory: '' }));
    try {
      const res = await axios.get(`${API}/categories/${value}`);
      setSubcategories(res.data.subcategories || []);
    } catch (e) {
      setSubcategories([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.content.trim() || !formData.category_slug || !formData.excerpt.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!user && (!guestData.name.trim() || !guestData.city.trim())) {
      setError('Guest posts require your name and city.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        subcategory: formData.subcategory || null,
        cover_image: coverImage,
      };

      if (!user) {
        payload.guest_author = {
          name: guestData.name.trim(),
          city: guestData.city.trim(),
          country: guestData.country.trim() || 'Unknown',
        };
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`${API}/posts`, payload, { headers });
      toast.success('Your post has been published!');
      navigate(`/post/${res.data.id}`);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to publish. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/50" data-testid="write-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl md:text-4xl tracking-tight text-gray-900 mb-2" data-testid="write-heading">
            <PenLine className="inline w-8 h-8 mr-2 text-b4b-blue" />
            Share Your Marketing Insight
          </h1>
          <p className="text-base text-gray-500">
            Your experience matters. Share what works in your market, what doesn't, and help fellow marketers around the world.
          </p>
        </div>

        {/* Guest notice */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3" data-testid="write-guest-notice">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Posting as a guest</p>
              <p className="text-xs text-blue-600 mt-0.5">Guest posts are active for 30 days and you won't receive notifications. <a href="/auth" className="underline font-semibold">Sign up</a> for a permanent presence!</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="write-form">
          {/* Guest fields */}
          {!user && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h3 className="font-heading font-semibold text-lg">About You</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="guest-name">Name *</Label>
                  <Input
                    id="guest-name"
                    placeholder="Your name"
                    value={guestData.name}
                    onChange={(e) => setGuestData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 border-2 border-gray-100 focus:border-black rounded-xl"
                    data-testid="write-guest-name"
                  />
                </div>
                <div>
                  <Label htmlFor="guest-city">City *</Label>
                  <Input
                    id="guest-city"
                    placeholder="Your city"
                    value={guestData.city}
                    onChange={(e) => setGuestData(prev => ({ ...prev, city: e.target.value }))}
                    className="mt-1 border-2 border-gray-100 focus:border-black rounded-xl"
                    data-testid="write-guest-city"
                  />
                </div>
                <div>
                  <Label htmlFor="guest-country">Country</Label>
                  <Input
                    id="guest-country"
                    placeholder="Your country"
                    value={guestData.country}
                    onChange={(e) => setGuestData(prev => ({ ...prev, country: e.target.value }))}
                    className="mt-1 border-2 border-gray-100 focus:border-black rounded-xl"
                    data-testid="write-guest-country"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Post content */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h3 className="font-heading font-semibold text-lg">Your Post</h3>

            {/* Cover Image Upload */}
            <div data-testid="cover-image-section">
              <Label>Cover Image</Label>
              {coverImage ? (
                <div className="relative mt-2 rounded-xl overflow-hidden border-2 border-gray-100">
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${coverImage}`}
                    alt="Cover"
                    className="w-full h-48 object-cover"
                    data-testid="cover-image-preview"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                    data-testid="cover-image-remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={coverUploading}
                  className="mt-2 w-full border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl py-10 flex flex-col items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors"
                  data-testid="cover-image-upload-btn"
                >
                  <ImagePlus className="w-8 h-8" />
                  <span className="text-sm font-medium">{coverUploading ? 'Uploading...' : 'Click to add a cover image'}</span>
                  <span className="text-xs">JPG, PNG up to 5MB</span>
                </button>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
                data-testid="cover-image-file-input"
              />
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="A compelling title for your marketing insight..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 border-2 border-gray-100 focus:border-black rounded-xl text-lg"
                data-testid="write-title"
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Short Summary *</Label>
              <Input
                id="excerpt"
                placeholder="One-liner that hooks the reader..."
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                className="mt-1 border-2 border-gray-100 focus:border-black rounded-xl"
                data-testid="write-excerpt"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={formData.category_slug} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="mt-1 border-2 border-gray-100 focus:border-black rounded-xl" data-testid="write-category-select">
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.slug} value={cat.slug} data-testid={`write-cat-option-${cat.slug}`}>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {subcategories.length > 0 && (
                <div>
                  <Label>Subtopic</Label>
                  <Select value={formData.subcategory} onValueChange={(v) => setFormData(prev => ({ ...prev, subcategory: v }))}>
                    <SelectTrigger className="mt-1 border-2 border-gray-100 focus:border-black rounded-xl" data-testid="write-subcategory-select">
                      <SelectValue placeholder="Optional subtopic" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map(sub => (
                        <SelectItem key={sub.slug} value={sub.slug} data-testid={`write-sub-option-${sub.slug}`}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <div className="mt-1">
                <RichTextEditor
                  content={formData.content}
                  onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                  placeholder="Share your marketing strategy, experience, data, and insights. Use the toolbar for formatting — headings, bold, lists, quotes, and more."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="e.g. social-media, strategy, ROI (comma-separated)"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="mt-1 border-2 border-gray-100 focus:border-black rounded-xl"
                data-testid="write-tags"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700" data-testid="write-error">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="rounded-full"
              data-testid="write-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-black text-white hover:bg-gray-800 rounded-full font-bold px-8 shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(59,130,246,0.5)] transition-all"
              data-testid="write-submit-btn"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? 'Publishing...' : 'Publish Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
