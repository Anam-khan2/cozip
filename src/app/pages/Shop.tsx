import { Heart, Search } from 'lucide-react';
import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductGridSkeleton } from '../components/ProductGridSkeleton';
import { EmptyState } from '../components/EmptyState';
import { showInfoToast, showSuccessToast, showErrorToast } from '../lib/notifications';
import { addToCart } from '../lib/cart';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: products, error, loading } = useProducts();

  const handleWishlist = (productName: string) => {
    showInfoToast('Saved for later', `${productName} was added to your wishlist.`);
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await addToCart(productId);
      showSuccessToast('Added to cart', `${productName} is ready for checkout.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to add item to cart.';
      showErrorToast('Cart error', message);
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      <Header />

      <main>
        {/* Page Header */}
        <section className="store-section" aria-labelledby="shop-heading">
          <div className="store-shell text-center">
            <Breadcrumbs items={[{ label: 'Shop' }]} className="mb-6 text-left" />
            <h1 id="shop-heading" className="text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>
              Exclusive Collection
            </h1>
            <p className="text-base md:text-lg max-w-2xl mx-auto mb-6 md:mb-8" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}>
              Discover our carefully curated selection of handcrafted mugs. Each piece is designed to bring aesthetic beauty and cozy comfort to your daily rituals.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mt-6 md:mt-10">
              <div 
                className="flex items-center gap-3 px-4 md:px-5 py-3 md:py-3.5 rounded-full transition-all"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #E5E7EB',
                  boxShadow: '0 4px 16px rgba(122, 144, 112, 0.1)'
                }}
              >
                <Search size={20} style={{ color: '#7A9070' }} />
                <input
                  type="text"
                  placeholder="Search for mugs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  aria-label="Search products"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    color: '#4A5D45'
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid - Centered & Spacious */}
        <section className="store-section pt-0" aria-label="Product collection">
          <div className="store-shell">
            {loading ? (
              <ProductGridSkeleton count={6} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-10" />
            ) : error ? (
              <section className="mx-auto max-w-3xl rounded-[2rem] border px-6 py-10 text-center lg:px-10 lg:py-16" style={{ backgroundColor: '#FFF9FB', borderColor: '#F4D4DC' }} aria-live="polite">
                <h2 className="mb-3 text-3xl" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>Unable to load products</h2>
                <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', lineHeight: 1.8 }}>{error}</p>
              </section>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="w-full rounded-3xl overflow-hidden transition-all hover:scale-[1.02]"
                    style={{ 
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #D4C4B0',
                      boxShadow: '0 8px 32px rgba(122, 144, 112, 0.12)'
                    }}
                  >
                    {/* Product Image */}
                    <div className="relative">
                      <Link to={`/product/${product.id}`} className="block">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full aspect-square object-cover"
                        />
                      </Link>
                      <button 
                        type="button"
                        onClick={() => handleWishlist(product.name)}
                        className="absolute top-4 right-4 p-2.5 rounded-full transition-all hover:scale-110"
                        style={{ backgroundColor: '#F4A6B2' }}
                        aria-label={`Add ${product.name} to wishlist`}
                      >
                        <Heart className="w-5 h-5" style={{ color: '#ffffff' }} aria-hidden="true" />
                      </button>
                    </div>
                    
                    {/* Product Details */}
                    <div className="p-6 space-y-4">
                      <Link to={`/product/${product.id}`}>
                        <h2 className="product-title-wrap min-h-14 text-lg hover:underline" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>
                          {product.name}
                        </h2>
                      </Link>
                      <p className="text-2xl" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}>
                        {product.formattedPrice}
                      </p>
                      <button 
                        type="button"
                        onClick={() => handleAddToCart(product.id, product.name)}
                        className="w-full py-3 rounded-full transition-all hover:scale-105"
                        style={{ 
                          backgroundColor: '#7A9070',
                          color: '#ffffff',
                          boxShadow: '0 6px 20px rgba(122, 144, 112, 0.3)',
                          fontWeight: 500
                        }}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Search className="h-8 w-8" aria-hidden="true" />}
                title="No matching mugs found"
                description="Try a different keyword or browse the full collection to discover a new favorite for your next cozy moment."
                actionLabel="Browse All Products"
                actionTo="/shop"
                ariaLabel="No products found"
              />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}