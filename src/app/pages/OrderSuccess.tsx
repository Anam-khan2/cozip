import { Link } from 'react-router';
import { Check } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { showInfoToast } from '../lib/notifications';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function OrderSuccess() {
  // Get order number from URL params or generate random
  const orderNumber = '#CZP-10892';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      {/* Header */}
      <Header />

      <main className="flex min-h-[calc(100vh-200px)] items-center justify-center px-6 py-10 lg:py-20">
        <section 
          className="max-w-2xl w-full text-center"
          aria-labelledby="success-heading"
        >
          <Breadcrumbs items={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout', to: '/checkout' }, { label: 'Order Complete' }]} className="mb-10 text-left" />
          {/* Success Icon - Large Sage Green Checkmark in Circle */}
          <div className="flex items-center justify-center mb-10">
            <div 
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: '#7A9070',
                boxShadow: '0 20px 60px rgba(122, 144, 112, 0.3)',
              }}
              role="img"
              aria-label="Success checkmark"
            >
              <Check 
                className="w-16 h-16" 
                style={{ 
                  color: '#FFFFFF',
                  strokeWidth: 3 
                }} 
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Success Message Header */}
          <header className="mb-8">
            <h1 
              id="success-heading"
              className="text-5xl mb-6" 
              style={{ 
                fontFamily: 'Playfair Display, serif', 
                color: '#5A7050', 
                fontWeight: 600 
              }}
            >
              Thank you for your order!
            </h1>
            
            {/* Order Details */}
            <div className="space-y-4">
              <p 
                className="text-xl"
                style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  color: '#4A5D45',
                  fontWeight: 500
                }}
              >
                Your order{' '}
                <span 
                  style={{ 
                    color: '#7A9070',
                    fontWeight: 700 
                  }}
                >
                  {orderNumber}
                </span>
                {' '}has been confirmed
              </p>
              
              <p 
                className="text-lg"
                style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  color: '#7A9070' 
                }}
              >
                A confirmation email has been sent to your inbox.
                <br />
                We'll notify you when your cozy mugs are on their way!
              </p>
            </div>
          </header>

          {/* Order Summary Card */}
          <article 
            className="mb-12 p-8 rounded-3xl"
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #D4C4B0',
              boxShadow: '0 10px 40px rgba(122, 144, 112, 0.12)'
            }}
          >
            <h2 
              className="text-2xl mb-6" 
              style={{ 
                fontFamily: 'Playfair Display, serif', 
                color: '#5A7050', 
                fontWeight: 600 
              }}
            >
              What's Next?
            </h2>
            
            <dl className="space-y-4 text-left max-w-md mx-auto">
              {/* Step 1 */}
              <div className="flex gap-4">
                <dt 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{
                    backgroundColor: '#7A9070',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600
                  }}
                >
                  1
                </dt>
                <dd style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45' }}>
                  <strong style={{ fontWeight: 600 }}>Order Processing</strong>
                  <p style={{ color: '#7A9070', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    We're carefully preparing your items
                  </p>
                </dd>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <dt 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{
                    backgroundColor: '#F4A6B2',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600
                  }}
                >
                  2
                </dt>
                <dd style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45' }}>
                  <strong style={{ fontWeight: 600 }}>Shipping</strong>
                  <p style={{ color: '#7A9070', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    You'll receive tracking information via email
                  </p>
                </dd>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <dt 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{
                    backgroundColor: '#7A9070',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600
                  }}
                >
                  3
                </dt>
                <dd style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45' }}>
                  <strong style={{ fontWeight: 600 }}>Enjoy!</strong>
                  <p style={{ color: '#7A9070', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Your cozy mugs will arrive in 3-5 business days
                  </p>
                </dd>
              </div>
            </dl>
          </article>

          {/* Action Buttons */}
          <nav className="space-y-4" aria-label="Post-order actions">
            {/* Continue Shopping Button - Large Pill */}
            <Link
              to="/"
              className="mx-auto block w-full max-w-md rounded-full py-5 text-lg transition-all hover:scale-105 mobile-full-button"
              style={{
                backgroundColor: '#7A9070',
                color: '#FFFFFF',
                boxShadow: '0 8px 32px rgba(122, 144, 112, 0.4)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
              }}
              aria-label="Continue shopping"
            >
              Continue Shopping
            </Link>

            {/* View Order Details Link */}
            <Link
              to="/dashboard"
              className="mx-auto block w-full max-w-md rounded-full border-2 py-4 text-base transition-all hover:opacity-70 mobile-full-button"
              style={{
                backgroundColor: 'transparent',
                color: '#7A9070',
                borderColor: '#D4C4B0',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
              }}
              aria-label="View order details in your dashboard"
            >
              View Order Details
            </Link>
          </nav>

          {/* Support Information */}
          <footer className="mt-12 pt-8 border-t" style={{ borderColor: '#D4C4B0' }}>
            <p 
              className="text-sm"
              style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
            >
              Questions about your order?{' '}
              <button
                onClick={() => showInfoToast('Support is available via the contact page.', 'Share your order number for faster help.')}
                className="underline hover:opacity-70 transition-opacity"
                style={{ color: '#5A7050', fontWeight: 600 }}
                aria-label="Get help with your order"
              >
                Contact our support team
              </button>
            </p>
          </footer>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}