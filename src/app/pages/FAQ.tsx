import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, HelpCircle, Loader2 } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PageSeo } from '../components/PageSeo';
import { fetchFAQs, type FAQ as FAQItem } from '../lib/faqs';

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs()
      .then(setFaqs)
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter FAQs based on search
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      <PageSeo title="FAQ" />
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="store-section">
        <div className="store-shell-narrow">
        <Breadcrumbs items={[{ label: 'FAQ' }]} className="mb-6" />
        {/* Page Header */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle 
              className="w-10 h-10" 
              style={{ color: '#7A9070' }}
              aria-hidden="true"
            />
            <h1 
              className="text-5xl"
              style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
            >
              How can we help?
            </h1>
          </div>
          <p 
            className="text-lg"
            style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', lineHeight: 1.6 }}
          >
            Find answers to commonly asked questions about Cozip
          </p>
        </header>

        {/* Search Input */}
        <section className="mb-12">
          <label htmlFor="faq-search" className="sr-only">
            Search frequently asked questions
          </label>
          <div className="relative">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: '#9CA3AF' }}
              aria-hidden="true"
            />
            <input
              type="text"
              id="faq-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for questions..."
              className="w-full pl-12 pr-6 py-4 rounded-xl transition-all"
              style={{
                border: '2px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                color: '#4A5D45',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = '#7A9070'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
        </section>

        {/* FAQ Accordions */}
        <section aria-label="Frequently asked questions">
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group p-6 rounded-xl transition-all"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #E5E7EB',
                  }}
                >
                  <summary 
                    className="cursor-pointer list-none flex items-center justify-between transition-all"
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      color: '#4A5D45',
                      fontWeight: 600,
                      fontSize: '1.125rem',
                    }}
                  >
                    <span className="pr-4">{faq.question}</span>
                    <svg
                      className="w-5 h-5 transition-transform group-open:rotate-180"
                      style={{ color: '#7A9070', flexShrink: 0 }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <p 
                    className="mt-4 pt-4"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#7A9070',
                      lineHeight: 1.7,
                      borderTop: '1px solid #F3F4F6',
                    }}
                  >
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          ) : (
            /* No Results */
            <div 
              className="rounded-xl py-10 text-center lg:py-16"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
            >
              <HelpCircle 
                className="w-12 h-12 mx-auto mb-4" 
                style={{ color: '#E5E7EB' }}
                aria-hidden="true"
              />
              <h2 
                className="text-xl mb-2"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                No results found
              </h2>
              <p 
                className="text-sm mb-6"
                style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
              >
                Try a different search or browse all questions
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-2 rounded-full transition-all hover:opacity-70"
                style={{
                  backgroundColor: '#7A9070',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                }}
              >
                Clear Search
              </button>
            </div>
          )}
        </section>

        {/* Still Need Help */}
        <section 
          className="mt-12 p-8 rounded-xl text-center"
          style={{ backgroundColor: '#F0F4F0' }}
        >
          <h2 
            className="text-2xl mb-2"
            style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
          >
            Still have questions?
          </h2>
          <p 
            className="mb-6"
            style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', lineHeight: 1.6 }}
          >
            Can't find what you're looking for? Our team is here to help.
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-3 rounded-full transition-all hover:scale-105"
            style={{
              backgroundColor: '#7A9070',
              color: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(122, 144, 112, 0.3)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
            }}
          >
            Contact Us
          </Link>
        </section>
        </div>
      </main>

      {/* Custom Styles for Details/Summary */}
      <style>{`
        details[open] {
          border-color: #F4A6B2 !important;
        }
        
        details summary::-webkit-details-marker {
          display: none;
        }
      `}</style>

      {/* Footer */}
      <Footer />
    </div>
  );
}