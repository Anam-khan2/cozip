import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { Heart, Minus, Plus, Star, MessageCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useProduct } from '../hooks/useProducts';
import { showInfoToast, showSuccessToast, showErrorToast } from '../lib/notifications';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { addToCart } from '../lib/cart';
import { useChatStore } from '../store/chatStore';

function formatReviewDate(date: string) {
  if (!date) {
    return 'Recently added';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Recently added';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

export default function ProductDetail() {
  const { productId } = useParams();
  const { data: product, error, loading } = useProduct(productId);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'shipping'>('description');
  const openChat = useChatStore((s) => s.openChat);

  useEffect(() => {
    setSelectedImage(0);
  }, [product?.id]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
        <Header />
        <main className="store-section">
          <section className="store-shell grid grid-cols-1 gap-8 lg:grid-cols-2" aria-label="Loading product details" aria-busy="true">
            <div className="aspect-square animate-pulse rounded-3xl" style={{ backgroundColor: '#EEF2EE' }} />
            <div className="space-y-5">
              <div className="h-12 w-3/4 animate-pulse rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
              <div className="h-6 w-1/3 animate-pulse rounded-full" style={{ backgroundColor: '#F7E7EB' }} />
              <div className="h-20 animate-pulse rounded-3xl" style={{ backgroundColor: '#EEF2EE' }} />
              <div className="h-14 animate-pulse rounded-full" style={{ backgroundColor: '#F7E7EB' }} />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
        <Header />
        <main className="store-section">
          <section className="store-shell rounded-[2rem] border px-6 py-10 text-center lg:px-10 lg:py-20" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }} aria-live="polite">
            <h1 className="mb-3 text-3xl" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>
              Product unavailable
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', lineHeight: 1.8 }}>{error ?? 'Product not found'}</p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const seoTitle = product.metaTitle || `${product.name} | Cozip`;
  const seoDescription = product.metaDescription || product.description;
  const seoKeywords = product.metaKeywords || '';
  const seoImage = product.images[0] || '';

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        {seoKeywords && <meta name="keywords" content={seoKeywords} />}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        {seoImage && <meta property="og:image" content={seoImage} />}
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {seoImage && <meta name="twitter:image" content={seoImage} />}
      </Helmet>
      <Header />

      <main className="store-section">
        <article className="store-shell" itemScope itemType="https://schema.org/Product">
          <Breadcrumbs items={[{ label: 'Shop', to: '/shop' }, { label: product.name }]} className="mb-8" />
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <section aria-label="Product images">
              <figure className="mb-6">
                <img
                  src={product.images[selectedImage]}
                  alt={`${product.name} - View ${selectedImage + 1}`}
                  className="aspect-square w-full rounded-3xl object-cover"
                  style={{ boxShadow: '0 10px 40px rgba(122, 144, 112, 0.15)' }}
                  itemProp="image"
                />
              </figure>

              <div className="grid grid-cols-4 gap-4" role="list" aria-label="Product image thumbnails">
                {product.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className="overflow-hidden rounded-2xl transition-all hover:scale-105"
                    style={{ border: selectedImage === index ? '3px solid #7A9070' : '2px solid #D4C4B0', boxShadow: selectedImage === index ? '0 6px 20px rgba(122, 144, 112, 0.3)' : '0 4px 12px rgba(122, 144, 112, 0.1)' }}
                    aria-label={`View image ${index + 1} of ${product.name}`}
                    aria-pressed={selectedImage === index}
                    role="listitem"
                  >
                    <img src={image} alt={`${product.name} thumbnail ${index + 1}`} className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            </section>

            <section aria-labelledby="product-title">
              <div className="space-y-6">
                <h1 id="product-title" className="product-title-wrap text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }} itemProp="name">
                  {product.name}
                </h1>

                <div className="flex items-center gap-3" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                  <div className="flex gap-1" role="img" aria-label={`${product.rating} out of 5 stars`}>
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} className="h-5 w-5" style={{ fill: index < Math.round(product.rating) ? '#F4A6B2' : 'none', color: index < Math.round(product.rating) ? '#F4A6B2' : '#D4C4B0' }} aria-hidden="true" />
                    ))}
                  </div>
                  <span style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontSize: '0.9rem' }}>
                    <meta itemProp="ratingValue" content={product.rating.toString()} />
                    <meta itemProp="reviewCount" content={product.reviewCount.toString()} />
                    ({product.reviewCount} reviews)
                  </span>
                </div>

                <p className="text-4xl" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }} itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  <meta itemProp="price" content={product.price.toString()} />
                  <meta itemProp="priceCurrency" content="PKR" />
                  <meta itemProp="availability" content={product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'} />
                  {product.formattedPrice}
                </p>

                <hr style={{ borderColor: '#D4C4B0', borderWidth: '1px' }} />

                <div className="space-y-3">
                  <label htmlFor="quantity" className="block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center overflow-hidden rounded-full" style={{ border: '2px solid #D4C4B0', backgroundColor: '#FFFFFF' }} role="group" aria-label="Quantity selector">
                      <button type="button" onClick={handleQuantityDecrease} className="px-5 py-3 transition-colors" style={{ backgroundColor: quantity === 1 ? 'transparent' : '#FAF8F3', color: '#7A9070' }} aria-label="Decrease quantity" disabled={quantity === 1}>
                        <Minus className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <input type="number" id="quantity" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number.parseInt(event.target.value, 10) || 1))} className="w-16 text-center outline-none" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600, fontSize: '1.1rem' }} min="1" inputMode="numeric" aria-label="Product quantity" />
                      <button type="button" onClick={handleQuantityIncrease} className="px-5 py-3 transition-colors" style={{ backgroundColor: '#FAF8F3', color: '#7A9070' }} aria-label="Increase quantity">
                        <Plus className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await addToCart(product.id, quantity);
                      showSuccessToast('Added to cart', `${quantity} × ${product.name} added to your cart.`);
                    } catch (error) {
                      const message = error instanceof Error ? error.message : 'Unable to add item to cart.';
                      showErrorToast('Cart error', message);
                    }
                  }}
                  className="w-full rounded-full py-5 text-lg transition-all hover:scale-105"
                  style={{ backgroundColor: '#7A9070', color: '#ffffff', boxShadow: '0 8px 32px rgba(122, 144, 112, 0.4)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                  aria-label={`Add ${quantity} ${product.name} to cart`}
                >
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={() => openChat(`Tell me more about ${product.name} and add it to my cart if it's available`)}
                  className="flex w-full items-center justify-center gap-2 rounded-full py-4 transition-all hover:scale-105"
                  style={{ backgroundColor: '#F0F4F0', color: '#5A7050', border: '2px solid #C8D8C0', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                  aria-label={`Ask AI about ${product.name}`}
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  Ask AI about this
                </button>

                <button
                  type="button"
                  onClick={() => showInfoToast('Saved for later', `${product.name} was added to your wishlist.`)}
                  className="flex w-full items-center justify-center gap-3 rounded-full py-4 transition-all hover:scale-105"
                  style={{ backgroundColor: '#FFFFFF', color: '#7A9070', border: '2px solid #D4C4B0', boxShadow: '0 4px 16px rgba(122, 144, 112, 0.1)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                  aria-label={`Add ${product.name} to wishlist`}
                >
                  <Heart className="h-5 w-5" style={{ color: '#F4A6B2' }} aria-hidden="true" />
                  Add to Wishlist
                </button>
              </div>
            </section>
          </div>

          <section className="mt-16" aria-label="Product details">
            <nav aria-label="Product information tabs">
              <ul className="mb-8 flex flex-wrap gap-6" role="tablist" style={{ borderBottom: '2px solid #D4C4B0' }}>
                {[
                  { key: 'description', label: 'Description' },
                  { key: 'specifications', label: 'Specifications' },
                  { key: 'shipping', label: 'Shipping' },
                ].map((tab) => (
                  <li key={tab.key} role="presentation">
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.key as typeof activeTab)}
                      className="relative px-2 pb-4 transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif', color: activeTab === tab.key ? '#5A7050' : '#7A9070', fontWeight: activeTab === tab.key ? 600 : 500, fontSize: '1.1rem' }}
                      role="tab"
                      aria-selected={activeTab === tab.key}
                      aria-controls={`${tab.key}-panel`}
                      id={`${tab.key}-tab`}
                    >
                      {tab.label}
                      {activeTab === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#7A9070' }} aria-hidden="true" />}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="max-w-4xl">
              {activeTab === 'description' && (
                <div role="tabpanel" id="description-panel" aria-labelledby="description-tab" className="py-6">
                  <p className="text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }} itemProp="description">
                    {product.description}
                  </p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div role="tabpanel" id="specifications-panel" aria-labelledby="specifications-tab" className="py-6">
                  {Object.keys(product.specifications).length > 0 ? (
                    <dl className="space-y-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                          <dt className="sm:w-40 sm:flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 600 }}>
                            {key}:
                          </dt>
                          <dd style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45' }}>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}>
                      Specifications will be updated soon.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'shipping' && (
                <div role="tabpanel" id="shipping-panel" aria-labelledby="shipping-tab" className="py-6">
                  <p className="text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}>
                    {product.shipping}
                  </p>
                </div>
              )}
            </div>
          </section>
        </article>

        <section className="store-shell py-10 lg:py-20" aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" className="mb-8 sm:mb-12 text-2xl sm:text-3xl lg:text-4xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>
            Customer Reviews
          </h2>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <aside className="lg:col-span-1">
              <div className="sticky top-24 rounded-3xl p-8" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', boxShadow: '0 10px 40px rgba(122, 144, 112, 0.12)' }}>
                <div className="mb-8 text-center">
                  <p className="mb-3 text-4xl sm:text-5xl lg:text-6xl" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}>
                    {product.rating.toFixed(1)}
                  </p>
                  <p className="mb-4 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>out of 5</p>
                  <div className="mb-4 flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-6 w-6" fill={star <= Math.round(product.rating) ? '#F4A6B2' : 'none'} style={{ color: star <= Math.round(product.rating) ? '#F4A6B2' : '#D4C4B0', strokeWidth: 2 }} aria-hidden="true" />
                    ))}
                  </div>
                  <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Based on {product.reviewCount} reviews</p>
                </div>

                <button
                  type="button"
                  onClick={() => showInfoToast('Review flow coming soon', 'Customer review submission is the next storefront enhancement.')}
                  className="w-full rounded-full py-4 transition-all hover:scale-105"
                  style={{ backgroundColor: '#7A9070', color: '#FFFFFF', boxShadow: '0 6px 24px rgba(122, 144, 112, 0.4)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                  aria-label="Write a review"
                >
                  Write a Review
                </button>
              </div>
            </aside>

            <div className="lg:col-span-2">
              {product.reviews.length > 0 ? (
                <div className="space-y-6">
                  {product.reviews.map((review, index) => (
                    <article key={`${review.name}-${index}`} className="border-b pb-6" style={{ borderColor: '#D4C4B0' }}>
                      <header className="mb-4">
                        <div className="mb-3 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-5 w-5" fill={star <= review.rating ? '#F4A6B2' : 'none'} style={{ color: star <= review.rating ? '#F4A6B2' : '#D4C4B0', strokeWidth: 2 }} aria-hidden="true" />
                          ))}
                          <span className="sr-only">{review.rating} out of 5 stars</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>{review.name}</h3>
                          <time dateTime={review.date} className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>{formatReviewDate(review.date)}</time>
                        </div>
                      </header>

                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: '1.75' }}>{review.comment}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl p-8" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', boxShadow: '0 10px 40px rgba(122, 144, 112, 0.12)' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: '1.75' }}>No reviews have been added for this product yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}