import { Link, useLocation } from 'react-router';
import { ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { isNavigationLinkActive, mainNavigationLinks } from '../lib/navigation';
import { useAuthSession } from '../lib/auth';

export function Header() {
  const [cartCount] = useState(2); // Demo cart count
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const wishlistCount = 4;
  const authSession = useAuthSession();
  const accountDestination = authSession?.isAuthenticated ? '/dashboard' : '/login';
  const trackOrderDestination = '/track-order';

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <div
        className="border-b px-4 py-2 md:px-6"
        style={{ backgroundColor: '#F6F3EC', borderColor: '#E8DDC8' }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-center text-xs sm:flex-row sm:items-center sm:justify-between sm:text-left" style={{ fontFamily: 'Inter, sans-serif', color: '#6E8167', fontWeight: 500 }}>
          <p>Free shipping on orders over 2000 RS</p>
          <div className="flex items-center justify-center gap-4 sm:justify-end">
            <Link to="/faq" className="transition-opacity hover:opacity-70">Shipping & Returns</Link>
            <Link to={trackOrderDestination} className="transition-opacity hover:opacity-70">Track Order</Link>
          </div>
        </div>
      </div>

      <header 
        className="sticky top-0 z-30 border-b px-4 py-4 md:px-6"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.96)', 
          borderColor: '#E5E7EB' 
        }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-[auto_1fr_auto] items-center gap-3 md:flex md:items-center md:justify-between md:gap-6">
          {/* Hamburger Menu Icon (Mobile Only) */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isSidebarOpen}
            aria-controls="mobile-navigation"
          >
            <Menu size={24} style={{ color: '#5A7050' }} />
          </button>

          {/* Logo - Centered on Mobile, Left on Desktop */}
          <BrandLogo
            className="justify-self-center transition-opacity hover:opacity-80 md:justify-self-start md:shrink-0"
            imageClassName="h-14 w-auto md:h-16"
          />
          
          {/* Main Navigation Links - Hidden on Mobile, Visible on Desktop */}
          <nav 
            className="hidden md:flex flex-1 items-center justify-center"
            aria-label="Main navigation"
          >
            <ul className="flex items-center gap-6 lg:gap-10">
              <li>
                <Link 
                  to="/"
                  className="rounded-full px-4 py-2 text-sm transition-all hover:opacity-80 uppercase tracking-wide"
                  style={{ 
                    fontFamily: 'Inter, sans-serif', 
                    color: location.pathname === '/' ? '#5A7050' : '#7A9070',
                    backgroundColor: location.pathname === '/' ? '#F3F6F2' : 'transparent',
                    fontWeight: location.pathname === '/' ? 600 : 500,
                    letterSpacing: '0.05em'
                  }}
                >
                  Home
                </Link>
              </li>
              {mainNavigationLinks.map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to}
                    className="rounded-full px-4 py-2 text-sm transition-all hover:opacity-80 uppercase tracking-wide"
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      color: isNavigationLinkActive(location.pathname, link) ? '#5A7050' : '#7A9070',
                      backgroundColor: isNavigationLinkActive(location.pathname, link) ? '#F3F6F2' : 'transparent',
                      fontWeight: isNavigationLinkActive(location.pathname, link) ? 600 : 500,
                      letterSpacing: '0.05em'
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Icons: User & Cart */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <Link 
              to="/wishlist"
              className="hidden md:block relative p-2.5 rounded-full transition-all hover:scale-105"
              style={{ backgroundColor: '#F0F4F0' }}
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart size={20} style={{ color: '#5A7050' }} />
            </Link>

            <Link 
              to={accountDestination}
              className="hidden md:block p-2.5 rounded-full transition-all hover:scale-105"
              style={{ backgroundColor: '#F0F4F0' }}
              aria-label={authSession?.isAuthenticated ? 'Open your account dashboard' : 'Open login screen'}
            >
              <User size={20} style={{ color: '#5A7050' }} />
            </Link>

            {/* Cart Icon with Badge */}
            <Link 
              to="/cart"
              className="relative p-2 md:p-2.5 rounded-full transition-all hover:scale-105"
              style={{ backgroundColor: '#F0F4F0' }}
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingCart size={20} style={{ color: '#5A7050' }} />
              {cartCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{ 
                    backgroundColor: '#F4A6B2',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        id="mobile-navigation"
        className={`fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#FFFFFF' }}
        aria-label="Mobile navigation drawer"
      >
        {/* Sidebar Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: '#E5E7EB' }}
        >
          <h2 
            className="text-2xl"
            style={{ 
              fontFamily: 'Playfair Display, serif', 
              color: '#5A7050', 
              fontWeight: 600 
            }}
          >
            Menu
          </h2>
          <button
            onClick={closeSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={24} style={{ color: '#5A7050' }} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav 
          className="px-6 py-6"
          aria-label="Mobile navigation"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.2em]" style={{ fontFamily: 'Inter, sans-serif', color: '#B7B09F', fontWeight: 600 }}>
            Shop & Discover
          </p>
          <ul className="mb-6 flex flex-col gap-3">
            <li>
              <Link 
                to="/"
                onClick={closeSidebar}
                className="block rounded-xl px-3 py-3 text-base transition-all hover:opacity-70"
                style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  color: location.pathname === '/' ? '#5A7050' : '#7A9070',
                  backgroundColor: location.pathname === '/' ? '#F3F6F2' : 'transparent',
                  fontWeight: location.pathname === '/' ? 600 : 500,
                }}
              >
                Home
              </Link>
            </li>
            {mainNavigationLinks.map((link) => (
              <li key={link.to}>
                <Link 
                  to={link.to}
                  onClick={closeSidebar}
                  className="block rounded-xl px-3 py-3 text-base transition-all hover:opacity-70"
                  style={{ 
                    fontFamily: 'Inter, sans-serif', 
                    color: isNavigationLinkActive(location.pathname, link) ? '#5A7050' : '#7A9070',
                    backgroundColor: isNavigationLinkActive(location.pathname, link) ? '#F3F6F2' : 'transparent',
                    fontWeight: isNavigationLinkActive(location.pathname, link) ? 600 : 500,
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mb-3 text-xs uppercase tracking-[0.2em]" style={{ fontFamily: 'Inter, sans-serif', color: '#B7B09F', fontWeight: 600 }}>
            Account
          </p>
          <ul className="mb-6 flex flex-col gap-3">
            <li>
              <Link 
                to="/wishlist"
                onClick={closeSidebar}
                className="block rounded-xl px-3 py-3 text-base transition-all hover:opacity-70"
                style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  color: location.pathname === '/wishlist' ? '#5A7050' : '#7A9070',
                  backgroundColor: location.pathname === '/wishlist' ? '#F3F6F2' : 'transparent',
                  fontWeight: location.pathname === '/wishlist' ? 600 : 500,
                }}
              >
                Wishlist
              </Link>
            </li>
            <li>
              <Link 
                to={accountDestination}
                onClick={closeSidebar}
                className="block rounded-xl px-3 py-3 text-base transition-all hover:opacity-70"
                style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  color: location.pathname.startsWith('/dashboard') || location.pathname === '/login' || location.pathname === '/register' ? '#5A7050' : '#7A9070',
                  backgroundColor: location.pathname.startsWith('/dashboard') || location.pathname === '/login' || location.pathname === '/register' ? '#F3F6F2' : 'transparent',
                  fontWeight: location.pathname.startsWith('/dashboard') || location.pathname === '/login' || location.pathname === '/register' ? 600 : 500,
                }}
              >
                {authSession?.isAuthenticated ? 'Dashboard' : 'Login / Register'}
              </Link>
            </li>
            <li>
              <Link 
                to="/cart"
                onClick={closeSidebar}
                className="block rounded-xl px-3 py-3 text-base transition-all hover:opacity-70"
                style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  color: location.pathname === '/cart' ? '#5A7050' : '#7A9070',
                  backgroundColor: location.pathname === '/cart' ? '#F3F6F2' : 'transparent',
                  fontWeight: location.pathname === '/cart' ? 600 : 500,
                }}
              >
                Cart ({cartCount})
              </Link>
            </li>
          </ul>

          <div className="rounded-2xl p-4" style={{ backgroundColor: '#F8F5EE', border: '1px solid #E8DDC8' }}>
            <p className="mb-2 text-sm" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>Need help with your order?</p>
            <p className="mb-3 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', lineHeight: 1.6 }}>Use FAQ for shipping answers or contact support directly.</p>
            <div className="flex gap-3">
              <Link to="/faq" onClick={closeSidebar} className="rounded-full px-4 py-2 text-sm" style={{ backgroundColor: '#FFFFFF', color: '#7A9070', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                FAQ
              </Link>
              <Link to="/contact" onClick={closeSidebar} className="rounded-full px-4 py-2 text-sm" style={{ backgroundColor: '#7A9070', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Contact
              </Link>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
