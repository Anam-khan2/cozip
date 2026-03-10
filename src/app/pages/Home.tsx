import { Heart } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link } from 'react-router';
import { useProducts } from '../hooks/useProducts';
import { ProductGridSkeleton } from '../components/ProductGridSkeleton';
import { showInfoToast, showSuccessToast } from '../lib/notifications';

export default function Home() {
  const { data: products, error, loading } = useProducts({ featuredOnly: true, limit: 5 });

  const handleWishlist = (productName: string) => {
    showInfoToast('Saved for later', `${productName} was added to your wishlist.`);
  };

  const handleAddToCart = (productName: string) => {
    showSuccessToast('Added to cart', `${productName} is ready for checkout.`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      <Header />

      <main>
        {/* Hero Section */}
        <section className="store-section" aria-labelledby="hero-heading">
          <div className="store-shell">
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden" style={{ boxShadow: '0 12px 48px rgba(122, 144, 112, 0.2)' }}>
              <img
                src="https://images.unsplash.com/photo-1674317872332-ca9c2cd00953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXN0aGV0aWMlMjBjZXJhbWljJTIwbXVnJTIwY29mZmVlfGVufDF8fHx8MTc3MjgzNDAxNnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Beautiful pastel chunky mugs collection"
                className="aspect-[4/5] w-full object-cover sm:aspect-[16/10] lg:aspect-[21/9]"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 md:px-6" style={{ backgroundColor: 'rgba(250, 248, 243, 0.85)' }}>
                <h2 id="hero-heading" className="text-3xl md:text-5xl lg:text-6xl mb-6 md:mb-8" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>
                  Aesthetic sips & cozy grips 🎀
                </h2>
                <Link 
                  to="/shop"
                  className="mobile-full-button rounded-full px-8 py-4 transition-all hover:scale-[1.02]"
                  style={{ 
                    backgroundColor: '#7A9070',
                    color: '#ffffff',
                    boxShadow: '0 6px 24px rgba(122, 144, 112, 0.4)',
                    fontWeight: 500
                  }}
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="store-section" aria-labelledby="story-heading">
          <div className="store-shell">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 md:order-1">
                <img
                  src="https://images.unsplash.com/photo-1587730755062-717d44810160?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwbGlmZXN0eWxlJTIwY29mZmVlJTIwbXVnfGVufDF8fHx8MTc3MjgzNDc4NXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Cozy lifestyle moment with our mugs"
                  className="w-full rounded-2xl md:rounded-3xl"
                  style={{ boxShadow: '0 10px 36px rgba(122, 144, 112, 0.15)' }}
                />
              </div>

              <div className="order-1 md:order-2 space-y-4 md:space-y-6">
                <h2 id="story-heading" className="text-3xl md:text-4xl lg:text-5xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>
                  Our Story
                </h2>
                <p className="text-base md:text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}>
                  At Cozip, we believe every sip should feel like a warm hug. Our carefully curated collection of handcrafted mugs brings together aesthetic beauty and cozy comfort. Each piece is thoughtfully designed to elevate your daily coffee ritual into a moment of pure joy and self-care. From chunky ceramics to delicate glassware, we celebrate the art of slowing down and savoring life's simple pleasures.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Exclusive Collection Section */}
        <section className="store-section" aria-labelledby="collection-heading" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="store-shell">
            <h2 id="collection-heading" className="text-3xl md:text-4xl lg:text-5xl text-center mb-10 md:mb-16" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>
              Exclusive Collection
            </h2>

            {loading ? (
              <ProductGridSkeleton count={5} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:gap-8" />
            ) : error ? (
              <section className="mx-auto max-w-3xl rounded-[2rem] border px-6 py-10 text-center lg:px-10 lg:py-16" style={{ backgroundColor: '#FFF9FB', borderColor: '#F4D4DC' }} aria-live="polite">
                <h3 className="mb-3 text-3xl" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>Collection temporarily unavailable</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', lineHeight: 1.8 }}>{error}</p>
              </section>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
                {products.map((product) => (
                <article
                  key={product.id}
                  className="rounded-2xl md:rounded-3xl overflow-hidden transition-all hover:scale-105"
                  style={{ 
                    backgroundColor: '#FAF8F3',
                    border: '2px solid #D4C4B0',
                    boxShadow: '0 8px 32px rgba(122, 144, 112, 0.12)'
                  }}
                >
                  <div className="relative">
                    <Link to={`/product/${product.id}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full aspect-square object-cover"
                      />
                    </Link>
                    <button 
                      type="button"
                      onClick={() => handleWishlist(product.name)}
                      className="absolute top-3 right-3 md:top-4 md:right-4 p-2 md:p-2.5 rounded-full transition-all hover:scale-110"
                      style={{ backgroundColor: '#F4A6B2' }}
                      aria-label={`Add ${product.name} to wishlist`}
                    >
                      <Heart className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#ffffff' }} aria-hidden="true" />
                    </button>
                  </div>
                  
                  <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="product-title-wrap min-h-12 text-base md:text-lg" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-lg md:text-xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>
                      {product.formattedPrice}
                    </p>
                    <button 
                      type="button"
                      onClick={() => handleAddToCart(product.name)}
                      className="w-full py-2.5 md:py-3 rounded-full transition-all hover:scale-105 text-sm md:text-base"
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
            )}
          </div>
        </section>

        {/* Lifestyle Banner Section */}
        <section className="store-section" aria-labelledby="lifestyle-quote">
          <div className="store-shell">
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden" style={{ boxShadow: '0 12px 48px rgba(122, 144, 112, 0.2)' }}>
              <img
                src="https://images.unsplash.com/photo-1749705319317-f9a2bf24fe3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXN0aGV0aWMlMjBob21lJTIwY296eSUyMGJsYW5rZXR8ZW58MXx8fHwxNzcyODM0Nzg1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Cozy home atmosphere"
                className="aspect-[5/4] w-full object-cover sm:aspect-[16/9] lg:aspect-[21/9]"
              />
              <div className="absolute inset-0 flex items-center justify-center px-4 md:px-6" style={{ backgroundColor: 'rgba(250, 248, 243, 0.80)' }}>
                <blockquote className="text-center max-w-3xl">
                  <p id="lifestyle-quote" className="text-2xl md:text-3xl lg:text-4xl italic" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 500, lineHeight: 1.6 }}>
                    "Life is too short for boring mugs. Make every moment beautiful."
                  </p>
                </blockquote>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}