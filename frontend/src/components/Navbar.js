import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, X, PenLine, LogIn, LogOut, User, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../components/ui/dropdown-menu';

const RAINBOW = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#14B8A6', '#3B82F6', '#A855F7', '#EC4899', '#A16207', '#EF4444', '#3B82F6', '#22C55E', '#F97316'];
const LOGO_TEXT = "BLOGS 4 BLOCKS";

export default function Navbar() {
  const { user, logout, categories } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-0.5 no-underline" data-testid="nav-logo">
            {LOGO_TEXT.split('').map((char, i) => (
              <span
                key={i}
                className="rainbow-letter font-heading text-lg sm:text-xl font-black"
                style={{ color: char === ' ' ? 'transparent' : RAINBOW[i % RAINBOW.length] }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${isActive('/') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              data-testid="nav-home"
            >
              Home
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.startsWith('/category') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                  data-testid="nav-categories-dropdown"
                >
                  Topics <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {categories.map(cat => (
                  <DropdownMenuItem key={cat.slug} onClick={() => navigate(`/category/${cat.slug}`)} data-testid={`nav-cat-${cat.slug}`}>
                    <span className="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium">{cat.name}</span>
                    <span className="ml-auto text-xs text-gray-400">{cat.post_count}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/about"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${isActive('/about') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              data-testid="nav-about"
            >
              About
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              onClick={() => navigate('/write')}
              className="bg-black text-white hover:bg-gray-800 rounded-full font-bold shadow-[3px_3px_0px_0px_rgba(59,130,246,0.5)] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)] transition-all"
              data-testid="nav-write-btn"
            >
              <PenLine className="w-4 h-4 mr-1.5" />
              Write a Post
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors" data-testid="nav-user-menu">
                    <div className="w-7 h-7 rounded-full bg-b4b-blue flex items-center justify-center text-white text-xs font-bold">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="nav-profile-btn">
                    <User className="w-4 h-4 mr-2" />
                    My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { logout(); navigate('/'); }} data-testid="nav-logout-btn">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/auth')}
                className="rounded-full border-2 border-gray-200 hover:border-gray-300"
                data-testid="nav-login-btn"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="nav-mobile-toggle"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in-up" data-testid="nav-mobile-menu">
            <div className="flex flex-col gap-1">
              <Link to="/" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 no-underline" data-testid="nav-mobile-home">Home</Link>
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Topics</div>
              {categories.map(cat => (
                <Link key={cat.slug} to={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)} className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 no-underline" data-testid={`nav-mobile-cat-${cat.slug}`}>
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </Link>
              ))}
              <Link to="/about" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 no-underline" data-testid="nav-mobile-about">About</Link>
              {user && (
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 no-underline" data-testid="nav-mobile-profile">My Dashboard</Link>
              )}
              <div className="border-t border-gray-100 mt-2 pt-2 flex flex-col gap-2">
                <Button onClick={() => { navigate('/write'); setMobileOpen(false); }} className="bg-black text-white rounded-full font-bold" data-testid="nav-mobile-write-btn">
                  <PenLine className="w-4 h-4 mr-1.5" /> Write a Post
                </Button>
                {!user && (
                  <Button variant="outline" onClick={() => { navigate('/auth'); setMobileOpen(false); }} className="rounded-full" data-testid="nav-mobile-login-btn">
                    <LogIn className="w-4 h-4 mr-1.5" /> Sign In
                  </Button>
                )}
                {user && (
                  <Button variant="outline" onClick={() => { logout(); navigate('/'); setMobileOpen(false); }} className="rounded-full" data-testid="nav-mobile-logout-btn">
                    <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
