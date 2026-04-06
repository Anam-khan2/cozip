import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { MapPin, PackageCheck, Truck } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EmptyState } from '../components/EmptyState';
import { formatOrderNumber, getTrackedOrder, getTrackedOrderFromSupabase } from '../lib/orderTracking';
import { PageSeo } from '../components/PageSeo';
import { showErrorToast } from '../lib/notifications';
import { formatPKR } from '../lib/pricing';
import { Skeleton } from '../components/ui/skeleton';
import type { TrackedOrder } from '../types';

export default function OrderTrackingDetails() {
  const { orderNumber = '' } = useParams();
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Try localStorage first (instant), then Supabase
        const local = getTrackedOrder(orderNumber);
        if (local) {
          if (!cancelled) { setTrackedOrder(local); setLoading(false); }
          return;
        }
        const remote = await getTrackedOrderFromSupabase(orderNumber);
        if (!cancelled) { setTrackedOrder(remote); setLoading(false); }
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
          showErrorToast('Tracking error', err instanceof Error ? err.message : 'Failed to load order details.');
        }
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [orderNumber]);

  const pageTitle = trackedOrder ? `Track ${formatOrderNumber(trackedOrder.orderNumber)}` : 'Order Tracking';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      <PageSeo title={pageTitle} />
      <Header />

      <main className="store-section">
        <div className="store-shell">
          <Breadcrumbs items={[{ label: 'Track Order', to: '/track-order' }, { label: trackedOrder ? formatOrderNumber(trackedOrder.orderNumber) : loading ? 'Loading…' : 'Order Not Found' }]} className="mb-8" />

          {loading ? (
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.95fr)] xl:items-start">
              <div className="space-y-8">
                {/* Header card skeleton */}
                <div className="overflow-hidden rounded-[2rem] border" style={{ backgroundColor: '#FFFFFF', borderColor: '#D4C4B0' }}>
                  <div className="border-b px-6 py-5 md:px-8 space-y-3" style={{ borderColor: '#E8DDC8', backgroundColor: '#FBF8F1' }}>
                    <Skeleton className="h-4 w-40 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                    <Skeleton className="h-9 w-56 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                    <Skeleton className="h-4 w-72 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                  </div>
                  <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 md:p-8 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="rounded-2xl p-5" style={{ backgroundColor: '#FAF8F3' }}>
                        <Skeleton className="mb-2 h-3 w-16 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                        <Skeleton className="h-5 w-24 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Timeline skeleton */}
                <div className="rounded-[2rem] border p-6 md:p-8" style={{ backgroundColor: '#FFFFFF', borderColor: '#D4C4B0' }}>
                  <Skeleton className="mb-2 h-8 w-52 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                  <Skeleton className="mb-6 h-4 w-80 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                  <div className="space-y-5">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="flex gap-4">
                        <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                        <div className="flex-1 space-y-2 rounded-[1.5rem] border p-5" style={{ borderColor: '#EFE6D3' }}>
                          <Skeleton className="h-5 w-40 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                          <Skeleton className="h-4 w-full rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                          <Skeleton className="h-4 w-32 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Sidebar skeleton */}
              <div className="space-y-8">
                <div className="rounded-[2rem] border p-6 md:p-8 space-y-5" style={{ backgroundColor: '#FFFFFF', borderColor: '#D4C4B0' }}>
                  <Skeleton className="h-7 w-40 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="space-y-1">
                      <Skeleton className="h-3 w-20 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                      <Skeleton className="h-5 w-36 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                    </div>
                  ))}
                </div>
                <div className="rounded-[2rem] border p-6 md:p-8 space-y-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#D4C4B0' }}>
                  <Skeleton className="h-7 w-32 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                  {[1, 2].map((n) => (
                    <div key={n} className="flex gap-4 rounded-2xl p-3" style={{ backgroundColor: '#FAF8F3' }}>
                      <Skeleton className="h-16 w-16 flex-shrink-0 rounded-xl" style={{ backgroundColor: '#EEF2EE' }} />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                        <Skeleton className="h-3 w-12 rounded-full" style={{ backgroundColor: '#EEF2EE' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : !trackedOrder ? (
            <EmptyState
              icon={<PackageCheck className="h-8 w-8" aria-hidden="true" />}
              title="Order details not found"
              description="We could not find a shipment with this order ID. Please recheck the code from your confirmation screen or email."
              actionLabel="Track Another Order"
              actionTo="/track-order"
              ariaLabel="Order details not found"
            />
          ) : (
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.95fr)] xl:items-start">
              <section className="space-y-8" aria-labelledby="tracking-heading">
                <article className="overflow-hidden rounded-[2rem] border" style={{ backgroundColor: '#FFFFFF', borderColor: '#D4C4B0', boxShadow: '0 12px 42px rgba(122, 144, 112, 0.12)' }}>
                  <div className="border-b px-6 py-5 md:px-8" style={{ background: 'linear-gradient(135deg, #FBF8F1 0%, #F3F7F2 100%)', borderColor: '#E8DDC8' }}>
                    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="max-w-2xl">
                        <p className="mb-2 text-sm uppercase tracking-[0.2em]" style={{ fontFamily: 'Inter, sans-serif', color: '#B7B09F', fontWeight: 700 }}>
                          Guest Order Tracking
                        </p>
                        <h1 id="tracking-heading" className="mb-2 text-3xl md:text-4xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>
                          {formatOrderNumber(trackedOrder.orderNumber)}
                        </h1>
                        <p className="text-sm leading-relaxed md:text-base" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>
                          {trackedOrder.statusDescription}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-full px-4 py-2 text-sm" style={{ backgroundColor: '#F0F4F0', color: '#5A7050', border: '1px solid #D4C4B0', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                          {trackedOrder.status}
                        </span>
                        <span className="inline-flex items-center rounded-full px-4 py-2 text-sm" style={{ backgroundColor: '#FFF7F8', color: '#8A5F6B', border: '1px solid #F4D4DC', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                          {trackedOrder.shippingMethod.charAt(0).toUpperCase() + trackedOrder.shippingMethod.slice(1)} shipping
                        </span>
                      </div>
                    </header>
                  </div>

                  <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 md:p-8 xl:grid-cols-4">
                    <div className="rounded-2xl p-5" style={{ backgroundColor: '#FAF8F3' }}>
                      <p className="mb-1 text-xs uppercase tracking-[0.16em]" style={{ fontFamily: 'Inter, sans-serif', color: '#B7B09F', fontWeight: 700 }}>Carrier</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>{trackedOrder.carrier}</p>
                    </div>
                    <div className="rounded-2xl p-5" style={{ backgroundColor: '#FAF8F3' }}>
                      <p className="mb-1 text-xs uppercase tracking-[0.16em]" style={{ fontFamily: 'Inter, sans-serif', color: '#B7B09F', fontWeight: 700 }}>Tracking Code</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>{trackedOrder.trackingCode}</p>
                    </div>
                    <div className="rounded-2xl p-5" style={{ backgroundColor: '#FAF8F3' }}>
                      <p className="mb-1 text-xs uppercase tracking-[0.16em]" style={{ fontFamily: 'Inter, sans-serif', color: '#B7B09F', fontWeight: 700 }}>Route</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>{trackedOrder.originCity} to {trackedOrder.destinationCity}</p>
                    </div>
                    <div className="rounded-2xl p-5" style={{ backgroundColor: '#FAF8F3' }}>
                      <p className="mb-1 text-xs uppercase tracking-[0.16em]" style={{ fontFamily: 'Inter, sans-serif', color: '#B7B09F', fontWeight: 700 }}>Estimated Delivery</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>{trackedOrder.estimatedDelivery}</p>
                    </div>
                  </div>
                </article>

                <article className="rounded-[2rem] border p-6 md:p-8" style={{ backgroundColor: '#FFFFFF', borderColor: '#D4C4B0', boxShadow: '0 12px 42px rgba(122, 144, 112, 0.12)' }}>
                  <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h2 className="mb-2 text-3xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>
                        Shipment Timeline
                      </h2>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', lineHeight: 1.7 }}>
                        Each checkpoint shows where your parcel moved and what happened at that stage of fulfillment.
                      </p>
                    </div>
                    <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#F8F5EE' }}>
                      <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Current checkpoint</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>{trackedOrder.timeline.filter((event) => event.completed).slice(-1)[0]?.label ?? trackedOrder.status}</p>
                    </div>
                  </div>

                  <ol className="space-y-5" role="list">
                    {trackedOrder.timeline.map((event, index) => (
                      <li key={event.id} className="relative flex gap-4">
                        <div className="flex flex-col items-center pt-1">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm" style={{ backgroundColor: event.completed ? '#7A9070' : '#E8DDC8', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 700 }} aria-hidden="true">
                            {index + 1}
                          </span>
                          {index < trackedOrder.timeline.length - 1 && <span className="mt-2 h-full w-0.5" style={{ backgroundColor: event.completed ? '#BBD0B3' : '#E8DDC8' }} aria-hidden="true" />}
                        </div>
                        <div className="min-w-0 flex-1 rounded-[1.5rem] border p-5" style={{ backgroundColor: event.completed ? '#FAF8F3' : '#FCFAF5', borderColor: event.completed ? '#E8DDC8' : '#EFE6D3' }}>
                          <div className="mb-2 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                            <h3 style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>{event.label}</h3>
                            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>{event.timestamp}</span>
                          </div>
                          <p className="mb-3 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>{event.description}</p>
                          <p className="inline-flex items-center gap-2 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 500 }}>
                            <MapPin className="h-4 w-4" aria-hidden="true" />
                            {event.location}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </article>
              </section>

              <aside className="space-y-8 xl:sticky xl:top-28" aria-labelledby="order-summary-heading">
                <article className="rounded-[2rem] border p-6 md:p-8" style={{ backgroundColor: '#FFFFFF', borderColor: '#D4C4B0', boxShadow: '0 12px 42px rgba(122, 144, 112, 0.12)' }}>
                  <h2 id="order-summary-heading" className="mb-6 text-2xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>
                    Delivery Details
                  </h2>

                  <div className="space-y-5">
                    <div>
                      <p className="mb-1 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Customer</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>{trackedOrder.customerName}</p>
                      <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>{trackedOrder.email}</p>
                    </div>

                    <div>
                      <p className="mb-1 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Shipping Address</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.7 }}>
                        {trackedOrder.shippingAddressLine}
                        <br />
                        {trackedOrder.city}, {trackedOrder.state} {trackedOrder.zipCode}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Order Placed</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45' }}>{trackedOrder.orderPlacedAt}</p>
                    </div>

                    <div>
                      <p className="mb-1 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Destination</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45' }}>{trackedOrder.destinationCity}</p>
                    </div>
                  </div>
                </article>

                <article className="rounded-[2rem] border p-6 md:p-8" style={{ backgroundColor: '#FFFFFF', borderColor: '#D4C4B0', boxShadow: '0 12px 42px rgba(122, 144, 112, 0.12)' }}>
                  <h2 className="mb-6 text-2xl" style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}>
                    Order Items
                  </h2>

                  <ul className="mb-6 space-y-4" role="list">
                    {trackedOrder.items.map((item) => (
                      <li key={`${trackedOrder.orderNumber}-${item.id}`} className="flex gap-4 rounded-2xl p-3" style={{ backgroundColor: '#FAF8F3' }}>
                        <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" style={{ border: '2px solid #D4C4B0' }} />
                        <div className="min-w-0 flex-1">
                          <h3 className="product-title-wrap mb-1 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>
                            {item.name}
                          </h3>
                          <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 600 }}>
                          {formatPKR(item.price * item.quantity)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <dl className="space-y-3 rounded-2xl p-5" style={{ backgroundColor: '#FAF8F3' }}>
                    <div className="flex justify-between">
                      <dt style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Subtotal</dt>
                      <dd style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>{formatPKR(trackedOrder.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Delivery</dt>
                      <dd style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>{trackedOrder.shippingCost === 0 ? 'Free' : formatPKR(trackedOrder.shippingCost)}</dd>
                    </div>
                    {trackedOrder.tax > 0 && (
                      <div className="flex justify-between">
                        <dt style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>COD Tax (4%)</dt>
                        <dd style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}>{formatPKR(trackedOrder.tax)}</dd>
                      </div>
                    )}
                    <hr style={{ borderColor: '#D4C4B0', borderWidth: '1px' }} />
                    <div className="flex justify-between">
                      <dt className="text-lg" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 600 }}>Total</dt>
                      <dd className="text-xl" style={{ fontFamily: 'Inter, sans-serif', color: '#5A7050', fontWeight: 700 }}>{formatPKR(trackedOrder.total)}</dd>
                    </div>
                  </dl>

                  <Link to="/track-order" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 transition-all hover:scale-[1.02]" style={{ backgroundColor: '#7A9070', color: '#FFFFFF', boxShadow: '0 8px 24px rgba(122, 144, 112, 0.24)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    <Truck className="h-5 w-5" aria-hidden="true" />
                    Track Another Order
                  </Link>

                  <p className="mt-4 text-center text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', lineHeight: 1.7 }}>
                    Need help? Share your order ID with support for faster assistance.
                  </p>
                </article>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}