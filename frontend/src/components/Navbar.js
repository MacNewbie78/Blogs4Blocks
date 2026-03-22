import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, X, PenLine, LogIn, LogOut, User, ChevronDown, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../components/ui/dropdown-menu';

export default function Navbar() {
  const { user, logout, categories } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#FDFCF8]/80 backdrop-blur-xl border-b border-[#E5E5E5]" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-0 no-underline" data-testid="nav-logo">
            <span className="font-heading font-black text-xl tracking-tight text-[#1A1A1A]">
              BLOGS<span className="text-brand-yellow">4</span>BLOCKS
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 text-xs font-bold uppercase tracking-widest no-underline transition-colors ${isActive('/') ? 'text-[#1A1A1A]' : 'text-brand-grey hover:text-[#1A1A1A]'}`}
              data-testid="nav-home"
            >
              Home
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${location.pathname.startsWith('/category') ? 'text-[#1A1A1A]' : 'text-brand-grey hover:text-[#1A1A1A]'}`}
                  data-testid="nav-categories-dropdown"
                >
                  Topics <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 rounded-lg border-[#E5E5E5]">
                {categories.map(cat => (
                  <DropdownMenuItem key={cat.slug} onClick={() => navigate(`/category/${cat.slug}`)} data-testid={`nav-cat-${cat.slug}`}>
                    <span className="w-2 h-2 rounded-full mr-2.5 flex-shrink-0 bg-[#1A1A1A]" />
                    <span className="font-medium text-sm">{cat.name}</span>
                    <span className="ml-auto text-xs text-brand-grey">{cat.post_count}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/about"
              className={`px-3 py-2 text-xs font-bold uppercase tracking-widest no-underline transition-colors ${isActive('/about') ? 'text-[#1A1A1A]' : 'text-brand-grey hover:text-[#1A1A1A]'}`}
              data-testid="nav-about"
            >
              About
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              onClick={() => navigate('/write')}
              className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none h-10 px-6 uppercase tracking-widest text-xs font-bold transition-colors"
              data-testid="nav-write-btn"
            >
              <PenLine className="w-3.5 h-3.5 mr-2" />
              Write
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 border border-[#E5E5E5] hover:border-[#1A1A1A] transition-colors" data-testid="nav-user-menu">
                    <div className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-bold">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-brand-grey" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-lg border-[#E5E5E5]">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{user.name}</p>
                    <p className="text-xs text-brand-grey">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="nav-profile-btn">
                    <User className="w-4 h-4 mr-2" />
                    My Dashboard
                  </DropdownMenuItem>
                  {user.is_admin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} data-testid="nav-admin-btn">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
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
                className="rounded-none border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white uppercase tracking-widest text-xs font-bold h-10 px-6 transition-colors"
                data-testid="nav-login-btn"
              >
                <LogIn className="w-3.5 h-3.5 mr-2" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 hover:bg-[#F4F4F5] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="nav-mobile-toggle"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-6 border-t border-[#E5E5E5] animate-fade-in-up" data-testid="nav-mobile-menu">
            <div className="flex flex-col gap-1">
              <Link to="/" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:bg-[#F4F4F5] no-underline" data-testid="nav-mobile-home">Home</Link>
              <div className="px-3 py-2 text-[10px] font-bold text-brand-grey uppercase tracking-[0.2em]">Topics</div>
              {categories.map(cat => (
                <Link key={cat.slug} to={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)} className="flex items-center px-3 py-2 text-sm text-[#1A1A1A] hover:bg-[#F4F4F5] no-underline" data-testid={`nav-mobile-cat-${cat.slug}`}>
                  <span className="w-1.5 h-1.5 rounded-full mr-2.5 bg-brand-grey" />
                  {cat.name}
                </Link>
              ))}
              <Link to="/about" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:bg-[#F4F4F5] no-underline" data-testid="nav-mobile-about">About</Link>
              {user && (
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:bg-[#F4F4F5] no-underline" data-testid="nav-mobile-profile">My Dashboard</Link>
              )}
              {user?.is_admin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:bg-[#F4F4F5] no-underline" data-testid="nav-mobile-admin">
                  <Shield className="w-4 h-4" /> Admin Panel
                </Link>
              )}
              <div className="border-t border-[#E5E5E5] mt-4 pt-4 flex flex-col gap-2">
                <Button onClick={() => { navigate('/write'); setMobileOpen(false); }} className="bg-[#1A1A1A] text-white rounded-none font-bold uppercase tracking-widest text-xs" data-testid="nav-mobile-write-btn">
                  <PenLine className="w-3.5 h-3.5 mr-2" /> Write a Post
                </Button>
                {!user && (
                  <Button variant="outline" onClick={() => { navigate('/auth'); setMobileOpen(false); }} className="rounded-none border-[#1A1A1A] uppercase tracking-widest text-xs font-bold" data-testid="nav-mobile-login-btn">
                    <LogIn className="w-3.5 h-3.5 mr-2" /> Sign In
                  </Button>
                )}
                {user && (
                  <Button variant="outline" onClick={() => { logout(); navigate('/'); setMobileOpen(false); }} className="rounded-none border-[#E5E5E5] uppercase tracking-widest text-xs font-bold" data-testid="nav-mobile-logout-btn">
                    <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
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
