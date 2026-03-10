import { Link } from 'react-router';
import { Heart, Leaf, Sparkles } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function About() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main>
        {/* Hero Image Section */}
        <section className="w-full">
          <img
            src="https://images.unsplash.com/photo-1753164725848-471a8abbb6f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwY2xheSUyMG1vbGRpbmclMjBoYW5kcyUyMGNlcmFtaWN8ZW58MXx8fHwxNzcyODM5OTc2fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Hands molding clay on a pottery wheel"
            className="w-full"
            style={{
              aspectRatio: '21 / 9',
              objectFit: 'cover',
            }}
          />
        </section>

        {/* Mission Section - Our Story */}
        <section className="store-section">
          <div className="store-shell-narrow text-center">
          <Breadcrumbs items={[{ label: 'About' }]} className="mb-6 text-left" />
          <h1 
            className="text-5xl mb-6"
            style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
          >
            Our Story
          </h1>
          <p 
            className="text-lg mb-6"
            style={{ 
              fontFamily: 'Inter, sans-serif', 
              color: '#7A9070', 
              lineHeight: 1.8,
            }}
          >
            Cozip was born from a simple belief: that the everyday rituals we cherish deserve beautiful, thoughtfully crafted objects. We started in a small studio, shaping clay into mugs that would hold more than just coffee—they'd hold moments of peace, creativity, and connection.
          </p>
          <p 
            className="text-lg"
            style={{ 
              fontFamily: 'Inter, sans-serif', 
              color: '#7A9070', 
              lineHeight: 1.8,
            }}
          >
            Today, each Cozip mug is still handmade with the same care and intention. We believe in slow craft, sustainable practices, and designs that bring a sense of calm to your daily routine. Every piece is designed to be cherished, not just used—a small luxury that makes life a little more beautiful.
          </p>
          </div>
        </section>

        {/* Core Values Section */}
        <section 
          className="store-section"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="store-shell">
            <header className="text-center mb-12">
              <h2 
                className="text-4xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                What We Stand For
              </h2>
              <p 
                className="text-lg max-w-2xl mx-auto"
                style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', lineHeight: 1.6 }}
              >
                Our core values guide everything we create
              </p>
            </header>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Handmade */}
              <article 
                className="p-8 rounded-2xl text-center"
                style={{
                  backgroundColor: '#FAF8F3',
                  border: '2px solid #E5E7EB',
                }}
              >
                <div 
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#F0F4F0' }}
                >
                  <Heart 
                    className="w-8 h-8" 
                    style={{ color: '#F4A6B2' }}
                    aria-hidden="true"
                  />
                </div>
                <h3 
                  className="text-2xl mb-4"
                  style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
                >
                  Handmade
                </h3>
                <p 
                  style={{ 
                    fontFamily: 'Inter, sans-serif', 
                    color: '#7A9070', 
                    lineHeight: 1.7,
                  }}
                >
                  Every mug is carefully crafted by skilled artisans, ensuring each piece is unique and made with love. No mass production—just thoughtful, human touch.
                </p>
              </article>

              {/* Sustainable */}
              <article 
                className="p-8 rounded-2xl text-center"
                style={{
                  backgroundColor: '#FAF8F3',
                  border: '2px solid #E5E7EB',
                }}
              >
                <div 
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#F0F4F0' }}
                >
                  <Leaf 
                    className="w-8 h-8" 
                    style={{ color: '#7A9070' }}
                    aria-hidden="true"
                  />
                </div>
                <h3 
                  className="text-2xl mb-4"
                  style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
                >
                  Sustainable
                </h3>
                <p 
                  style={{ 
                    fontFamily: 'Inter, sans-serif', 
                    color: '#7A9070', 
                    lineHeight: 1.7,
                  }}
                >
                  We source eco-friendly materials and use sustainable practices at every step. From clay to packaging, we're committed to minimizing our environmental footprint.
                </p>
              </article>

              {/* Aesthetic */}
              <article 
                className="p-8 rounded-2xl text-center"
                style={{
                  backgroundColor: '#FAF8F3',
                  border: '2px solid #E5E7EB',
                }}
              >
                <div 
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#F0F4F0' }}
                >
                  <Sparkles 
                    className="w-8 h-8" 
                    style={{ color: '#F4A6B2' }}
                    aria-hidden="true"
                  />
                </div>
                <h3 
                  className="text-2xl mb-4"
                  style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
                >
                  Aesthetic
                </h3>
                <p 
                  style={{ 
                    fontFamily: 'Inter, sans-serif', 
                    color: '#7A9070', 
                    lineHeight: 1.7,
                  }}
                >
                  Beautiful design isn't a luxury—it's essential. Our minimalist aesthetic brings calm and joy to everyday moments, making the ordinary extraordinary.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="store-section">
          <div className="store-shell-narrow text-center">
          <h2 
            className="text-4xl mb-6"
            style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
          >
            Join the Cozip Community
          </h2>
          <p 
            className="text-lg mb-8"
            style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', lineHeight: 1.7 }}
          >
            Discover mugs that transform your daily rituals into moments of mindfulness and beauty.
          </p>
          <Link
            to="/shop"
            className="inline-block px-10 py-4 rounded-full transition-all hover:scale-105"
            style={{
              backgroundColor: '#7A9070',
              color: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(122, 144, 112, 0.3)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '1.125rem',
            }}
          >
            Explore Our Collection
          </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}