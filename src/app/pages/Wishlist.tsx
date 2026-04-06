import { Link } from 'react-router';
import { Heart, ShoppingCart, X, Loader2 } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { EmptyState } from '../components/EmptyState';
import { showErrorToast, showSuccessToast } from '../lib/notifications';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PageSeo } from '../components/PageSeo';
import { useWishlist, removeFromWishlist } from '../lib/wishlist';
import { addToCart } from '../lib/cart';
import { formatPKR } from '../lib/pricing';

export default function Wishlist() {
  const { items: wishlistItems, loading } = useWishlist();

  const handleRemoveItem = (itemId: string) => {
    removeFromWishlist(itemId).catch((err: unknown) => {
      showErrorToast('Wishlist error', err instanceof Error ? err.message : 'Failed to remove item.');
    });
  };

  const handleAddToCart = (item: { productId: string; name: string }) => {
    addToCart(item.productId)
      .then(() => showSuccessToast('Added to cart', `${item.name} moved from your wishlist to cart.`))
      .catch((err: unknown) => {
        showErrorToast('Cart error', err instanceof Error ? err.message : 'Failed to add to cart.');
      });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      <PageSeo title="Wishlist" />
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

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#7A9070' }} />
            </div>
          ) : wishlistItems.length > 0 ? (
            <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4" aria-label="Wishlist items">
              {wishlistItems.map((item) => (
                <article key={item.id} className="relative rounded-2xl border p-6 transition-all hover:shadow-lg" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                  <button type="button" onClick={() => handleRemoveItem(item.id)} className="absolute right-4 top-4 rounded-full p-2 transition-all hover:opacity-70" style={{ backgroundColor: '#FADADD', color: '#F4A6B2' }} aria-label={`Remove ${item.name} from wishlist`} title="Remove from Wishlist">
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>

                  <Link to={`/product/${item.productId}`} className="mb-4 block" aria-label={`View ${item.name}`}>
                    <img src={item.image} alt={item.name} className="w-full rounded-xl" style={{ aspectRatio: '1 / 1', objectFit: 'cover', border: '2px solid #F0F4F0' }} />
                  </Link>

                  <Link to={`/product/${item.productId}`}>
                    <h2 className="product-title-wrap mb-2 text-lg transition-all hover:opacity-70" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>
                      {item.name}
                    </h2>
                  </Link>

                  <p className="mb-4 text-xl" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 700 }}>
                    {formatPKR(item.price)}
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