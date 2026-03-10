import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Package, Heart, Settings, LayoutDashboard, LogOut, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BrandLogo } from '../components/BrandLogo';
import { showInfoToast, showSuccessToast } from '../lib/notifications';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { clearAuthSession, useAuthSession } from '../lib/auth';

// Dashboard view type
type DashboardView = 'overview' | 'orders' | 'wishlist' | 'settings';

// Order type
interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: number;
}

// Mock order data
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: '#CZP-10847',
    date: 'March 3, 2026',
    status: 'Delivered',
    total: 74.97,
    items: 3,
  },
  {
    id: '2',
    orderNumber: '#CZP-10823',
    date: 'February 28, 2026',
    status: 'Shipped',
    total: 49.98,
    items: 2,
  },
  {
    id: '3',
    orderNumber: '#CZP-10801',
    date: 'February 15, 2026',
    status: 'Processing',
    total: 24.99,
    items: 1,
  },
  {
    id: '4',
    orderNumber: '#CZP-10776',
    date: 'February 1, 2026',
    status: 'Delivered',
    total: 99.96,
    items: 4,
  },
  {
    id: '5',
    orderNumber: '#CZP-10745',
    date: 'January 22, 2026',
    status: 'Cancelled',
    total: 22.99,
    items: 1,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<DashboardView>('orders');
  const authSession = useAuthSession();

  useEffect(() => {
    if (!authSession?.isAuthenticated) {
      navigate('/login');
    }
  }, [authSession?.isAuthenticated, navigate]);

  // Get status badge color
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return { bg: '#E8F5E9', text: '#4A5D45', border: '#C8E6C9' }; // Light green
      case 'Shipped':
        return { bg: '#E3F2FD', text: '#5A7050', border: '#BBDEFB' }; // Light blue
      case 'Processing':
        return { bg: '#FFF9E6', text: '#7A6F4A', border: '#FFE082' }; // Light yellow
      case 'Cancelled':
        return { bg: '#FFEBEE', text: '#8B5A5A', border: '#FFCDD2' }; // Light red
      default:
        return { bg: '#F5F5F5', text: '#666666', border: '#E0E0E0' };
    }
  };

  // Handle logout
  const handleLogout = () => {
    clearAuthSession();
    showSuccessToast('Signed out successfully.', 'Your demo session has ended.');
    navigate('/');
  };

  if (!authSession?.isAuthenticated) {
    return null;
  }

  const initials = `${authSession.firstName?.[0] ?? 'C'}${authSession.lastName?.[0] ?? ''}`.toUpperCase();
  const fullName = [authSession.firstName, authSession.lastName].filter(Boolean).join(' ');

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FAF8F3' }}>
      {/* LEFT SIDEBAR - Navigation */}
      <aside 
        className="w-64 border-r flex-shrink-0 hidden lg:flex lg:flex-col"
        style={{ 
          backgroundColor: '#FFFFFF',
          borderColor: '#D4C4B0'
        }}
        aria-label="Dashboard navigation"
      >
        <div className="p-8">
          {/* Logo */}
          <BrandLogo className="mb-12 block" imageClassName="h-16 w-auto" />

          {/* User Info */}
          <div className="mb-10 pb-8 border-b" style={{ borderColor: '#D4C4B0' }}>
            <div 
              className="w-16 h-16 rounded-full mb-4 flex items-center justify-center text-2xl"
              style={{ 
                backgroundColor: '#F4A6B2',
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600
              }}
            >
              {initials}
            </div>
            <h2 
              className="text-lg mb-1" 
              style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}
            >
              {fullName || authSession.firstName}
            </h2>
            <p 
              className="text-sm"
              style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
            >
              {authSession.email}
            </p>
          </div>

          {/* Navigation Menu */}
          <nav aria-label="Dashboard menu">
            <ul className="space-y-2" role="list">
              {/* Dashboard */}
              <li>
                <button
                  onClick={() => setCurrentView('overview')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                  style={{
                    backgroundColor: currentView === 'overview' ? '#F4F3EF' : 'transparent',
                    color: currentView === 'overview' ? '#5A7050' : '#7A9070',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: currentView === 'overview' ? 600 : 500,
                  }}
                  aria-current={currentView === 'overview' ? 'page' : undefined}
                >
                  <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
                  <span>Dashboard</span>
                </button>
              </li>

              {/* My Orders */}
              <li>
                <button
                  onClick={() => setCurrentView('orders')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                  style={{
                    backgroundColor: currentView === 'orders' ? '#F4F3EF' : 'transparent',
                    color: currentView === 'orders' ? '#5A7050' : '#7A9070',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: currentView === 'orders' ? 600 : 500,
                  }}
                  aria-current={currentView === 'orders' ? 'page' : undefined}
                >
                  <Package className="w-5 h-5" aria-hidden="true" />
                  <span>My Orders</span>
                </button>
              </li>

              {/* Wishlist */}
              <li>
                <button
                  onClick={() => setCurrentView('wishlist')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                  style={{
                    backgroundColor: currentView === 'wishlist' ? '#F4F3EF' : 'transparent',
                    color: currentView === 'wishlist' ? '#5A7050' : '#7A9070',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: currentView === 'wishlist' ? 600 : 500,
                  }}
                  aria-current={currentView === 'wishlist' ? 'page' : undefined}
                >
                  <Heart className="w-5 h-5" aria-hidden="true" />
                  <span>Wishlist</span>
                </button>
              </li>

              {/* Settings */}
              <li>
                <button
                  onClick={() => setCurrentView('settings')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                  style={{
                    backgroundColor: currentView === 'settings' ? '#F4F3EF' : 'transparent',
                    color: currentView === 'settings' ? '#5A7050' : '#7A9070',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: currentView === 'settings' ? 600 : 500,
                  }}
                  aria-current={currentView === 'settings' ? 'page' : undefined}
                >
                  <Settings className="w-5 h-5" aria-hidden="true" />
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="mt-auto pt-8 mt-12 border-t" style={{ borderColor: '#D4C4B0' }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:opacity-70"
              style={{
                color: '#7A9070',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
              }}
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 lg:py-20">
          <Breadcrumbs items={[{ label: 'My Account' }]} className="mb-8" />
          
          {/* ORDERS VIEW */}
          {currentView === 'orders' && (
            <section aria-labelledby="orders-heading">
              {/* Page Header */}
              <header className="mb-10">
                <h2 
                  id="orders-heading"
                  className="text-4xl mb-3" 
                  style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}
                >
                  My Orders
                </h2>
                <p 
                  className="text-lg"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  View and track all your orders
                </p>
              </header>

              {/* Orders Table */}
              <div 
                className="rounded-3xl overflow-hidden"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #D4C4B0',
                  boxShadow: '0 10px 40px rgba(122, 144, 112, 0.12)'
                }}
              >
                <table className="w-full" role="table">
                  <thead>
                    <tr 
                      className="border-b"
                      style={{ 
                        backgroundColor: '#FAF8F3',
                        borderColor: '#D4C4B0'
                      }}
                    >
                      <th 
                        scope="col"
                        className="px-8 py-5 text-left text-sm"
                        style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          color: '#5A7050',
                          fontWeight: 600
                        }}
                      >
                        Order Number
                      </th>
                      <th 
                        scope="col"
                        className="px-8 py-5 text-left text-sm"
                        style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          color: '#5A7050',
                          fontWeight: 600
                        }}
                      >
                        Date
                      </th>
                      <th 
                        scope="col"
                        className="px-8 py-5 text-left text-sm"
                        style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          color: '#5A7050',
                          fontWeight: 600
                        }}
                      >
                        Status
                      </th>
                      <th 
                        scope="col"
                        className="px-8 py-5 text-left text-sm"
                        style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          color: '#5A7050',
                          fontWeight: 600
                        }}
                      >
                        Total
                      </th>
                      <th 
                        scope="col"
                        className="px-8 py-5 text-left text-sm"
                        style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          color: '#5A7050',
                          fontWeight: 600
                        }}
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map((order, index) => {
                      const statusColors = getStatusColor(order.status);
                      return (
                        <tr 
                          key={order.id}
                          className="border-b transition-all hover:bg-opacity-50"
                          style={{ 
                            borderColor: '#D4C4B0',
                            backgroundColor: 'transparent'
                          }}
                        >
                          {/* Order Number */}
                          <td 
                            className="px-8 py-6"
                            style={{ 
                              fontFamily: 'Inter, sans-serif', 
                              color: '#5A7050',
                              fontWeight: 600
                            }}
                          >
                            {order.orderNumber}
                          </td>

                          {/* Date */}
                          <td 
                            className="px-8 py-6"
                            style={{ 
                              fontFamily: 'Inter, sans-serif', 
                              color: '#4A5D45'
                            }}
                          >
                            {order.date}
                          </td>

                          {/* Status - Pill Badge */}
                          <td className="px-8 py-6">
                            <span 
                              className="inline-flex items-center px-4 py-2 rounded-full text-sm"
                              style={{ 
                                backgroundColor: statusColors.bg,
                                color: statusColors.text,
                                border: `1px solid ${statusColors.border}`,
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 500
                              }}
                              role="status"
                              aria-label={`Order status: ${order.status}`}
                            >
                              {order.status}
                            </span>
                          </td>

                          {/* Total */}
                          <td 
                            className="px-8 py-6"
                            style={{ 
                              fontFamily: 'Inter, sans-serif', 
                              color: '#5A7050',
                              fontWeight: 600
                            }}
                          >
                            ${order.total.toFixed(2)}
                          </td>

                          {/* View Details Button */}
                          <td className="px-8 py-6">
                            <button
                              onClick={() => showInfoToast(`Order ${order.orderNumber}`, 'Detailed order tracking is coming soon.')}
                              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105"
                              style={{
                                backgroundColor: '#7A9070',
                                color: '#FFFFFF',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 500,
                                fontSize: '0.875rem'
                              }}
                              aria-label={`View details for order ${order.orderNumber}`}
                            >
                              <span>View Details</span>
                              <ChevronRight className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Empty State (if no orders) */}
                {mockOrders.length === 0 && (
                  <div className="px-8 py-16 text-center">
                    <Package 
                      className="w-16 h-16 mx-auto mb-4"
                      style={{ color: '#D4C4B0' }}
                      aria-hidden="true"
                    />
                    <h3 
                      className="text-xl mb-2"
                      style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}
                    >
                      No orders yet
                    </h3>
                    <p 
                      className="mb-6"
                      style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                    >
                      Start shopping to see your orders here
                    </p>
                    <Link
                      to="/shop"
                      className="inline-block rounded-full px-8 py-3 transition-all hover:scale-105"
                      style={{
                        backgroundColor: '#7A9070',
                        color: '#FFFFFF',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        boxShadow: '0 6px 24px rgba(122, 144, 112, 0.4)'
                      }}
                      aria-label="Browse products in the shop"
                    >
                      Shop Now
                    </Link>
                  </div>
                )}
              </div>

              {/* Order Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {/* Total Orders */}
                <article 
                  className="p-6 rounded-2xl"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #D4C4B0'
                  }}
                >
                  <p 
                    className="text-sm mb-2"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                  >
                    Total Orders
                  </p>
                  <p 
                    className="text-3xl"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}
                  >
                    {mockOrders.length}
                  </p>
                </article>

                {/* Total Spent */}
                <article 
                  className="p-6 rounded-2xl"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #D4C4B0'
                  }}
                >
                  <p 
                    className="text-sm mb-2"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                  >
                    Total Spent
                  </p>
                  <p 
                    className="text-3xl"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}
                  >
                    ${mockOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </p>
                </article>

                {/* Active Orders */}
                <article 
                  className="p-6 rounded-2xl"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #D4C4B0'
                  }}
                >
                  <p 
                    className="text-sm mb-2"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                  >
                    Active Orders
                  </p>
                  <p 
                    className="text-3xl"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}
                  >
                    {mockOrders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length}
                  </p>
                </article>
              </div>
            </section>
          )}

          {/* DASHBOARD OVERVIEW */}
          {currentView === 'overview' && (
            <section aria-labelledby="dashboard-heading">
              <header className="mb-10">
                <h2 
                  id="dashboard-heading"
                  className="text-4xl mb-3" 
                  style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}
                >
                  Dashboard
                </h2>
                <p 
                  className="text-lg"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Welcome back, Jane!
                </p>
              </header>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <article 
                  className="p-6 rounded-2xl"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #D4C4B0',
                    boxShadow: '0 6px 24px rgba(122, 144, 112, 0.1)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Package className="w-8 h-8" style={{ color: '#7A9070' }} aria-hidden="true" />
                  </div>
                  <p 
                    className="text-sm mb-2"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                  >
                    Total Orders
                  </p>
                  <p 
                    className="text-3xl"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}
                  >
                    {mockOrders.length}
                  </p>
                </article>

                <article 
                  className="p-6 rounded-2xl"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #D4C4B0',
                    boxShadow: '0 6px 24px rgba(122, 144, 112, 0.1)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Heart className="w-8 h-8" style={{ color: '#F4A6B2' }} aria-hidden="true" />
                  </div>
                  <p 
                    className="text-sm mb-2"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                  >
                    Wishlist Items
                  </p>
                  <p 
                    className="text-3xl"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}
                  >
                    12
                  </p>
                </article>

                <article 
                  className="p-6 rounded-2xl"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #D4C4B0',
                    boxShadow: '0 6px 24px rgba(122, 144, 112, 0.1)'
                  }}
                >
                  <p 
                    className="text-sm mb-2"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                  >
                    Total Spent
                  </p>
                  <p 
                    className="text-3xl"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}
                  >
                    ${mockOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </p>
                </article>

                <article 
                  className="p-6 rounded-2xl"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #D4C4B0',
                    boxShadow: '0 6px 24px rgba(122, 144, 112, 0.1)'
                  }}
                >
                  <p 
                    className="text-sm mb-2"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                  >
                    Member Since
                  </p>
                  <p 
                    className="text-3xl"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}
                  >
                    2025
                  </p>
                </article>
              </div>

              {/* Recent Orders */}
              <div 
                className="rounded-3xl p-8"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #D4C4B0'
                }}
              >
                <h3 
                  className="text-2xl mb-6" 
                  style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}
                >
                  Recent Orders
                </h3>
                <div className="space-y-4">
                  {mockOrders.slice(0, 3).map(order => {
                    const statusColors = getStatusColor(order.status);
                    return (
                      <div 
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-xl"
                        style={{ backgroundColor: '#FAF8F3' }}
                      >
                        <div>
                          <p 
                            className="mb-1"
                            style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 600 }}
                          >
                            {order.orderNumber}
                          </p>
                          <p 
                            className="text-sm"
                            style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                          >
                            {order.date} · {order.items} {order.items === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span 
                            className="inline-block px-3 py-1 rounded-full text-xs mb-2"
                            style={{ 
                              backgroundColor: statusColors.bg,
                              color: statusColors.text,
                              border: `1px solid ${statusColors.border}`,
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 500
                            }}
                          >
                            {order.status}
                          </span>
                          <p 
                            style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 600 }}
                          >
                            ${order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentView('orders')}
                  className="w-full mt-6 py-3 rounded-full transition-all hover:scale-105"
                  style={{
                    backgroundColor: '#7A9070',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600
                  }}
                >
                  View All Orders
                </button>
              </div>
            </section>
          )}

          {/* WISHLIST VIEW (Placeholder) */}
          {currentView === 'wishlist' && (
            <section aria-labelledby="wishlist-heading">
              <header className="mb-10">
                <h2 
                  id="wishlist-heading"
                  className="text-4xl mb-3" 
                  style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}
                >
                  My Wishlist
                </h2>
                <p 
                  className="text-lg"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Your saved items
                </p>
              </header>
              <div 
                className="rounded-3xl p-16 text-center"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #D4C4B0'
                }}
              >
                <Heart className="w-16 h-16 mx-auto mb-4" style={{ color: '#F4A6B2' }} aria-hidden="true" />
                <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>
                  Wishlist feature coming soon
                </p>
              </div>
            </section>
          )}

          {/* SETTINGS VIEW (Placeholder) */}
          {currentView === 'settings' && (
            <section aria-labelledby="settings-heading">
              <header className="mb-10">
                <h2 
                  id="settings-heading"
                  className="text-4xl mb-3" 
                  style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}
                >
                  Settings
                </h2>
                <p 
                  className="text-lg"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Manage your account preferences
                </p>
              </header>
              <div 
                className="rounded-3xl p-16 text-center"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #D4C4B0'
                }}
              >
                <Settings className="w-16 h-16 mx-auto mb-4" style={{ color: '#7A9070' }} aria-hidden="true" />
                <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>
                  Settings feature coming soon
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}