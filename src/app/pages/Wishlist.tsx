import { useState } from 'react';
import { Link } from 'react-router';
import { Heart, ShoppingCart, X } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { EmptyState } from '../components/EmptyState';
import { showSuccessToast } from '../lib/notifications';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 1,
      name: 'Handmade Aesthetic Pastel Cloud Mug - Limited 2026 Edition',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1674317872332-ca9c2cd00953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXN0aGV0aWMlMjBjZXJhbWljJTIwbXVnJTIwY29mZmVlfGVufDF8fHx8MTc3MjgzNDAxNnww&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 2,
      name: 'Pink Pastel Mug',
      price: 22.99,
      image: 'https://images.unsplash.com/photo-1588165231518-b4b22bfa0ddf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwYWVzdGhldGljJTIwY29mZmVlJTIwbXVnfGVufDF8fHx8MTc3MjgzNDAxNnww&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 3,
      name: 'Sage Green Mug',
      price: 23.99,
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWdlJTIwZ3JlZW4lMjBtdWd8ZW58MXx8fHwxNzMyNDM3MDAwfDA&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 4,
      name: 'Minimalist White Mug',
      price: 21.99,
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwd2hpdGUlMjBtdWd8ZW58MXx8fHwxNzMyNDM3MDAwfDA&ixlib=rb-4.1.0&q=80&w=400',
    },
  ]);

  const handleRemoveItem = (itemId: number) => {
    setWishlistItems((items) => items.filter((item) => item.id !== itemId));
  };

  const handleAddToCart = (item: WishlistItem) => {
    showSuccessToast('Added to cart', `${item.name} moved from your wishlist to cart.`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      <Header />

      <main className="store-section">
        <div className="store-shell">
          <Breadcrumbs items={[{ label: 'Wishlist' }]} className="mb-6" />
          <header className="mb-8">
            <div className="mb-2 flex items-center gap-3">
              <Heart className="h-8 w-8" style={{ color: '#F4A6B2' }} aria-hidden="true" />
              <h1 className="text-4xl" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>
                My Wishlist
              </h1>
            </div>
            <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </header>

          {wishlistItems.length > 0 ? (
            <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4" aria-label="Wishlist items">
              {wishlistItems.map((item) => (
                <article key={item.id} className="relative rounded-2xl border p-6 transition-all hover:shadow-lg" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                  <button type="button" onClick={() => handleRemoveItem(item.id)} className="absolute right-4 top-4 rounded-full p-2 transition-all hover:opacity-70" style={{ backgroundColor: '#FADADD', color: '#F4A6B2' }} aria-label={`Remove ${item.name} from wishlist`} title="Remove from Wishlist">
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>

                  <Link to={`/product/${item.id}`} className="mb-4 block" aria-label={`View ${item.name}`}>
                    <img src={item.image} alt={item.name} className="w-full rounded-xl" style={{ aspectRatio: '1 / 1', objectFit: 'cover', border: '2px solid #F0F4F0' }} />
                  </Link>

                  <Link to={`/product/${item.id}`}>
                    <h2 className="product-title-wrap mb-2 text-lg transition-all hover:opacity-70" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>
                      {item.name}
                    </h2>
                  </Link>

                  <p className="mb-4 text-xl" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 700 }}>
                    ${item.price.toFixed(2)}
                  </p>

                  <button type="button" onClick={() => handleAddToCart(item)} className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 transition-all hover:scale-105" style={{ backgroundColor: '#7A9070', color: '#FFFFFF', boxShadow: '0 4px 16px rgba(122, 144, 112, 0.25)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }} aria-label={`Add ${item.name} to cart`}>
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                    Add to Cart
                  </button>
                </article>
              ))}
            </section>
          ) : (
            <EmptyState
              icon={<Heart className="h-8 w-8" aria-hidden="true" />}
              title="Your wishlist is empty"
              description="Save pieces you love so they stay close when you are ready to complete your next cozy setup."
              actionLabel="Continue Shopping"
              actionTo="/shop"
              ariaLabel="Empty wishlist"
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}