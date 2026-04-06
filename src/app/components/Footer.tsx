import { Link } from 'react-router';
import { BrandLogo } from './BrandLogo';
import { footerNavigationSections } from '../lib/navigation';

export function Footer() {
  return (
    <footer 
      className="mt-20 px-4 py-10 md:px-6 lg:px-12 lg:py-20" 
      style={{ 
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E7EB' 
      }}
    >
      <div className="store-shell">
        {/* Three-Column Navigation */}
        <nav 
          className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10"
          aria-label="Footer navigation"
        >
          {footerNavigationSections.map((section) => (
            <section key={section.title}>
              <h3 
                className="text-lg mb-4"
                style={{ 
                  fontFamily: 'Playfair Display, serif', 
                  color: '#4A5D45',
                  fontWeight: 600 
                }}
              >
                {section.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.to}-${link.label}`}>
                    <Link 
                      to={link.to}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                      className="text-sm transition-opacity hover:opacity-70"
                      style={{ 
                        fontFamily: 'Inter, sans-serif', 
                        color: '#7A9070',
                        fontWeight: 500
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        {/* Divider */}
        <div 
          className="border-t pt-8"
          style={{ borderColor: '#E5E7EB' }}
        >
          {/* Brand Tagline */}
          <div className="text-center mb-6">
            <BrandLogo className="mx-auto mb-4 inline-block" imageClassName="h-16 w-auto" />
            <p 
              className="text-sm"
              style={{ 
                fontFamily: 'Inter, sans-serif', 
                color: '#7A9070' 
              }}
            >
              Handcrafted ceramic mugs for cozy moments
            </p>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p 
              className="text-sm"
              style={{ 
                fontFamily: 'Inter, sans-serif', 
                color: '#7A9070' 
              }}
            >
              © 2026 Cozip. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
