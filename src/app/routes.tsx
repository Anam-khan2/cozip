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
import Wishlist from './pages/Wishlist';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import About from './pages/About';
import Legal from './pages/Legal';

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
    element: <Checkout />,
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
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/wishlist',
    element: <Wishlist />,
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
    element: <OrderSuccess />,
  },
  {
    path: '/admin',
    element: <AdminDashboard />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin/add-product',
    element: <AddProduct />,
  },
]);