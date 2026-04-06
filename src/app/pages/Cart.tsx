import { useState } from 'react';
import { Link } from 'react-router';
import { Minus, Plus, ShoppingCart, Tag, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { EmptyState } from '../components/EmptyState';
import { showErrorToast, showSuccessToast } from '../lib/notifications';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useCartStore } from '../store/cartStore';
import { PageSeo } from '../components/PageSeo';
import { validateCoupon } from '../lib/coupons';
import { Skeleton } from '../components/ui/skeleton';
import { calcDeliveryCharge, formatPKR, FREE_DELIVERY_THRESHOLD } from '../lib/pricing';

export default function Cart() {
  const { items: cartItems, isLoading: loading, updateQuantity: storeUpdateQty, removeItem: storeRemoveItem } = useCartStore();
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = calcDeliveryCharge(subtotal);
  // Tax (4% COD) is calculated at checkout depending on payment method
  const total = subtotal + deliveryCharge - appliedDiscount;

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    storeUpdateQty(itemId, newQuantity).catch((err: unknown) => {
      showErrorToast('Cart error', err instanceof Error ? err.message : 'Failed to update quantity.');
    });
  };

  const removeItem = (itemId: string) => {
    storeRemoveItem(itemId).catch((err: unknown) => {
      showErrorToast('Cart error', err instanceof Error ? err.message : 'Failed to remove item.');
    });
  };

  const applyDiscount = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!discountCode.trim()) return;

    setIsValidating(true);
    try {
      const coupon = await validateCoupon(discountCode);
      if (coupon) {
        const discount = coupon.discountType === 'percent'
          ? subtotal * (coupon.discountValue / 100)
          : coupon.discountValue;
        setAppliedDiscount(discount);
        showSuccessToast('Discount applied', `${coupon.code} has been added to your order.`);
      } else {
        showErrorToast('Invalid discount code', 'This code is expired, used up, or does not exist.');
      }
    } catch {
      showErrorToast('Error validating coupon', 'Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      <PageSeo title="Cart" />
      <Header />

      <main className="store-section">
        <div className="store-shell">
          <Breadcrumbs items={[{ label: 'Cart' }]} className="mb-6" />
          <header className="mb-8 md:mb-12">
            <h1 className="mb-2 text-3xl md:mb-3 md:text-4xl lg:text-5xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>
              Shopping Cart
            </h1>
            <p className="text-sm md:text-base" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>
              {loading ? 'Loading…' : `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'} in your cart`}
            </p>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
              <div className="lg:col-span-2 space-y-0">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-4 py-6 sm:gap-6" style={{ borderBottom: n < 3 ? '1px solid rgba(212,196,176,0.3)' : undefined }}>
                    <Skeleton className="h-20 w-20 flex-shrink-0 rounded-xl sm:h-24 sm:w-24" style={{ backgroundColor: '#EEF2EE' }} />
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                      <Skeleton className="h-4 w-1/4 rounded-full" style={{ backgroundColor: '#F7E7EB' }} />
                      <div className="flex items-center justify-between mt-3">
                        <Skeleton className="h-9 w-24 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                        <Skeleton className="h-5 w-16 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 rounded-2xl border p-5 sm:rounded-3xl sm:p-8" style={{ backgroundColor: '#FFFFFF', borderColor: '#D4C4B0' }}>
                <Skeleton className="mb-4 h-6 w-1/2 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex justify-between">
                    <Skeleton className="h-4 w-20 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                    <Skeleton className="h-4 w-16 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                  </div>
                ))}
                <Skeleton className="mt-4 h-12 w-full rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="h-8 w-8" aria-hidden="true" />}
              title="Your cart is empty"
              description="Start building a cozy order with handcrafted mugs and calming tabletop pieces made for slow mornings."
              actionLabel="Continue Shopping"
              actionTo="/shop"
              ariaLabel="Empty shopping cart"
            />
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
              <section className="lg:col-span-2" aria-labelledby="cart-items-heading">
                <h2 id="cart-items-heading" className="sr-only">Cart items</h2>

                <ul className="space-y-0" role="list">
                  {cartItems.map((item, index) => (
                    <li key={item.id}>
                      <article className="flex gap-4 py-6 sm:gap-6" itemScope itemType="https://schema.org/Product">
                        {/* Thumbnail */}
                        <Link to={`/product/${item.productId}`} className="flex-shrink-0" aria-label={`View ${item.name}`}>
                          <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover sm:h-24 sm:w-24" style={{ border: '2px solid #D4C4B0' }} itemProp="image" />
                        </Link>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          {/* Name + remove button */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <Link to={`/product/${item.productId}`}>
                                <h3 className="product-title-wrap mb-1 text-base sm:text-lg hover:underline" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }} itemProp="name">
                                  {item.name}
                                </h3>
                              </Link>
                              <p className="text-sm sm:text-base" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 600 }} itemProp="offers" itemScope itemType="https://schema.org/Offer">
                                <meta itemProp="price" content={item.price.toString()} />
                                <meta itemProp="priceCurrency" content="PKR" />
                                {formatPKR(item.price)}
                              </p>
                            </div>
                            <button type="button" onClick={() => removeItem(item.id)} className="flex-shrink-0 rounded-full p-1.5 transition-all hover:scale-110" style={{ color: '#7A9070' }} aria-label={`Remove ${item.name} from cart`}>
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                            </button>
                          </div>

                          {/* Qty + line total */}
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <label htmlFor={`quantity-${item.id}`} className="sr-only">Quantity for {item.name}</label>
                            <div className="inline-flex items-center overflow-hidden rounded-full" style={{ border: '2px solid #D4C4B0', backgroundColor: '#FFFFFF' }} role="group" aria-label={`Quantity selector for ${item.name}`}>
                              <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors" style={{ backgroundColor: item.quantity === 1 ? 'transparent' : '#FAF8F3', color: '#7A9070' }} aria-label={`Decrease quantity of ${item.name}`} disabled={item.quantity === 1}>
                                <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                              </button>
                              <input type="number" id={`quantity-${item.id}`} value={item.quantity} onChange={(event) => updateQuantity(item.id, Math.max(1, Number.parseInt(event.target.value, 10) || 1))} className="w-8 text-center outline-none sm:w-12" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600, fontSize: '0.875rem' }} min="1" inputMode="numeric" />
                              <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors" style={{ backgroundColor: '#FAF8F3', color: '#7A9070' }} aria-label={`Increase quantity of ${item.name}`}>
                                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                              </button>
                            </div>
                            <p className="text-base sm:text-lg" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}>
                              {formatPKR(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </article>

                      {index < cartItems.length - 1 && <hr style={{ borderColor: '#D4C4B0', borderWidth: '1px', opacity: 0.3 }} />}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link to="/shop" className="mobile-full-button items-center gap-2 transition-opacity hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}>
                    ← Continue Shopping
                  </Link>
                </div>
              </section>

              <aside className="lg:col-span-1" aria-labelledby="order-summary-heading">
                <div className="sticky top-24 rounded-2xl p-5 sm:rounded-3xl sm:p-8" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', boxShadow: '0 10px 40px rgba(122, 144, 112, 0.12)' }}>
                  <h2 id="order-summary-heading" className="mb-6 text-2xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>
                    Order Summary
                  </h2>

                  <dl className="mb-6 space-y-4">
                    <div className="flex justify-between">
                      <dt style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Subtotal</dt>
                      <dd style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>{formatPKR(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Delivery</dt>
                      <dd style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>{deliveryCharge === 0 ? 'Free' : formatPKR(deliveryCharge)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontSize: '0.8rem' }}>COD Tax (4%)</dt>
                      <dd style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 400, fontSize: '0.8rem' }}>Applied at checkout</dd>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between">
                        <dt style={{ fontFamily: 'Inter, sans-serif', color: '#F4A6B2' }}>Discount</dt>
                        <dd style={{ fontFamily: 'Inter, sans-serif', color: '#F4A6B2', fontWeight: 500 }}>-{formatPKR(appliedDiscount)}</dd>
                      </div>
                    )}
                    <hr style={{ borderColor: '#D4C4B0', borderWidth: '1px' }} />
                    <div className="flex items-center justify-between">
                      <dt className="text-lg" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 600 }}>Total</dt>
                      <dd className="text-2xl" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}>{formatPKR(total)}</dd>
                    </div>
                  </dl>

                  <form onSubmit={applyDiscount} className="mb-6">
                    <label htmlFor="discount-code" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>
                      Discount Code
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#7A9070' }} aria-hidden="true" />
                        <input type="text" id="discount-code" value={discountCode} onChange={(event) => setDiscountCode(event.target.value)} placeholder="Enter code" className="w-full rounded-xl py-3 pl-10 pr-4 outline-none" style={{ backgroundColor: '#FAF8F3', border: '2px solid #D4C4B0', color: '#4A5D45', fontFamily: 'Inter, sans-serif' }} />
                      </div>
                      <button type="submit" disabled={isValidating} className="flex-shrink-0 rounded-xl px-5 py-3 transition-all hover:scale-105 disabled:opacity-50" style={{ backgroundColor: '#7A9070', color: '#ffffff', fontFamily: 'Inter, sans-serif', fontWeight: 500 }} aria-label="Apply discount code">
                        {isValidating ? '...' : 'Apply'}
                      </button>
                    </div>
                    {appliedDiscount > 0 && (
                      <p className="mt-2 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#F4A6B2' }} role="status">
                        ✓ Discount code applied!
                      </p>
                    )}
                  </form>

                  {subtotal < FREE_DELIVERY_THRESHOLD && (
                    <p className="mb-6 rounded-xl p-3 text-sm" style={{ backgroundColor: '#FAF8F3', fontFamily: 'Inter, sans-serif', color: '#7A9070', border: '1px solid #D4C4B0' }} role="status">
                      Add {formatPKR(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery!
                    </p>
                  )}

                  <Link to="/checkout" className="flex w-full items-center justify-center rounded-full px-6 py-5 text-center text-lg leading-tight transition-all hover:scale-[1.02]" style={{ backgroundColor: '#7A9070', color: '#ffffff', boxShadow: '0 8px 32px rgba(122, 144, 112, 0.4)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }} aria-label={`Proceed to checkout with total of ${formatPKR(total)}`}>
                    Proceed to Checkout
                  </Link>

                  <p className="mt-4 text-center text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>
                    🔒 Secure checkout powered by SSL
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}