import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import BlogCard from '../components/BlogCard';
import { ArrowLeft, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

const CITY_IMAGES = [
  'https://images.unsplash.com/photo-1603547142979-56242264e65c?w=600&q=75',
  'https://images.unsplash.com/photo-1769298084996-8ed5d3a72870?w=600&q=75',
];

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { API, categories } = useApp();
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const perPage = 12;

  const isAll = slug === 'all';

  useEffect(() => {
    if (!isAll && slug) {
      axios.get(`${API}/categories/${slug}`).then(res => setCategory(res.data)).catch(() => {});
    }
  }, [slug, API, isAll]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (!isAll && slug) params.set('category', slug);
    if (activeSubcategory) params.set('subcategory', activeSubcategory);
    if (search) params.set('search', search);
    params.set('limit', perPage.toString());
    params.set('page', currentPage.toString());

    axios.get(`${API}/posts?${params.toString()}`)
      .then(res => { setPosts(res.data.posts); setTotal(res.data.total); setTotalPages(res.data.total_pages || 1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, activeSubcategory, search, API, isAll, currentPage]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [slug, activeSubcategory, search]);

  const catColor = category?.color || '#3B82F6';

  return (
    <div className="min-h-screen" data-testid="category-page">
      {/* Hero banner */}
      <section className="relative overflow-hidden py-12 md:py-20">
        <div className="absolute inset-0 flex">
          {CITY_IMAGES.map((img, i) => (
            <div key={i} className="flex-1 relative overflow-hidden">
              <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-white/90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 no-underline transition-colors" data-testid="category-back-link">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex items-start gap-4">
            {!isAll && category && (
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0" style={{ backgroundColor: catColor }}>
                {category.name[0]}
              </div>
            )}
            <div>
              <h1 className="font-heading font-bold text-3xl md:text-5xl tracking-tight text-gray-900 mb-2" data-testid="category-title">
                {isAll ? 'All Posts' : (category?.name || 'Loading...')}
              </h1>
              {category && (
                <p className="text-base md:text-lg text-gray-500 max-w-2xl">{category.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">{total} {total === 1 ? 'post' : 'posts'}</Badge>
              </div>
            </div>
          </div>

          {/* Subcategories */}
          {category?.subcategories?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6" data-testid="subcategory-filters">
              <button
                onClick={() => setActiveSubcategory(null)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!activeSubcategory ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                style={!activeSubcategory ? { backgroundColor: catColor } : {}}
                data-testid="subcategory-all"
              >
                All
              </button>
              {category.subcategories.map(sub => (
                <button
                  key={sub.slug}
                  onClick={() => setActiveSubcategory(activeSubcategory === sub.slug ? null : sub.slug)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeSubcategory === sub.slug ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                  style={activeSubcategory === sub.slug ? { backgroundColor: catColor } : {}}
                  data-testid={`subcategory-${sub.slug}`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Search + filter bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-gray-200 rounded-full h-10"
              data-testid="category-search-input"
            />
          </div>
          {isAll && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full" data-testid="category-filter-btn">
                  <Filter className="w-4 h-4 mr-1.5" /> Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { /* browse all */ }} data-testid="filter-all">All Categories</DropdownMenuItem>
                {categories.map(cat => (
                  <DropdownMenuItem key={cat.slug} onClick={() => window.location.href = `/category/${cat.slug}`} data-testid={`filter-${cat.slug}`}>
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Posts grid */}
      <section className="py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="category-posts-grid">
                {posts.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12" data-testid="pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full"
                    data-testid="pagination-prev"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`rounded-full min-w-[36px] ${currentPage === pageNum ? 'bg-black text-white' : ''}`}
                        data-testid={`pagination-page-${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-full"
                    data-testid="pagination-next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20" data-testid="no-posts">
              <p className="text-gray-400 text-lg mb-4">No posts found in this category yet.</p>
              <Link to="/write" className="text-b4b-blue font-semibold hover:underline no-underline" data-testid="no-posts-write-link">
                Be the first to write one!
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
