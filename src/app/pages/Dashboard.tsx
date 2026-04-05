import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Package, Heart, Settings, LayoutDashboard, LogOut, ChevronRight, Loader2, Menu, X } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { showSuccessToast } from '../lib/notifications';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { signOut, useAuthSession } from '../lib/auth';
import { PageSeo } from '../components/PageSeo';
import { getUserOrdersFromSupabase, type TrackedOrder } from '../lib/orderTracking';
import { useWishlist, removeFromWishlist } from '../lib/wishlist';
import { addToCart } from '../lib/cart';

// Dashboard view type
type DashboardView = 'overview' | 'orders' | 'wishlist' | 'settings';

// Order type mapped from tracked orders
interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: number;
}

function mapTrackedToOrder(tracked: TrackedOrder): Order {
  const statusMap: Record<string, Order['status']> = {
    'Confirmed': 'Processing',
    'Packed': 'Processing',
    'In Transit': 'Shipped',
    'Out for Delivery': 'Shipped',
    'Delivered': 'Delivered',
  };
  return {
    id: tracked.orderNumber,
    orderNumber: `#${tracked.orderNumber}`,
    date: tracked.orderPlacedAt || tracked.estimatedDelivery || '',
    status: statusMap[tracked.status] ?? 'Processing',
    total: tracked.total,
    items: tracked.items?.length ?? 0,
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<DashboardView>('orders');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const authSession = useAuthSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const { items: wishlistItems, loading: wishlistLoading } = useWishlist();

  useEffect(() => {
    async function loadOrders() {
      try {
        const tracked = await getUserOrdersFromSupabase();
        setOrders(tracked.map(mapTrackedToOrder));
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    }
    if (authSession?.isAuthenticated) {
      void loadOrders();
    }
  }, [authSession]);

  useEffect(() => {
    if (authSession === null) {
      navigate('/login');
    }
  }, [authSession, navigate]);

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
  const handleLogout = async () => {
    await signOut();
    showSuccessToast('Signed out successfully.', 'See you next time.');
    navigate('/');
  };

  if (authSession === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#FAF8F3' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>
          Loading your dashboard…
        </p>
      </div>
    );
  }

  if (!authSession?.isAuthenticated) {
    return null;
  }

  const initials = `${authSession.firstName?.[0] ?? 'C'}${authSession.lastName?.[0] ?? ''}`.toUpperCase();
  const fullName = [authSession.firstName, authSession.lastName].filter(Boolean).join(' ');

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FAF8F3' }}>
      <PageSeo title="My Account" />

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR - Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r flex-shrink-0 flex flex-col transform transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ 
          backgroundColor: '#FFFFFF',
          borderColor: '#D4C4B0'
        }}
        aria-label="Dashboard navigation"
      >
        <div className="p-8 flex-1 flex flex-col">
          {/* Logo + close button */}
          <div className="flex items-start justify-between mb-12">
            <BrandLogo className="block" imageClassName="h-16 w-auto" />
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
              <X className="w-5 h-5" style={{ color: '#7A9070' }} />
            </button>
          </div>

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
                  onClick={() => { setCurrentView('overview'); setSidebarOpen(false); }}
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
                  onClick={() => { setCurrentView('orders'); setSidebarOpen(false); }}
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
                  onClick={() => { setCurrentView('wishlist'); setSidebarOpen(false); }}
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
                  onClick={() => { setCurrentView('settings'); setSidebarOpen(false); }}
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:px-12 lg:py-20">
          {/* Mobile header with hamburger */}
          <div className="flex items-center gap-3 mb-4 lg:hidden">
            <button
              className="p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" style={{ color: '#7A9070' }} />
            </button>
            <h2 className="text-lg" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
              {currentView === 'overview' && 'Dashboard'}
              {currentView === 'orders' && 'My Orders'}
              {currentView === 'wishlist' && 'Wishlist'}
              {currentView === 'settings' && 'Settings'}
            </h2>
          </div>
          <Breadcrumbs items={[{ label: 'My Account' }]} className="mb-8" />
          
          {/* ORDERS VIEW */}
          {currentView === 'orders' && (
            <section aria-labelledby="orders-heading">
              {/* Page Header */}
              <header className="mb-10">
                <h2 
                  id="orders-heading"
                  className="text-2xl sm:text-3xl lg:text-4xl mb-3" 
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
                className="rounded-3xl overflow-hidden overflow-x-auto"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #D4C4B0',
                  boxShadow: '0 10px 40px rgba(122, 144, 112, 0.12)'
                }}
              >
                <table className="w-full min-w-[600px]" role="table">
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
                    {ordersLoading ? (
                      <tr><td colSpan={5} className="px-8 py-12 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading orders…</td></tr>
                    ) : orders.map((order, index) => {
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
                            <Link
                              to={`/track-order/${order.id}`}
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
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Empty State (if no orders) */}
                {!ordersLoading && orders.length === 0 && (
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
                    {orders.length}
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
                    ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
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
                    {orders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length}
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
                  Welcome back, {authSession.firstName}!
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
                    {orders.length}
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
                    {wishlistItems.length}
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
                    ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
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
                    {new Date().getFullYear()}
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
                  {orders.slice(0, 3).map(order => {
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

          {/* WISHLIST VIEW */}
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
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                </p>
              </header>
              {wishlistLoading ? (
                <div className="rounded-3xl p-16 text-center" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0' }}>
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#7A9070' }} />
                  <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Loading wishlist…</p>
                </div>
              ) : wishlistItems.length === 0 ? (
                <div className="rounded-3xl p-16 text-center" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0' }}>
                  <Heart className="w-16 h-16 mx-auto mb-4" style={{ color: '#F4A6B2' }} aria-hidden="true" />
                  <p className="mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Your wishlist is empty</p>
                  <Link to="/shop" className="inline-block rounded-full px-8 py-3 transition-all hover:scale-105" style={{ backgroundColor: '#7A9070', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {wishlistItems.map(item => (
                    <div key={item.id} className="flex gap-4 p-4 rounded-2xl" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0' }}>
                      <Link to={`/product/${item.productId}`}>
                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" style={{ border: '2px solid #F0F4F0' }} />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.productId}`}>
                          <h3 className="text-sm mb-1 truncate hover:opacity-70 transition-all" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>{item.name}</h3>
                        </Link>
                        <p className="text-lg mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}>${item.price.toFixed(2)}</p>
                        <div className="flex gap-2">
                          <button onClick={() => { void addToCart(item.productId); showSuccessToast('Added to cart', item.name); }} className="text-xs px-3 py-1 rounded-full transition-all hover:scale-105" style={{ backgroundColor: '#7A9070', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Add to Cart</button>
                          <button onClick={() => void removeFromWishlist(item.id)} className="text-xs px-3 py-1 rounded-full transition-all hover:scale-105" style={{ backgroundColor: '#FADADD', color: '#F4A6B2', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* SETTINGS VIEW */}
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
                className="rounded-3xl p-8"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #D4C4B0'
                }}
              >
                <h3 className="text-xl mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>Account Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#FAF8F3' }}>
                    <div>
                      <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Name</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 600 }}>{fullName || authSession.firstName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#FAF8F3' }}>
                    <div>
                      <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Email</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 600 }}>{authSession.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#FAF8F3' }}>
                    <div>
                      <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Total Orders</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 600 }}>{orders.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#FAF8F3' }}>
                    <div>
                      <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Wishlist Items</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 600 }}>{wishlistItems.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}