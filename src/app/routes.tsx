import { createBrowserRouter } from 'react-router';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import OrderSuccess from './pages/OrderSuccess';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AddProduct from './pages/AddProduct';
import ProtectedRoute from './components/ProtectedRoute';
import AuthGuard from './components/AuthGuard';
import Wishlist from './pages/Wishlist';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import About from './pages/About';
import AuthCallback from './pages/AuthCallback';
import Legal from './pages/Legal';
import TrackOrder from './pages/TrackOrder';
import OrderTrackingDetails from './pages/OrderTrackingDetails';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/shop',
    element: <Shop />,
  },
  {
    path: '/product/:productId',
    element: <ProductDetail />,
  },
  {
    path: '/cart',
    element: <Cart />,
  },
  {
    path: '/checkout',
    element: <AuthGuard><Checkout /></AuthGuard>,
  },
  {
    path: '/login',
    element: <Auth />,
  },
  {
    path: '/register',
    element: <Auth />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/dashboard',
    element: <AuthGuard><Dashboard /></AuthGuard>,
  },
  {
    path: '/wishlist',
    element: <AuthGuard><Wishlist /></AuthGuard>,
  },
  {
    path: '/contact',
    element: <Contact />,
  },
  {
    path: '/faq',
    element: <FAQ />,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/terms',
    element: <Legal />,
  },
  {
    path: '/privacy',
    element: <Legal />,
  },
  {
    path: '/legal',
    element: <Legal />,
  },
  {
    path: '/order-success',
    element: <AuthGuard><OrderSuccess /></AuthGuard>,
  },
  {
    path: '/track-order',
    element: <TrackOrder />,
  },
  {
    path: '/track-order/:orderNumber',
    element: <OrderTrackingDetails />,
  },
  {
    path: '/admin',
    element: <ProtectedRoute><AdminDashboard /></ProtectedRoute>,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin/add-product',
    element: <ProtectedRoute><AddProduct /></ProtectedRoute>,
  },
]);