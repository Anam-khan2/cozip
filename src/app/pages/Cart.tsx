import { useState } from 'react';
import { Link } from 'react-router';
import { Minus, Plus, ShoppingCart, Tag, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { EmptyState } from '../components/EmptyState';
import { showErrorToast, showSuccessToast } from '../lib/notifications';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      productId: 1,
      name: 'Handmade Aesthetic Pastel Cloud Mug - Limited 2026 Edition',
      variant: 'Cream',
      price: 24.99,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1674317872332-ca9c2cd00953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXN0aGV0aWMlMjBjZXJhbWljJTIwbXVnJTIwY29mZmVlfGVufDF8fHx8MTc3MjgzNDAxNnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 2,
      productId: 2,
      name: 'Pink Pastel Mug',
      variant: 'Blush Pink',
      price: 22.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1588165231518-b4b22bfa0ddf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwYWVzdGhldGljJTIwY29mZmVlJTIwbXVnfGVufDF8fHx8MTc3MjgzNDAxNnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 3,
      productId: 3,
      name: 'Cute Pastel Tea Mug',
      variant: 'Mint Green',
      price: 26.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1617117646043-5ce463db0be7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcGFzdGVsJTIwbXVnJTIwdGVhfGVufDF8fHx8MTc3MjgzNDAxN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ]);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const shippingCost = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + tax + shippingCost - appliedDiscount;

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      return;
    }

    setCartItems((items) => items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)));
  };

  const removeItem = (itemId: number) => {
    setCartItems((items) => items.filter((item) => item.id !== itemId));
  };

  const applyDiscount = (event: React.FormEvent) => {
    event.preventDefault();

    if (discountCode.toUpperCase() === 'COZY10') {
      setAppliedDiscount(subtotal * 0.1);
      showSuccessToast('Discount applied', 'COZY10 has been added to your order.');
      return;
    }

    showErrorToast('Invalid discount code', 'Try COZY10 for the current demo checkout flow.');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      <Header />

      <main className="store-section">
        <div className="store-shell">
          <Breadcrumbs items={[{ label: 'Cart' }]} className="mb-6" />
          <header className="mb-8 md:mb-12">
            <h1 className="mb-2 text-3xl md:mb-3 md:text-4xl lg:text-5xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>
              Shopping Cart
            </h1>
            <p className="text-sm md:text-base" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </header>

          {cartItems.length === 0 ? (
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
                      <article className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:gap-6" itemScope itemType="https://schema.org/Product">
                        <Link to={`/product/${item.productId}`} className="flex-shrink-0" aria-label={`View ${item.name}`}>
                          <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl object-cover" style={{ border: '2px solid #D4C4B0' }} itemProp="image" />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <Link to={`/product/${item.productId}`}>
                            <h3 className="product-title-wrap mb-1 text-lg hover:underline" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }} itemProp="name">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="mb-3 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>
                            Variant: {item.variant}
                          </p>
                          <p className="text-lg" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 600 }} itemProp="offers" itemScope itemType="https://schema.org/Offer">
                            <meta itemProp="price" content={item.price.toString()} />
                            <meta itemProp="priceCurrency" content="USD" />
                            ${item.price.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex-shrink-0">
                          <label htmlFor={`quantity-${item.id}`} className="sr-only">Quantity for {item.name}</label>
                          <div className="inline-flex items-center overflow-hidden rounded-full" style={{ border: '2px solid #D4C4B0', backgroundColor: '#FFFFFF' }} role="group" aria-label={`Quantity selector for ${item.name}`}>
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 transition-colors" style={{ backgroundColor: item.quantity === 1 ? 'transparent' : '#FAF8F3', color: '#7A9070' }} aria-label={`Decrease quantity of ${item.name}`} disabled={item.quantity === 1}>
                              <Minus className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <input type="number" id={`quantity-${item.id}`} value={item.quantity} onChange={(event) => updateQuantity(item.id, Math.max(1, Number.parseInt(event.target.value, 10) || 1))} className="w-12 text-center outline-none" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }} min="1" inputMode="numeric" />
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 transition-colors" style={{ backgroundColor: '#FAF8F3', color: '#7A9070' }} aria-label={`Increase quantity of ${item.name}`}>
                              <Plus className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        <div className="self-start text-left sm:self-center sm:text-right">
                          <p className="text-lg" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        <button type="button" onClick={() => removeItem(item.id)} className="flex-shrink-0 rounded-full p-2 transition-all hover:scale-110" style={{ color: '#7A9070' }} aria-label={`Remove ${item.name} from cart`}>
                          <Trash2 className="h-5 w-5" aria-hidden="true" />
                        </button>
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
                <div className="sticky top-24 rounded-3xl p-8" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', boxShadow: '0 10px 40px rgba(122, 144, 112, 0.12)' }}>
                  <h2 id="order-summary-heading" className="mb-6 text-2xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>
                    Order Summary
                  </h2>

                  <dl className="mb-6 space-y-4">
                    <div className="flex justify-between">
                      <dt style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Subtotal</dt>
                      <dd style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>${subtotal.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Tax (8%)</dt>
                      <dd style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>${tax.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Shipping</dt>
                      <dd style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</dd>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between">
                        <dt style={{ fontFamily: 'Inter, sans-serif', color: '#F4A6B2' }}>Discount</dt>
                        <dd style={{ fontFamily: 'Inter, sans-serif', color: '#F4A6B2', fontWeight: 500 }}>-${appliedDiscount.toFixed(2)}</dd>
                      </div>
                    )}
                    <hr style={{ borderColor: '#D4C4B0', borderWidth: '1px' }} />
                    <div className="flex items-center justify-between">
                      <dt className="text-lg" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 600 }}>Total</dt>
                      <dd className="text-2xl" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}>${total.toFixed(2)}</dd>
                    </div>
                  </dl>

                  <form onSubmit={applyDiscount} className="mb-6">
                    <label htmlFor="discount-code" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>
                      Discount Code
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#7A9070' }} aria-hidden="true" />
                        <input type="text" id="discount-code" value={discountCode} onChange={(event) => setDiscountCode(event.target.value)} placeholder="Enter code" className="w-full rounded-xl py-3 pl-10 pr-4 outline-none" style={{ backgroundColor: '#FAF8F3', border: '2px solid #D4C4B0', color: '#4A5D45', fontFamily: 'Inter, sans-serif' }} />
                      </div>
                      <button type="submit" className="w-full rounded-xl px-6 py-3 transition-all hover:scale-105 sm:w-auto" style={{ backgroundColor: '#7A9070', color: '#ffffff', fontFamily: 'Inter, sans-serif', fontWeight: 500 }} aria-label="Apply discount code">
                        Apply
                      </button>
                    </div>
                    {appliedDiscount > 0 && (
                      <p className="mt-2 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#F4A6B2' }} role="status">
                        ✓ Discount code applied!
                      </p>
                    )}
                  </form>

                  {subtotal < 50 && (
                    <p className="mb-6 rounded-xl p-3 text-sm" style={{ backgroundColor: '#FAF8F3', fontFamily: 'Inter, sans-serif', color: '#7A9070', border: '1px solid #D4C4B0' }} role="status">
                      Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  )}

                  <Link to="/checkout" className="mobile-full-button rounded-full py-5 text-lg transition-all hover:scale-[1.02]" style={{ backgroundColor: '#7A9070', color: '#ffffff', boxShadow: '0 8px 32px rgba(122, 144, 112, 0.4)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }} aria-label={`Proceed to checkout with total of $${total.toFixed(2)}`}>
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