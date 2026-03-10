import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Check } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { showErrorToast, showSuccessToast } from '../lib/notifications';
import { Breadcrumbs } from '../components/Breadcrumbs';

type CheckoutStep = 'address' | 'shipping' | 'payment';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [addressForm, setAddressForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const cartItems: CartItem[] = [
    {
      id: 1,
      productId: 1,
      name: 'Handmade Aesthetic Pastel Cloud Mug - Limited 2026 Edition',
      price: 24.99,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1674317872332-ca9c2cd00953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXN0aGV0aWMlMjBjZXJhbWljJTIwbXVnJTIwY29mZmVlfGVufDF8fHx8MTc3MjgzNDAxNnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 2,
      productId: 2,
      name: 'Pink Pastel Mug',
      price: 22.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1588165231518-b4b22bfa0ddf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwYWVzdGhldGljJTIwY29mZmVlJTIwbXVnfGVufDF8fHx8MTc3MjgzNDAxNnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const shippingCost = shippingMethod === 'express' ? 12.99 : shippingMethod === 'standard' ? 5.99 : 0;
  const total = subtotal + tax + shippingCost;

  const handleAddressSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentStep('shipping');
  };

  const handleShippingSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (paymentForm.cardNumber.replace(/\s+/g, '').length < 16 || paymentForm.expiryDate.length < 5 || paymentForm.cvv.length < 3) {
      showErrorToast('Payment Failed', 'Please review your card number, expiry date, and CVV before placing the order.');
      return;
    }

    showSuccessToast('Payment approved', 'Your order is confirmed and being prepared.');
    navigate('/order-success');
  };

  const steps: Array<{ key: CheckoutStep; label: string; step: number }> = [
    { key: 'address', label: 'Address', step: 1 },
    { key: 'shipping', label: 'Shipping', step: 2 },
    { key: 'payment', label: 'Payment', step: 3 },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      <header className="border-b px-4 py-6 md:px-6 lg:px-12" style={{ borderColor: '#D4C4B0' }}>
        <div className="store-shell">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <BrandLogo className="inline-flex w-full justify-center md:w-auto" imageClassName="h-14 w-auto" />
            <Link to="/cart" className="text-center text-sm transition-opacity hover:opacity-70 md:text-right" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}>
              Return to cart
            </Link>
          </div>
        </div>
      </header>

      <main className="store-section">
        <div className="store-shell">
          <Breadcrumbs items={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} className="mb-8" />
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">
            <section className="lg:col-span-3" aria-labelledby="checkout-heading">
              <h1 id="checkout-heading" className="sr-only">Checkout process</h1>

              <nav aria-label="Checkout steps" className="mb-12">
                <ol className="flex flex-wrap items-center gap-4 lg:max-w-2xl lg:flex-nowrap lg:justify-between" role="list">
                  {steps.map((step, index) => {
                    const currentIndex = steps.findIndex((item) => item.key === currentStep);
                    const isComplete = currentIndex > index;
                    const isActive = currentStep === step.key;

                    return (
                      <li key={step.key} className="flex flex-1 items-center gap-4">
                        <div className="flex flex-1 flex-col items-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (step.key === 'address' || currentStep === 'payment') {
                                setCurrentStep(step.key);
                              }
                            }}
                            className="mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-all"
                            style={{ backgroundColor: isActive || isComplete ? '#7A9070' : '#D4C4B0', color: '#ffffff' }}
                            aria-current={isActive ? 'step' : undefined}
                            aria-label={`Step ${step.step}: ${step.label}`}
                            disabled={step.key === 'payment'}
                          >
                            {isComplete ? <Check className="h-5 w-5" aria-hidden="true" /> : <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{step.step}</span>}
                          </button>
                          <span className="text-center text-sm" style={{ fontFamily: 'Inter, sans-serif', color: isActive ? '#5A7050' : '#7A9070', fontWeight: isActive ? 600 : 500 }}>
                            {step.label}
                          </span>
                        </div>
                        {index < steps.length - 1 && <div className="mx-2 hidden h-0.5 flex-1 lg:block" style={{ backgroundColor: isComplete ? '#7A9070' : '#D4C4B0' }} aria-hidden="true" />}
                      </li>
                    );
                  })}
                </ol>
              </nav>

              {currentStep === 'address' && (
                <form onSubmit={handleAddressSubmit} className="max-w-2xl space-y-6">
                  <fieldset>
                    <legend className="mb-6 text-2xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>Shipping Address</legend>

                    <div className="mb-5">
                      <label htmlFor="email" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>Email Address</label>
                      <input type="email" id="email" value={addressForm.email} onChange={(event) => setAddressForm({ ...addressForm, email: event.target.value })} required autoComplete="email" className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', color: '#4A5D45', fontFamily: 'Inter, sans-serif' }} placeholder="your@email.com" />
                    </div>

                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>First Name</label>
                        <input type="text" id="firstName" value={addressForm.firstName} onChange={(event) => setAddressForm({ ...addressForm, firstName: event.target.value })} required autoComplete="given-name" className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', color: '#4A5D45', fontFamily: 'Inter, sans-serif' }} />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>Last Name</label>
                        <input type="text" id="lastName" value={addressForm.lastName} onChange={(event) => setAddressForm({ ...addressForm, lastName: event.target.value })} required autoComplete="family-name" className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', color: '#4A5D45', fontFamily: 'Inter, sans-serif' }} />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label htmlFor="address" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>Street Address</label>
                      <input type="text" id="address" value={addressForm.address} onChange={(event) => setAddressForm({ ...addressForm, address: event.target.value })} required autoComplete="street-address" className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', color: '#4A5D45', fontFamily: 'Inter, sans-serif' }} placeholder="123 Main Street" />
                    </div>

                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="city" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>City</label>
                        <input type="text" id="city" value={addressForm.city} onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} required autoComplete="address-level2" className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', color: '#4A5D45', fontFamily: 'Inter, sans-serif' }} />
                      </div>
                      <div className="sm:col-span-1">
                        <label htmlFor="state" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>State</label>
                        <input type="text" id="state" value={addressForm.state} onChange={(event) => setAddressForm({ ...addressForm, state: event.target.value })} required maxLength={2} autoComplete="address-level1" className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', color: '#4A5D45', fontFamily: 'Inter, sans-serif' }} placeholder="CA" />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="zipCode" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>Zip Code</label>
                        <input type="text" id="zipCode" value={addressForm.zipCode} onChange={(event) => setAddressForm({ ...addressForm, zipCode: event.target.value })} required autoComplete="postal-code" className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', color: '#4A5D45', fontFamily: 'Inter, sans-serif' }} placeholder="90210" />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label htmlFor="phone" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>Phone Number</label>
                      <input type="tel" id="phone" value={addressForm.phone} onChange={(event) => setAddressForm({ ...addressForm, phone: event.target.value })} required autoComplete="tel" className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', color: '#4A5D45', fontFamily: 'Inter, sans-serif' }} placeholder="(555) 123-4567" />
                    </div>
                  </fieldset>

                  <button type="submit" className="w-full rounded-full py-4 text-lg transition-all hover:scale-105" style={{ backgroundColor: '#7A9070', color: '#ffffff', boxShadow: '0 6px 24px rgba(122, 144, 112, 0.4)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    Continue to Shipping
                  </button>
                </form>
              )}

              {currentStep === 'shipping' && (
                <form onSubmit={handleShippingSubmit} className="max-w-2xl space-y-6">
                  <fieldset>
                    <legend className="mb-6 text-2xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>Shipping Method</legend>
                    <div className="space-y-4" role="radiogroup" aria-label="Shipping options">
                      {[
                        { value: 'free', label: 'Free Shipping', description: '5-7 business days', price: 'Free' },
                        { value: 'standard', label: 'Standard Shipping', description: '3-5 business days', price: '$5.99' },
                        { value: 'express', label: 'Express Shipping', description: '1-2 business days', price: '$12.99' },
                      ].map((option) => (
                        <label key={option.value} className="flex cursor-pointer items-center justify-between rounded-xl p-5 transition-all" style={{ backgroundColor: '#FFFFFF', border: shippingMethod === option.value ? '2px solid #7A9070' : '2px solid #D4C4B0', boxShadow: shippingMethod === option.value ? '0 4px 16px rgba(122, 144, 112, 0.15)' : 'none' }}>
                          <div className="flex items-center gap-4">
                            <input type="radio" name="shipping" value={option.value} checked={shippingMethod === option.value} onChange={(event) => setShippingMethod(event.target.value)} className="h-5 w-5" style={{ accentColor: '#7A9070' }} />
                            <div>
                              <p className="mb-1 text-base" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>{option.label}</p>
                              <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>{option.description}</p>
                            </div>
                          </div>
                          <p className="text-lg" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 600 }}>{option.price}</p>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button type="button" onClick={() => setCurrentStep('address')} className="flex-1 rounded-full py-4 text-lg transition-all hover:opacity-80" style={{ backgroundColor: '#FFFFFF', color: '#7A9070', border: '2px solid #D4C4B0', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      Back
                    </button>
                    <button type="submit" className="flex-1 rounded-full py-4 text-lg transition-all hover:scale-105" style={{ backgroundColor: '#7A9070', color: '#ffffff', boxShadow: '0 6px 24px rgba(122, 144, 112, 0.4)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                      Continue to Payment
                    </button>
                  </div>
                </form>
              )}

              {currentStep === 'payment' && (
                <form onSubmit={handlePaymentSubmit} className="max-w-2xl space-y-6">
                  <fieldset>
                    <legend className="mb-6 text-2xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>Payment Information</legend>

                    <div className="mb-5">
                      <label htmlFor="cardNumber" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>Card Number</label>
                      <input type="text" id="cardNumber" value={paymentForm.cardNumber} onChange={(event) => setPaymentForm({ ...paymentForm, cardNumber: event.target.value })} required className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', color: '#4A5D45', fontFamily: 'Inter, sans-serif' }} placeholder="1234 5678 9012 3456" maxLength={19} inputMode="numeric" autoComplete="cc-number" />
                    </div>

                    <div className="mb-5">
                      <label htmlFor="cardName" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>Cardholder Name</label>
                      <input type="text" id="cardName" value={paymentForm.cardName} onChange={(event) => setPaymentForm({ ...paymentForm, cardName: event.target.value })} required className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', color: '#4A5D45', fontFamily: 'Inter, sans-serif' }} placeholder="Name on card" autoComplete="cc-name" />
                    </div>

                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="expiryDate" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>Expiry Date</label>
                        <input type="text" id="expiryDate" value={paymentForm.expiryDate} onChange={(event) => setPaymentForm({ ...paymentForm, expiryDate: event.target.value })} required className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', color: '#4A5D45', fontFamily: 'Inter, sans-serif' }} placeholder="MM/YY" maxLength={5} autoComplete="cc-exp" />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>CVV</label>
                        <input type="text" id="cvv" value={paymentForm.cvv} onChange={(event) => setPaymentForm({ ...paymentForm, cvv: event.target.value })} required className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', color: '#4A5D45', fontFamily: 'Inter, sans-serif' }} placeholder="123" maxLength={4} inputMode="numeric" autoComplete="cc-csc" />
                      </div>
                    </div>
                  </fieldset>

                  <div className="rounded-xl p-4" style={{ backgroundColor: '#FAF8F3', border: '1px solid #D4C4B0' }}>
                    <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>🔒 Your payment information is secure and encrypted</p>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button type="button" onClick={() => setCurrentStep('shipping')} className="flex-1 rounded-full py-4 text-lg transition-all hover:opacity-80" style={{ backgroundColor: '#FFFFFF', color: '#7A9070', border: '2px solid #D4C4B0', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      Back
                    </button>
                    <button type="submit" className="flex-1 rounded-full py-4 text-lg transition-all hover:scale-105" style={{ backgroundColor: '#7A9070', color: '#ffffff', boxShadow: '0 6px 24px rgba(122, 144, 112, 0.4)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                      Place Order
                    </button>
                  </div>
                </form>
              )}
            </section>

            <aside className="lg:col-span-2" aria-labelledby="order-summary-heading">
              <div className="sticky top-24 rounded-3xl p-8" style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4C4B0', boxShadow: '0 10px 40px rgba(122, 144, 112, 0.12)' }}>
                <h2 id="order-summary-heading" className="mb-6 text-2xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>
                  Order Summary
                </h2>

                <ul className="mb-6 space-y-5" role="list">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="h-20 w-20 flex-shrink-0 rounded-xl object-cover" style={{ border: '2px solid #D4C4B0' }} />
                      <div className="min-w-0 flex-1">
                        <h3 className="product-title-wrap mb-1 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>{item.name}</h3>
                        <p className="mb-1 text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Qty: {item.quantity}</p>
                        <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <hr className="mb-6" style={{ borderColor: '#D4C4B0', borderWidth: '1px' }} />

                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontSize: '0.9rem' }}>Subtotal</dt>
                    <dd style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>${subtotal.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontSize: '0.9rem' }}>Shipping</dt>
                    <dd style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontSize: '0.9rem' }}>Tax</dt>
                    <dd style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>${tax.toFixed(2)}</dd>
                  </div>
                  <hr style={{ borderColor: '#D4C4B0', borderWidth: '1px' }} />
                  <div className="flex items-center justify-between pt-2">
                    <dt className="text-lg" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 600 }}>Total</dt>
                    <dd className="text-2xl" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}>${total.toFixed(2)}</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}