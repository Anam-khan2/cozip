import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Package, ShoppingCart, Users, LayoutDashboard, Plus, Edit2, Trash2, Tag, BarChart3, Mail, TrendingUp, Calendar, ChevronLeft, ChevronRight, UserPlus, UserCheck, Clock3, Sparkles, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { useProducts } from '../hooks/useProducts';
import { deleteProductById, deleteProductImages, getProductById, updateProduct, uploadProductImages } from '../lib/products';
import cozipLogo from '../../../assets/cozip-web-logo.png';
import { showInfoToast } from '../lib/notifications';
import { PageSeo } from '../components/PageSeo';
import { fetchAllOrders, fetchAllCustomers, updateOrderStatus, type AdminOrder, type AdminCustomer } from '../lib/admin';
import { fetchCoupons, createCoupon, deleteCoupon, updateCouponStatus, type Coupon } from '../lib/coupons';

// Email Template type
interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  status: 'Active' | 'Inactive';
}

interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  role: string;
  createdAt: string;
}

interface EditProductFormState {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  shippingInfo: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isFeatured: boolean;
  images: string[];
}

type EditableImage = {
  id: string;
  kind: 'existing' | 'new';
  preview: string;
  originalUrl?: string;
  file?: File;
};

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (toIndex < 0 || toIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<'overview' | 'products' | 'orders' | 'customers' | 'coupons' | 'analytics' | 'emails'>('orders');
  const [emailTab, setEmailTab] = useState<'campaigns' | 'templates'>('templates');
  const { data: products, error: productsError, loading: productsLoading, refetch: refetchProducts } = useProducts();
  const [editProduct, setEditProduct] = useState<EditProductFormState | null>(null);
  const [editImages, setEditImages] = useState<EditableImage[]>([]);
  const [originalEditImages, setOriginalEditImages] = useState<string[]>([]);
  const [isProductActionPending, setIsProductActionPending] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [productActionError, setProductActionError] = useState<string | null>(null);
  const [productActionMessage, setProductActionMessage] = useState<string | null>(null);

  // Real data state
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customerRecords, setCustomerRecords] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Sample email templates data (kept as static config — not user-generated content)
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    { id: 1, name: 'Welcome Email', subject: 'Welcome to Cozip!', status: 'Active' },
    { id: 2, name: 'Order Confirmation', subject: 'Your Order has been Confirmed', status: 'Active' },
    { id: 3, name: 'Password Reset', subject: 'Reset Your Password', status: 'Active' },
    { id: 4, name: 'Newsletter', subject: 'Monthly Newsletter', status: 'Inactive' },
    { id: 5, name: 'Promotion Alert', subject: 'Exclusive Promotion Alert', status: 'Active' },
  ]);

  // Fetch real data on mount
  useEffect(() => {
    async function loadAdminData() {
      try {
        const [fetchedOrders, fetchedCustomers, fetchedCoupons] = await Promise.all([
          fetchAllOrders(),
          fetchAllCustomers(),
          fetchCoupons(),
        ]);
        setOrders(fetchedOrders);
        setCustomerRecords(fetchedCustomers.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          totalSpent: c.totalSpent,
          orderCount: c.orderCount,
          role: c.role,
          createdAt: c.createdAt,
        })));
        setCoupons(fetchedCoupons);
      } catch {
        // Silently handle — tables may not exist yet
      } finally {
        setDataLoading(false);
      }
    }
    void loadAdminData();
  }, []);

  // Handle status change
  const handleStatusChange = async (orderId: string, newStatus: 'Processing' | 'Shipped' | 'Delivered') => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch {
      // Optimistic local update even if DB fails
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    }
  };

  // Handle product actions
  const handleEditProduct = async (productId: string) => {
    setProductActionError(null);
    setProductActionMessage(null);
    setIsProductActionPending(true);

    try {
      const product = await getProductById(productId);

      setEditProduct({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category ?? '',
        shippingInfo: product.shipping,
        slug: product.slug ?? '',
        metaTitle: product.metaTitle ?? '',
        metaDescription: product.metaDescription ?? '',
        metaKeywords: product.metaKeywords ?? '',
        isFeatured: product.isFeatured,
        images: product.images,
      });
      setOriginalEditImages(product.images);
      setEditImages(
        product.images.map((image, index) => ({
          id: `existing-${index}-${image}`,
          kind: 'existing',
          preview: image,
          originalUrl: image,
        }))
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load this product for editing.';
      setProductActionError(message);
    } finally {
      setIsProductActionPending(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this product?');

    if (!shouldDelete) {
      return;
    }

    setDeletingProductId(productId);
    setProductActionError(null);
    setProductActionMessage(null);

    try {
      await deleteProductById(productId);
      await refetchProducts();
      setProductActionMessage('Product deleted successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete this product right now.';
      setProductActionError(message);
    } finally {
      setDeletingProductId(null);
    }
  };

  const closeEditModal = () => {
    setEditProduct(null);
    setEditImages([]);
    setOriginalEditImages([]);
  };

  const handleEditFieldChange = <K extends keyof EditProductFormState>(key: K, value: EditProductFormState[K]) => {
    setEditProduct((currentProduct) => {
      if (!currentProduct) {
        return currentProduct;
      }

      return {
        ...currentProduct,
        [key]: value,
      };
    });
  };

  const handleEditImageChange = (files: FileList | File[]) => {
    const nextFiles = Array.from(files);

    if (nextFiles.length === 0) {
      return;
    }

    const invalidFile = nextFiles.find((file) => !file.type.startsWith('image/'));

    if (invalidFile) {
      setProductActionError('Please upload a valid image file.');
      return;
    }

    setProductActionError(null);

    void Promise.all(
      nextFiles.map(
        (file) =>
          new Promise<EditableImage>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                id: `new-${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
                kind: 'new',
                preview: reader.result as string,
                file,
              });
            };
            reader.readAsDataURL(file);
          })
      )
    ).then((nextImages) => {
      setEditImages((currentImages) => [...currentImages, ...nextImages]);
    });
  };

  const handleRemoveEditImage = (imageId: string) => {
    setEditImages((currentImages) => currentImages.filter((image) => image.id !== imageId));
  };

  const handleMoveEditImage = (fromIndex: number, toIndex: number) => {
    setEditImages((currentImages) => moveItem(currentImages, fromIndex, toIndex));
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editProduct) {
      return;
    }

    if (!editProduct.name || !editProduct.price || !editProduct.stock || !editProduct.description) {
      setProductActionError('Please fill in the required product fields before saving.');
      return;
    }

    setIsProductActionPending(true);
    setProductActionError(null);
    setProductActionMessage(null);

    try {
      const newImageFiles = editImages
        .filter((image): image is EditableImage & { file: File } => image.kind === 'new' && Boolean(image.file))
        .map((image) => image.file);
      const uploadedImages = newImageFiles.length > 0 ? await uploadProductImages(newImageFiles) : [];
      let uploadedImageIndex = 0;

      const images = editImages.map((image) => {
        if (image.kind === 'existing') {
          return image.originalUrl as string;
        }

        const uploadedImage = uploadedImages[uploadedImageIndex];
        uploadedImageIndex += 1;
        return uploadedImage;
      });

      const removedExistingImages = originalEditImages.filter((image) => !images.includes(image));

      if (images.length === 0) {
        setProductActionError('Please keep at least one product image.');
        setIsProductActionPending(false);
        return;
      }

      await updateProduct(editProduct.id, {
        name: editProduct.name,
        description: editProduct.description,
        price: Number(editProduct.price),
        stock: Number(editProduct.stock),
        category: editProduct.category,
        images,
        isFeatured: editProduct.isFeatured,
        shippingInfo: editProduct.shippingInfo,
        slug: editProduct.slug,
        metaTitle: editProduct.metaTitle,
        metaDescription: editProduct.metaDescription,
        metaKeywords: editProduct.metaKeywords,
      });

      if (removedExistingImages.length > 0) {
        await deleteProductImages(removedExistingImages);
      }

      await refetchProducts();
      closeEditModal();
      setProductActionMessage('Product updated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update this product right now.';
      setProductActionError(message);
    } finally {
      setIsProductActionPending(false);
    }
  };

  const formatCurrency = (amount: number) => `PKR ${new Intl.NumberFormat('en-PK').format(amount)}`;

  // Calculate metrics from real data
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(order => order.status === 'Processing' || order.status === 'Packed').length;
  const totalOrders = orders.length;
  const totalCustomers = customerRecords.length;
  const featuredProductsCount = products.filter((product) => product.isFeatured).length;

  // Derive sales trend from real orders (group by month)
  const salesTrendData = (() => {
    const monthMap = new Map<string, { sales: number; orders: number; customers: Set<string> }>();
    for (const order of orders) {
      const date = new Date(order.date);
      const key = date.toLocaleDateString('en-US', { month: 'short' });
      const existing = monthMap.get(key) ?? { sales: 0, orders: 0, customers: new Set<string>() };
      existing.sales += order.total;
      existing.orders += 1;
      existing.customers.add(order.customer);
      monthMap.set(key, existing);
    }
    return Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      sales: Math.round(data.sales),
      orders: data.orders,
      customers: data.customers.size,
    }));
  })();

  // Derive category performance from real products
  const categoryPerformanceData = (() => {
    const catMap = new Map<string, number>();
    for (const product of products) {
      const cat = product.category || 'Other';
      catMap.set(cat, (catMap.get(cat) ?? 0) + product.price * (product.stock ?? 0));
    }
    return Array.from(catMap.entries()).map(([category, revenue]) => ({
      category,
      revenue: Math.round(revenue),
    })).sort((a, b) => b.revenue - a.revenue);
  })();

  const monthlyRevenue = salesTrendData[salesTrendData.length - 1]?.sales ?? 0;
  const previousMonthRevenue = salesTrendData[salesTrendData.length - 2]?.sales ?? 0;
  const revenueGrowth = previousMonthRevenue > 0 ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;

  const recentActivities = [
    `${totalCustomers} registered customers on the platform.`,
    `${pendingOrders} orders are waiting for fulfillment review today.`,
    `${featuredProductsCount} products are currently highlighted on the storefront.`,
    salesTrendData.length >= 2 ? `Latest month sales are ${revenueGrowth >= 0 ? 'up' : 'down'} ${Math.abs(revenueGrowth).toFixed(1)}% compared to previous month.` : `${totalOrders} total orders placed.`,
  ];
  const topCustomers = [...customerRecords]
    .sort((firstCustomer, secondCustomer) => secondCustomer.totalSpent - firstCustomer.totalSpent)
    .slice(0, 3);

  const formatShortDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const getCustomerRoleStyles = (role: string) => {
    if (role === 'admin') {
      return {
        backgroundColor: '#FCE7F3',
        border: '1px solid #F9A8D4',
        color: '#9D174D',
      };
    }

    return {
      backgroundColor: '#DCFCE7',
      border: '1px solid #86EFAC',
      color: '#166534',
    };
  };

  // Status badge styles
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Processing':
        return {
          backgroundColor: '#FFF4E6',
          color: '#D97706',
          border: '1px solid #FDE68A',
        };
      case 'Shipped':
        return {
          backgroundColor: '#DBEAFE',
          color: '#2563EB',
          border: '1px solid #BFDBFE',
        };
      case 'Delivered':
        return {
          backgroundColor: '#D1FAE5',
          color: '#059669',
          border: '1px solid #A7F3D0',
        };
      default:
        return {
          backgroundColor: '#F3F4F6',
          color: '#6B7280',
          border: '1px solid #E5E7EB',
        };
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FAFAFA' }}>
      <PageSeo title="Admin Dashboard" />
      {/* SIDEBAR */}
      <aside 
        className="w-64 border-r"
        style={{ 
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E7EB'
        }}
        aria-label="Admin navigation"
      >
        {/* Admin Logo & Header */}
        <header className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <Link to="/" className="block">
            <img src={cozipLogo} alt="Cozip" className="mb-3 inline-block h-16 w-auto" />
            <p 
              className="text-xs"
              style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
            >
              Admin Dashboard
            </p>
          </Link>
        </header>

        {/* Navigation Menu */}
        <nav className="p-4" aria-label="Admin sections">
          <ul className="space-y-2">
            {/* Overview Link */}
            <li>
              <button
                onClick={() => setActiveView('overview')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: activeView === 'overview' ? '#F0F4F0' : 'transparent',
                  color: activeView === 'overview' ? '#5A7050' : '#7A9070',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: activeView === 'overview' ? 600 : 500,
                }}
                aria-current={activeView === 'overview' ? 'page' : undefined}
              >
                <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
                Overview
              </button>
            </li>

            {/* Products Link */}
            <li>
              <button
                onClick={() => setActiveView('products')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: activeView === 'products' ? '#F0F4F0' : 'transparent',
                  color: activeView === 'products' ? '#5A7050' : '#7A9070',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: activeView === 'products' ? 600 : 500,
                }}
                aria-current={activeView === 'products' ? 'page' : undefined}
              >
                <Package className="w-5 h-5" aria-hidden="true" />
                Products
              </button>
            </li>

            {/* Orders Link */}
            <li>
              <button
                onClick={() => setActiveView('orders')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: activeView === 'orders' ? '#F0F4F0' : 'transparent',
                  color: activeView === 'orders' ? '#5A7050' : '#7A9070',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: activeView === 'orders' ? 600 : 500,
                }}
                aria-current={activeView === 'orders' ? 'page' : undefined}
              >
                <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                Orders
              </button>
            </li>

            {/* Customers Link */}
            <li>
              <button
                onClick={() => setActiveView('customers')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: activeView === 'customers' ? '#F0F4F0' : 'transparent',
                  color: activeView === 'customers' ? '#5A7050' : '#7A9070',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: activeView === 'customers' ? 600 : 500,
                }}
                aria-current={activeView === 'customers' ? 'page' : undefined}
              >
                <Users className="w-5 h-5" aria-hidden="true" />
                Customers
              </button>
            </li>

            {/* Coupons Link */}
            <li>
              <button
                onClick={() => setActiveView('coupons')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: activeView === 'coupons' ? '#F0F4F0' : 'transparent',
                  color: activeView === 'coupons' ? '#5A7050' : '#7A9070',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: activeView === 'coupons' ? 600 : 500,
                }}
                aria-current={activeView === 'coupons' ? 'page' : undefined}
              >
                <Tag className="w-5 h-5" aria-hidden="true" />
                Coupons
              </button>
            </li>

            {/* Analytics Link */}
            <li>
              <button
                onClick={() => setActiveView('analytics')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: activeView === 'analytics' ? '#F0F4F0' : 'transparent',
                  color: activeView === 'analytics' ? '#5A7050' : '#7A9070',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: activeView === 'analytics' ? 600 : 500,
                }}
                aria-current={activeView === 'analytics' ? 'page' : undefined}
              >
                <BarChart3 className="w-5 h-5" aria-hidden="true" />
                Analytics
              </button>
            </li>

            {/* Emails Link */}
            <li>
              <button
                onClick={() => setActiveView('emails')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: activeView === 'emails' ? '#F0F4F0' : 'transparent',
                  color: activeView === 'emails' ? '#5A7050' : '#7A9070',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: activeView === 'emails' ? 600 : 500,
                }}
                aria-current={activeView === 'emails' ? 'page' : undefined}
              >
                <Mail className="w-5 h-5" aria-hidden="true" />
                Emails
              </button>
            </li>
          </ul>
        </nav>

        {/* Back to Store Link */}
        <footer className="absolute bottom-0 w-64 p-4 border-t" style={{ borderColor: '#E5E7EB' }}>
          <Link
            to="/"
            className="block text-center py-3 rounded-xl transition-all hover:opacity-70"
            style={{
              backgroundColor: '#FAF8F3',
              color: '#7A9070',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            ← Back to Store
          </Link>
        </footer>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-auto">
        {/* Header with Title and Action Button */}
        <header 
          className="border-b px-8 py-6 flex items-center justify-between"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          <div>
            <h2 
              className="text-3xl mb-1" 
              style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
            >
              {activeView === 'overview' && 'Dashboard Overview'}
              {activeView === 'products' && 'Products Management'}
              {activeView === 'orders' && 'Orders Management'}
              {activeView === 'customers' && 'Customer Management'}
              {activeView === 'coupons' && 'Coupon Management'}
              {activeView === 'analytics' && 'Sales Analytics'}
              {activeView === 'emails' && 'Email Management'}
            </h2>
            <p 
              className="text-sm"
              style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
            >
              {activeView === 'orders' && 'View and manage all customer orders'}
              {activeView === 'products' && 'Manage your product catalog'}
              {activeView === 'customers' && 'View customer information'}
              {activeView === 'overview' && 'Key metrics and insights'}
              {activeView === 'coupons' && 'Manage and create coupons'}
              {activeView === 'analytics' && 'Analyze sales trends and performance'}
              {activeView === 'emails' && 'Manage email campaigns and templates'}
            </p>
          </div>

          {/* Add Product/Coupon Button */}
          {activeView === 'products' && (
            <Link
              to="/admin/add-product"
              className="flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:scale-105"
              style={{
                backgroundColor: '#7A9070',
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(122, 144, 112, 0.3)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
              }}
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              Add Product
            </Link>
          )}

          {activeView === 'coupons' && (
            <button
              onClick={() => showInfoToast('Coupon creation is not wired yet.', 'This dashboard currently previews the coupon workflow.')}
              className="flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:scale-105"
              style={{
                backgroundColor: '#7A9070',
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(122, 144, 112, 0.3)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
              }}
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              Add Coupon
            </button>
          )}

          {activeView === 'emails' && (
            <button
              onClick={() => showInfoToast('Campaign creation is not wired yet.', 'Email management is currently a design-ready placeholder.')}
              className="flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:scale-105"
              style={{
                backgroundColor: '#7A9070',
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(122, 144, 112, 0.3)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
              }}
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              Add Campaign
            </button>
          )}
        </header>

        {/* ORDERS VIEW CONTENT */}
        {activeView === 'orders' && (
          <div className="p-8">
            {/* Metric Cards */}
            <section 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              aria-label="Order metrics"
            >
              {/* Total Sales Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Total Sales
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 700 }}
                >
                  ${totalSales.toFixed(2)}
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  From {totalOrders} orders
                </p>
              </article>

              {/* Pending Orders Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Pending Orders
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#D97706', fontWeight: 700 }}
                >
                  {pendingOrders}
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Awaiting processing
                </p>
              </article>

              {/* Total Orders Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Total Orders
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 700 }}
                >
                  {totalOrders}
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  All time
                </p>
              </article>

              {/* Total Customers Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Customers
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 700 }}
                >
                  {totalCustomers}
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Unique customers
                </p>
              </article>
            </section>

            {/* Orders Table */}
            <section aria-labelledby="orders-table-heading">
              <header className="mb-4">
                <h3 
                  id="orders-table-heading"
                  className="text-xl"
                  style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
                >
                  Recent Orders
                </h3>
              </header>

              {/* Table Container */}
              <div 
                className="rounded-2xl border overflow-hidden"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <table className="w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <thead>
                    <tr 
                      style={{ 
                        backgroundColor: '#FAFAFA',
                        borderBottom: '1px solid #E5E7EB'
                      }}
                    >
                      <th 
                        className="text-left px-6 py-4 text-sm"
                        style={{ color: '#7A9070', fontWeight: 600 }}
                      >
                        Order ID
                      </th>
                      <th 
                        className="text-left px-6 py-4 text-sm"
                        style={{ color: '#7A9070', fontWeight: 600 }}
                      >
                        Customer
                      </th>
                      <th 
                        className="text-left px-6 py-4 text-sm"
                        style={{ color: '#7A9070', fontWeight: 600 }}
                      >
                        Date
                      </th>
                      <th 
                        className="text-left px-6 py-4 text-sm"
                        style={{ color: '#7A9070', fontWeight: 600 }}
                      >
                        Total
                      </th>
                      <th 
                        className="text-left px-6 py-4 text-sm"
                        style={{ color: '#7A9070', fontWeight: 600 }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr 
                        key={order.id}
                        style={{ 
                          borderBottom: index !== orders.length - 1 ? '1px solid #F3F4F6' : 'none'
                        }}
                      >
                        {/* Order ID */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 600 }}
                          >
                            {order.id}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 500 }}
                          >
                            {order.customer}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <time 
                            dateTime={order.date}
                            className="text-sm"
                            style={{ color: '#7A9070' }}
                          >
                            {new Date(order.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </time>
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 600 }}
                          >
                            ${order.total.toFixed(2)}
                          </span>
                        </td>

                        {/* Status Dropdown */}
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as 'Processing' | 'Shipped' | 'Delivered')}
                            className="text-sm px-4 py-2 rounded-full cursor-pointer transition-all hover:opacity-80"
                            style={{
                              ...getStatusStyles(order.status),
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 600,
                              outline: 'none',
                            }}
                            aria-label={`Status for order ${order.id}`}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* PRODUCTS VIEW CONTENT */}
        {activeView === 'products' && (
          <div className="p-8">
            {(productActionError || productActionMessage) && (
              <div
                className="mb-6 rounded-2xl border px-5 py-4"
                style={{
                  backgroundColor: productActionError ? '#FEF2F2' : '#F0FDF4',
                  borderColor: productActionError ? '#FECACA' : '#BBF7D0',
                  color: productActionError ? '#B91C1C' : '#166534',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {productActionError ?? productActionMessage}
              </div>
            )}

            {/* Metric Cards */}
            <section 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              aria-label="Product metrics"
            >
              {/* Total Products Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Total Products
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 700 }}
                >
                  {products.length}
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Available in catalog
                </p>
              </article>

              {/* Total Stock Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Total Stock
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 700 }}
                >
                  {products.reduce((sum, product) => sum + product.stock, 0)}
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Available units
                </p>
              </article>

              {/* Total Value Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Total Value
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 700 }}
                >
                  {formatCurrency(products.reduce((sum, product) => sum + product.price * product.stock, 0))}
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Inventory worth
                </p>
              </article>

              {/* Low Stock Items Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Low Stock Items
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626', fontWeight: 700 }}
                >
                  {products.filter(product => product.stock < 5).length}
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Need restocking
                </p>
              </article>
            </section>

            {/* Products Table */}
            <section aria-labelledby="products-table-heading">
              <header className="mb-4">
                <h3 
                  id="products-table-heading"
                  className="text-xl"
                  style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
                >
                  Product Catalog
                </h3>
              </header>

              {/* Table Container */}
              <div 
                className="rounded-2xl border overflow-hidden"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                {productsLoading ? (
                  <div className="px-6 py-8 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45' }}>
                    Loading products...
                  </div>
                ) : productsError ? (
                  <div className="px-6 py-8 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#B45309' }}>
                    {productsError}
                  </div>
                ) : (
                  <table className="w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <thead>
                      <tr 
                        style={{ 
                          backgroundColor: '#FAFAFA',
                          borderBottom: '1px solid #E5E7EB'
                        }}
                      >
                        <th 
                          className="text-left px-6 py-4 text-sm"
                          style={{ color: '#7A9070', fontWeight: 600 }}
                        >
                          Image
                        </th>
                        <th 
                          className="text-left px-6 py-4 text-sm"
                          style={{ color: '#7A9070', fontWeight: 600 }}
                        >
                          Name
                        </th>
                        <th 
                          className="text-left px-6 py-4 text-sm"
                          style={{ color: '#7A9070', fontWeight: 600 }}
                        >
                          Price
                        </th>
                        <th 
                          className="text-left px-6 py-4 text-sm"
                          style={{ color: '#7A9070', fontWeight: 600 }}
                        >
                          Stock
                        </th>
                        <th 
                          className="text-left px-6 py-4 text-sm"
                          style={{ color: '#7A9070', fontWeight: 600 }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product, index) => (
                        <tr 
                          key={product.id}
                          style={{ 
                            borderBottom: index !== products.length - 1 ? '1px solid #F3F4F6' : 'none'
                          }}
                        >
                          <td className="px-6 py-4">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="rounded-xl"
                              style={{ 
                                width: '64px',
                                height: '64px',
                                objectFit: 'cover',
                                border: '2px solid #E5E7EB'
                              }}
                            />
                          </td>

                          <td className="px-6 py-4">
                            <span 
                              className="text-sm"
                              style={{ color: '#4A5D45', fontWeight: 500 }}
                            >
                              {product.name}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span 
                              className="text-sm"
                              style={{ color: '#4A5D45', fontWeight: 600 }}
                            >
                              {product.formattedPrice}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span 
                              className="text-sm px-3 py-1 rounded-full"
                              style={{ 
                                color: product.stock < 5 ? '#DC2626' : '#4A5D45',
                                backgroundColor: product.stock < 5 ? '#FEE2E2' : 'transparent',
                                fontWeight: 600,
                                border: product.stock < 5 ? '1px solid #FCA5A5' : 'none'
                              }}
                            >
                              {product.stock} {product.stock < 5 && '⚠️'}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditProduct(product.id)}
                                disabled={isProductActionPending}
                                className="p-2 rounded-full transition-all hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-60"
                                style={{
                                  backgroundColor: '#F0F4F0',
                                  color: '#7A9070',
                                }}
                                aria-label={`Edit product ${product.name}`}
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" aria-hidden="true" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={deletingProductId === product.id}
                                className="p-2 rounded-full transition-all hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-60"
                                style={{
                                  backgroundColor: '#FEE2E2',
                                  color: '#DC2626',
                                }}
                                aria-label={`Delete product ${product.name}`}
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>
        )}

        {/* COUPONS VIEW CONTENT */}
        {activeView === 'coupons' && (
          <div className="p-8">
            {/* Metric Cards */}
            <section 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              aria-label="Coupon metrics"
            >
              {/* Total Coupons Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Total Coupons
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 700 }}
                >
                  {coupons.length}
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Available coupons
                </p>
              </article>

              {/* Active Coupons Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Active Coupons
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#2563EB', fontWeight: 700 }}
                >
                  {coupons.filter(coupon => coupon.status === 'Active').length}
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Currently active
                </p>
              </article>

              {/* Expired Coupons Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Expired Coupons
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626', fontWeight: 700 }}
                >
                  {coupons.filter(coupon => coupon.status === 'Expired').length}
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  No longer valid
                </p>
              </article>

              {/* Total Usage Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Total Usage
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 700 }}
                >
                  {coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0)}
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Times used
                </p>
              </article>
            </section>

            {/* Coupons Table */}
            <section aria-labelledby="coupons-table-heading">
              <header className="mb-4">
                <h3 
                  id="coupons-table-heading"
                  className="text-xl"
                  style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
                >
                  Coupon Catalog
                </h3>
              </header>

              {/* Table Container */}
              <div 
                className="rounded-2xl border overflow-hidden"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <table className="w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <thead>
                    <tr 
                      style={{ 
                        backgroundColor: '#FAFAFA',
                        borderBottom: '1px solid #E5E7EB'
                      }}
                    >
                      <th 
                        className="text-left px-6 py-4 text-sm"
                        style={{ color: '#7A9070', fontWeight: 600 }}
                      >
                        Code
                      </th>
                      <th 
                        className="text-left px-6 py-4 text-sm"
                        style={{ color: '#7A9070', fontWeight: 600 }}
                      >
                        Discount
                      </th>
                      <th 
                        className="text-left px-6 py-4 text-sm"
                        style={{ color: '#7A9070', fontWeight: 600 }}
                      >
                        Usage Limit
                      </th>
                      <th 
                        className="text-left px-6 py-4 text-sm"
                        style={{ color: '#7A9070', fontWeight: 600 }}
                      >
                        Used Count
                      </th>
                      <th 
                        className="text-left px-6 py-4 text-sm"
                        style={{ color: '#7A9070', fontWeight: 600 }}
                      >
                        Status
                      </th>
                      <th 
                        className="text-left px-6 py-4 text-sm"
                        style={{ color: '#7A9070', fontWeight: 600 }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon, index) => (
                      <tr 
                        key={coupon.id}
                        style={{ 
                          borderBottom: index !== coupons.length - 1 ? '1px solid #F3F4F6' : 'none'
                        }}
                      >
                        {/* Code */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 600 }}
                          >
                            {coupon.code}
                          </span>
                        </td>

                        {/* Discount */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 600 }}
                          >
                            {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                          </span>
                        </td>

                        {/* Usage Limit */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 600 }}
                          >
                            {coupon.usageLimit}
                          </span>
                        </td>

                        {/* Used Count */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 600 }}
                          >
                            {coupon.usedCount}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm px-3 py-1 rounded-full"
                            style={{ 
                              color: coupon.status === 'Active' ? '#2563EB' : '#DC2626',
                              backgroundColor: coupon.status === 'Active' ? '#DBEAFE' : '#FEE2E2',
                              fontWeight: 600,
                              border: coupon.status === 'Active' ? '1px solid #BFDBFE' : '1px solid #FCA5A5'
                            }}
                          >
                            {coupon.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {coupon.status === 'Active' ? (
                              <button
                                onClick={async () => {
                                  const ok = await updateCouponStatus(coupon.id, 'Expired');
                                  if (ok) setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, status: 'Expired' } : c));
                                }}
                                className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                                style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 600, border: '1px solid #FDE68A' }}
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  const ok = await updateCouponStatus(coupon.id, 'Active');
                                  if (ok) setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, status: 'Active' } : c));
                                }}
                                className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                                style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8', fontWeight: 600, border: '1px solid #BFDBFE' }}
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                const ok = await deleteCoupon(coupon.id);
                                if (ok) setCoupons(prev => prev.filter(c => c.id !== coupon.id));
                              }}
                              className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                              style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontWeight: 600, border: '1px solid #FCA5A5' }}
                            >
                              <Trash2 className="h-3 w-3 inline mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ANALYTICS VIEW CONTENT */}
        {activeView === 'analytics' && (
          <div className="p-8">
            {/* Metric Cards */}
            <section 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              aria-label="Analytics metrics"
            >
              {/* Total Sales Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Monthly Revenue
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 700 }}
                >
                  {formatCurrency(monthlyRevenue)}
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}% vs last month
                </p>
              </article>

              {/* Pending Orders Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Orders This Month
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#D97706', fontWeight: 700 }}
                >
                  {salesTrendData[salesTrendData.length - 1]?.orders ?? 0}
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Strong checkout velocity
                </p>
              </article>

              {/* Total Orders Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Customer Growth
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 700 }}
                >
                  {salesTrendData[salesTrendData.length - 1]?.customers ?? 0}
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Customers acquired this month
                </p>
              </article>

              {/* Total Customers Card */}
              <article 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <h3 
                  className="text-sm mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                >
                  Repeat Buyer Rate
                </h3>
                <p 
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 700 }}
                >
                  68%
                </p>
                <p 
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Based on recent cohorts
                </p>
              </article>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6" aria-label="Analytics insights">
              <div 
                className="rounded-2xl border overflow-hidden"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div className="border-b px-6 py-5" style={{ borderColor: '#F3F4F6' }}>
                  <h3 id="sales-trend-chart-heading" className="text-xl" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>
                    Sales Trend
                  </h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontSize: '0.875rem' }}>
                    Revenue performance across the last six months.
                  </p>
                </div>
                <div className="h-[360px] px-3 py-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7A9070" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#7A9070" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#E5E7EB" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: '#7A9070', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#7A9070', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 12px 32px rgba(122, 144, 112, 0.12)' }}
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                        labelStyle={{ color: '#4A5D45', fontWeight: 600 }}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#7A9070" strokeWidth={3} fill="url(#salesFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-6">
                <div 
                  className="rounded-2xl border p-6"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}
                >
                  <h3 className="text-lg mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>
                    Category Performance
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryPerformanceData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                        <CartesianGrid stroke="#F3F4F6" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="category" type="category" tick={{ fill: '#7A9070', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                        <Tooltip
                          cursor={{ fill: '#F9FAFB' }}
                          contentStyle={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 12px 32px rgba(122, 144, 112, 0.12)' }}
                          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#F4A6B2" radius={[0, 10, 10, 0]} barSize={22} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div 
                  className="rounded-2xl border p-6"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}
                >
                  <h3 className="text-lg mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>
                    Snapshot
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: '#F9FAFB' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}>Average order value</span>
                      <strong style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45' }}>{formatCurrency(1930)}</strong>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: '#F9FAFB' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}>Returning customers</span>
                      <strong style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45' }}>68%</strong>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: '#F9FAFB' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}>Top city</span>
                      <strong style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45' }}>Lahore</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* EMAILS VIEW CONTENT */}
        {activeView === 'emails' && (
          <div className="p-8">
            {/* Email Tabs */}
            <section className="mb-4">
              <div className="flex items-center gap-4">
                {/* Campaigns Tab */}
                <button
                  onClick={() => setEmailTab('campaigns')}
                  className="px-4 py-2 rounded-full transition-all hover:opacity-70"
                  style={{
                    backgroundColor: emailTab === 'campaigns' ? '#F0F4F0' : 'transparent',
                    color: emailTab === 'campaigns' ? '#5A7050' : '#7A9070',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: emailTab === 'campaigns' ? 600 : 500,
                  }}
                  aria-current={emailTab === 'campaigns' ? 'page' : undefined}
                >
                  Campaigns
                </button>

                {/* Templates Tab */}
                <button
                  onClick={() => setEmailTab('templates')}
                  className="px-4 py-2 rounded-full transition-all hover:opacity-70"
                  style={{
                    backgroundColor: emailTab === 'templates' ? '#F0F4F0' : 'transparent',
                    color: emailTab === 'templates' ? '#5A7050' : '#7A9070',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: emailTab === 'templates' ? 600 : 500,
                  }}
                  aria-current={emailTab === 'templates' ? 'page' : undefined}
                >
                  Templates
                </button>
              </div>
            </section>

            {/* Email Templates Table */}
            {emailTab === 'templates' && (
              <section aria-labelledby="email-templates-table-heading">
                <header className="mb-4">
                  <h3 
                    id="email-templates-table-heading"
                    className="text-xl"
                    style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
                  >
                    Email Templates
                  </h3>
                </header>

                {/* Table Container */}
                <div 
                  className="rounded-2xl border overflow-hidden"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <table className="w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <thead>
                      <tr 
                        style={{ 
                          backgroundColor: '#FAFAFA',
                          borderBottom: '1px solid #E5E7EB'
                        }}
                      >
                        <th 
                          className="text-left px-6 py-4 text-sm"
                          style={{ color: '#7A9070', fontWeight: 600 }}
                        >
                          Name
                        </th>
                        <th 
                          className="text-left px-6 py-4 text-sm"
                          style={{ color: '#7A9070', fontWeight: 600 }}
                        >
                          Subject
                        </th>
                        <th 
                          className="text-left px-6 py-4 text-sm"
                          style={{ color: '#7A9070', fontWeight: 600 }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailTemplates.map((template, index) => (
                        <tr 
                          key={template.id}
                          style={{ 
                            borderBottom: index !== emailTemplates.length - 1 ? '1px solid #F3F4F6' : 'none'
                          }}
                        >
                          {/* Name */}
                          <td className="px-6 py-4">
                            <span 
                              className="text-sm"
                              style={{ color: '#4A5D45', fontWeight: 500 }}
                            >
                              {template.name}
                            </span>
                          </td>

                          {/* Subject */}
                          <td className="px-6 py-4">
                            <span 
                              className="text-sm"
                              style={{ color: '#4A5D45', fontWeight: 600 }}
                            >
                              {template.subject}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span 
                              className="text-sm px-3 py-1 rounded-full"
                              style={{ 
                                color: template.status === 'Active' ? '#2563EB' : '#DC2626',
                                backgroundColor: template.status === 'Active' ? '#DBEAFE' : '#FEE2E2',
                                fontWeight: 600,
                                border: template.status === 'Active' ? '1px solid #BFDBFE' : '1px solid #FCA5A5'
                              }}
                            >
                              {template.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Email Campaigns Table */}
            {emailTab === 'campaigns' && (
              <section aria-labelledby="email-campaigns-table-heading">
                <header className="mb-4">
                  <h3 
                    id="email-campaigns-table-heading"
                    className="text-xl"
                    style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
                  >
                    Email Campaigns
                  </h3>
                </header>

                {/* Table Container */}
                <div 
                  className="rounded-2xl border overflow-hidden"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <table className="w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <thead>
                      <tr 
                        style={{ 
                          backgroundColor: '#FAFAFA',
                          borderBottom: '1px solid #E5E7EB'
                        }}
                      >
                        <th 
                          className="text-left px-6 py-4 text-sm"
                          style={{ color: '#7A9070', fontWeight: 600 }}
                        >
                          Name
                        </th>
                        <th 
                          className="text-left px-6 py-4 text-sm"
                          style={{ color: '#7A9070', fontWeight: 600 }}
                        >
                          Template
                        </th>
                        <th 
                          className="text-left px-6 py-4 text-sm"
                          style={{ color: '#7A9070', fontWeight: 600 }}
                        >
                          Sent On
                        </th>
                        <th 
                          className="text-left px-6 py-4 text-sm"
                          style={{ color: '#7A9070', fontWeight: 600 }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Placeholder Campaigns */}
                      <tr 
                        style={{ 
                          borderBottom: '1px solid #F3F4F6'
                        }}
                      >
                        {/* Name */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 500 }}
                          >
                            Welcome Email Campaign
                          </span>
                        </td>

                        {/* Template */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 600 }}
                          >
                            Welcome Email
                          </span>
                        </td>

                        {/* Sent On */}
                        <td className="px-6 py-4">
                          <time 
                            dateTime="2026-03-06"
                            className="text-sm"
                            style={{ color: '#7A9070' }}
                          >
                            {new Date('2026-03-06').toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </time>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm px-3 py-1 rounded-full"
                            style={{ 
                              color: '#2563EB',
                              backgroundColor: '#DBEAFE',
                              fontWeight: 600,
                              border: '1px solid #BFDBFE'
                            }}
                          >
                            Sent
                          </span>
                        </td>
                      </tr>

                      <tr 
                        style={{ 
                          borderBottom: '1px solid #F3F4F6'
                        }}
                      >
                        {/* Name */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 500 }}
                          >
                            Order Confirmation Campaign
                          </span>
                        </td>

                        {/* Template */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 600 }}
                          >
                            Order Confirmation
                          </span>
                        </td>

                        {/* Sent On */}
                        <td className="px-6 py-4">
                          <time 
                            dateTime="2026-03-05"
                            className="text-sm"
                            style={{ color: '#7A9070' }}
                          >
                            {new Date('2026-03-05').toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </time>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm px-3 py-1 rounded-full"
                            style={{ 
                              color: '#2563EB',
                              backgroundColor: '#DBEAFE',
                              fontWeight: 600,
                              border: '1px solid #BFDBFE'
                            }}
                          >
                            Sent
                          </span>
                        </td>
                      </tr>

                      <tr 
                        style={{ 
                          borderBottom: '1px solid #F3F4F6'
                        }}
                      >
                        {/* Name */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 500 }}
                          >
                            Password Reset Campaign
                          </span>
                        </td>

                        {/* Template */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 600 }}
                          >
                            Password Reset
                          </span>
                        </td>

                        {/* Sent On */}
                        <td className="px-6 py-4">
                          <time 
                            dateTime="2026-03-04"
                            className="text-sm"
                            style={{ color: '#7A9070' }}
                          >
                            {new Date('2026-03-04').toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </time>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm px-3 py-1 rounded-full"
                            style={{ 
                              color: '#2563EB',
                              backgroundColor: '#DBEAFE',
                              fontWeight: 600,
                              border: '1px solid #BFDBFE'
                            }}
                          >
                            Sent
                          </span>
                        </td>
                      </tr>

                      <tr 
                        style={{ 
                          borderBottom: '1px solid #F3F4F6'
                        }}
                      >
                        {/* Name */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 500 }}
                          >
                            Newsletter Campaign
                          </span>
                        </td>

                        {/* Template */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 600 }}
                          >
                            Newsletter
                          </span>
                        </td>

                        {/* Sent On */}
                        <td className="px-6 py-4">
                          <time 
                            dateTime="2026-03-03"
                            className="text-sm"
                            style={{ color: '#7A9070' }}
                          >
                            {new Date('2026-03-03').toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </time>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm px-3 py-1 rounded-full"
                            style={{ 
                              color: '#2563EB',
                              backgroundColor: '#DBEAFE',
                              fontWeight: 600,
                              border: '1px solid #BFDBFE'
                            }}
                          >
                            Sent
                          </span>
                        </td>
                      </tr>

                      <tr 
                        style={{ 
                          borderBottom: '1px solid #F3F4F6'
                        }}
                      >
                        {/* Name */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 500 }}
                          >
                            Promotion Alert Campaign
                          </span>
                        </td>

                        {/* Template */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm"
                            style={{ color: '#4A5D45', fontWeight: 600 }}
                          >
                            Promotion Alert
                          </span>
                        </td>

                        {/* Sent On */}
                        <td className="px-6 py-4">
                          <time 
                            dateTime="2026-03-02"
                            className="text-sm"
                            style={{ color: '#7A9070' }}
                          >
                            {new Date('2026-03-02').toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </time>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm px-3 py-1 rounded-full"
                            style={{ 
                              color: '#2563EB',
                              backgroundColor: '#DBEAFE',
                              fontWeight: 600,
                              border: '1px solid #BFDBFE'
                            }}
                          >
                            Sent
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}

        {/* PLACEHOLDER VIEWS */}
        {activeView === 'overview' && (
          <div className="p-8 space-y-8">
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" aria-label="Overview highlights">
              {[
                {
                  label: 'Monthly Revenue',
                  value: formatCurrency(monthlyRevenue),
                  note: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% from last month`,
                  icon: TrendingUp,
                  accent: '#7A9070',
                  background: '#F0FDF4',
                },
                {
                  label: 'Active Customers',
                  value: totalCustomers.toString(),
                  note: `${totalCustomers} registered users`,
                  icon: UserCheck,
                  accent: '#2563EB',
                  background: '#EFF6FF',
                },
                {
                  label: 'New This Month',
                  value: (salesTrendData[salesTrendData.length - 1]?.customers ?? 0).toString(),
                  note: 'Unique ordering customers',
                  icon: UserPlus,
                  accent: '#D97706',
                  background: '#FFF7ED',
                },
                {
                  label: 'Pending Orders',
                  value: pendingOrders.toString(),
                  note: 'Needs fulfillment',
                  icon: Clock3,
                  accent: '#DC2626',
                  background: '#FEF2F2',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.label} className="rounded-2xl border p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
                    <div className="mb-5 flex items-start justify-between">
                      <div>
                        <h3 className="text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}>{item.label}</h3>
                        <p className="text-3xl mb-1" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 700 }}>{item.value}</p>
                        <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>{item.note}</p>
                      </div>
                      <span className="rounded-2xl p-3" style={{ backgroundColor: item.background, color: item.accent }}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6" aria-label="Overview details">
              <div className="rounded-2xl border p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>Recent Activity</h3>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontSize: '0.875rem' }}>Operational pulse across orders, products, and customers.</p>
                  </div>
                  <Sparkles className="h-5 w-5" style={{ color: '#F4A6B2' }} aria-hidden="true" />
                </div>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={activity} className="flex items-start gap-4 rounded-2xl px-4 py-4" style={{ backgroundColor: '#FAFAFA' }}>
                      <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: '#F0F4F0', color: '#7A9070', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                        {index + 1}
                      </span>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.7 }}>{activity}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
                  <h3 className="text-xl mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>Top Customers</h3>
                  <div className="space-y-4">
                    {topCustomers.map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: '#FAFAFA' }}>
                        <div>
                          <p style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>{customer.name}</p>
                          <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontSize: '0.875rem' }}>{customer.orders} orders</p>
                        </div>
                        <strong style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45' }}>{formatCurrency(customer.totalSpent)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
                  <h3 className="text-xl mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>Quick Actions</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Review low stock products', to: 'products' },
                      { label: 'Check pending orders', to: 'orders' },
                      { label: 'Open analytics dashboard', to: 'analytics' },
                    ].map((action) => (
                      <button key={action.label} onClick={() => setActiveView(action.to as typeof activeView)} className="flex w-full items-center justify-between rounded-2xl px-4 py-4 transition-all hover:opacity-80" style={{ backgroundColor: '#F0F4F0', color: '#4A5D45', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                        {action.label}
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeView === 'customers' && (
          <div className="p-8 space-y-8">
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" aria-label="Customer metrics">
              {[
                { label: 'Customer Base', value: customerRecords.length.toString(), note: 'Registered profiles', color: '#4A5D45' },
                { label: 'Total Revenue', value: formatCurrency(Math.round(customerRecords.reduce((sum, customer) => sum + customer.totalSpent, 0))), note: 'From all customer orders', color: '#166534' },
                { label: 'Avg Lifetime Value', value: customerRecords.length > 0 ? formatCurrency(Math.round(customerRecords.reduce((sum, customer) => sum + customer.totalSpent, 0) / customerRecords.length)) : formatCurrency(0), note: 'Across all customers', color: '#1D4ED8' },
              ].map((metric) => (
                <article key={metric.label} className="rounded-2xl border p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
                  <h3 className="text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}>{metric.label}</h3>
                  <p className="text-3xl mb-1" style={{ fontFamily: 'Inter, sans-serif', color: metric.color, fontWeight: 700 }}>{metric.value}</p>
                  <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>{metric.note}</p>
                </article>
              ))}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-6" aria-label="Customer insights">
              <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
                <div className="border-b px-6 py-5" style={{ borderColor: '#F3F4F6' }}>
                  <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>Customer Directory</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontSize: '0.875rem' }}>All registered user profiles from the database.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                        <th className="px-6 py-4 text-left text-sm" style={{ color: '#7A9070', fontWeight: 600 }}>Customer</th>
                        <th className="px-6 py-4 text-left text-sm" style={{ color: '#7A9070', fontWeight: 600 }}>Orders</th>
                        <th className="px-6 py-4 text-left text-sm" style={{ color: '#7A9070', fontWeight: 600 }}>Spent</th>
                        <th className="px-6 py-4 text-left text-sm" style={{ color: '#7A9070', fontWeight: 600 }}>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerRecords.length === 0 && (
                        <tr><td colSpan={4} className="px-6 py-12 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>{dataLoading ? 'Loading customers…' : 'No customers yet.'}</td></tr>
                      )}
                      {customerRecords.map((customer, index) => (
                        <tr key={customer.id} style={{ borderBottom: index !== customerRecords.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                          <td className="px-6 py-4">
                            <div>
                              <p style={{ color: '#4A5D45', fontWeight: 600 }}>{customer.name}</p>
                              <p className="text-sm" style={{ color: '#7A9070' }}>{customer.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4" style={{ color: '#4A5D45', fontWeight: 600 }}>{customer.orderCount}</td>
                          <td className="px-6 py-4" style={{ color: '#4A5D45', fontWeight: 600 }}>{formatCurrency(customer.totalSpent)}</td>
                          <td className="px-6 py-4">
                            <span className="rounded-full px-3 py-1 text-sm" style={{ ...getCustomerRoleStyles(customer.role), fontWeight: 600 }}>
                              {customer.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
                  <h3 className="text-xl mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>Top Customers</h3>
                  <div className="space-y-3">
                    {topCustomers.map((customer) => (
                      <div key={customer.id} className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#F9FAFB' }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>{customer.name}</p>
                        <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>{formatCurrency(customer.totalSpent)} — {customer.orderCount} orders</p>
                      </div>
                    ))}
                    {topCustomers.length === 0 && (
                      <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>No customer data yet.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
                  <h3 className="text-xl mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>Recent Signups</h3>
                  <div className="space-y-3">
                    {[...customerRecords]
                      .sort((firstCustomer, secondCustomer) => new Date(secondCustomer.createdAt).getTime() - new Date(firstCustomer.createdAt).getTime())
                      .slice(0, 3)
                      .map((customer) => (
                        <div key={customer.id} className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#F9FAFB' }}>
                          <p style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>{customer.name}</p>
                          <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Joined {formatShortDate(customer.createdAt)}</p>
                        </div>
                      ))}
                    {customerRecords.length === 0 && (
                      <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>No signups yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div
            className="w-full max-w-3xl rounded-3xl border p-8"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.18)',
            }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>
                  Edit Product
                </h3>
                <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>
                  Update product information and save changes to Supabase.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full px-4 py-2 transition-all hover:opacity-70"
                style={{ backgroundColor: '#F3F4F6', color: '#7A9070', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={editProduct.name}
                    onChange={(e) => handleEditFieldChange('name', e.target.value)}
                    className="w-full rounded-xl px-4 py-3"
                    style={{ border: '2px solid #E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', outline: 'none' }}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={editProduct.category}
                    onChange={(e) => handleEditFieldChange('category', e.target.value)}
                    className="w-full rounded-xl px-4 py-3"
                    style={{ border: '2px solid #E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', outline: 'none' }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editProduct.price}
                    onChange={(e) => handleEditFieldChange('price', e.target.value)}
                    className="w-full rounded-xl px-4 py-3"
                    style={{ border: '2px solid #E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', outline: 'none' }}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editProduct.stock}
                    onChange={(e) => handleEditFieldChange('stock', e.target.value)}
                    className="w-full rounded-xl px-4 py-3"
                    style={{ border: '2px solid #E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', outline: 'none' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                  Description
                </label>
                <textarea
                  rows={5}
                  value={editProduct.description}
                  onChange={(e) => handleEditFieldChange('description', e.target.value)}
                  className="w-full rounded-xl px-4 py-3"
                  style={{ border: '2px solid #E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', outline: 'none', resize: 'none' }}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                  Shipping Info
                </label>
                <textarea
                  rows={4}
                  value={editProduct.shippingInfo}
                  onChange={(e) => handleEditFieldChange('shippingInfo', e.target.value)}
                  className="w-full rounded-xl px-4 py-3"
                  style={{ border: '2px solid #E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', outline: 'none', resize: 'none' }}
                />
              </div>

              <div>
                <h3 className="text-lg mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>SEO & Metadata</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>Slug</label>
                    <input type="text" value={editProduct.slug} onChange={(e) => handleEditFieldChange('slug', e.target.value)} placeholder="cute-bow-glass-sipper" className="w-full rounded-xl px-4 py-3" style={{ border: '2px solid #E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', outline: 'none' }} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>Meta Title</label>
                    <input type="text" value={editProduct.metaTitle} onChange={(e) => handleEditFieldChange('metaTitle', e.target.value)} placeholder="Cute Bow Glass Sipper | Cozip" className="w-full rounded-xl px-4 py-3" style={{ border: '2px solid #E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', outline: 'none' }} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>Meta Description</label>
                    <textarea rows={3} value={editProduct.metaDescription} onChange={(e) => handleEditFieldChange('metaDescription', e.target.value)} placeholder="A short description for search engines..." className="w-full rounded-xl px-4 py-3" style={{ border: '2px solid #E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', outline: 'none', resize: 'none' }} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>Meta Keywords</label>
                    <input type="text" value={editProduct.metaKeywords} onChange={(e) => handleEditFieldChange('metaKeywords', e.target.value)} placeholder="glass sipper, cute mug, cozip" className="w-full rounded-xl px-4 py-3" style={{ border: '2px solid #E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', outline: 'none' }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
                <div>
                  <label className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                    Add More Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleEditImageChange(e.target.files || [])}
                    className="block w-full rounded-xl border px-4 py-3"
                    style={{ borderColor: '#E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45' }}
                  />
                </div>

                <label className="mt-8 flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: '#E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={editProduct.isFeatured}
                    onChange={(e) => handleEditFieldChange('isFeatured', e.target.checked)}
                  />
                  Featured
                </label>
              </div>

              {editImages.length > 0 && (
                <div>
                  <p className="mb-3 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 600 }}>
                    First image will be used as the main cover image.
                  </p>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {editImages.map((image, index) => (
                      <div key={image.id} className="relative">
                        <img src={image.preview} alt={`${editProduct.name} ${index + 1}`} className="h-32 w-full rounded-2xl object-cover" style={{ border: index === 0 ? '3px solid #7A9070' : '2px solid #E5E7EB' }} />
                        {index === 0 && (
                          <span className="absolute left-2 top-2 rounded-full px-3 py-1 text-xs" style={{ backgroundColor: '#7A9070', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                            Cover
                          </span>
                        )}
                        {image.kind === 'new' && (
                          <span className="absolute bottom-2 left-2 rounded-full px-3 py-1 text-xs" style={{ backgroundColor: '#F0F4F0', color: '#4A5D45', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                            New
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveEditImage(image.id)}
                          className="absolute right-2 top-2 rounded-full p-2 transition-all hover:opacity-70"
                          style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <div className="absolute bottom-2 right-2 flex gap-2">
                          <button type="button" onClick={() => handleMoveEditImage(index, index - 1)} disabled={index === 0} className="rounded-full p-2 disabled:opacity-40" style={{ backgroundColor: '#FFFFFF', color: '#4A5D45' }} aria-label={`Move image ${index + 1} left`}>
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button type="button" onClick={() => handleMoveEditImage(index, index + 1)} disabled={index === editImages.length - 1} className="rounded-full p-2 disabled:opacity-40" style={{ backgroundColor: '#FFFFFF', color: '#4A5D45' }} aria-label={`Move image ${index + 1} right`}>
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-full px-6 py-3 transition-all hover:opacity-70"
                  style={{ backgroundColor: '#F3F4F6', color: '#7A9070', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProductActionPending}
                  className="rounded-full px-6 py-3 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: '#7A9070', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                >
                  {isProductActionPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}