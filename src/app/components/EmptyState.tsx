import type { ReactNode } from 'react';
import { Link } from 'react-router';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionTo: string;
  ariaLabel: string;
};

export function EmptyState({ icon, title, description, actionLabel, actionTo, ariaLabel }: EmptyStateProps) {
  return (
    <section
      className="rounded-[2rem] border px-6 py-10 text-center lg:px-10 lg:py-20"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        boxShadow: '0 18px 50px rgba(122, 144, 112, 0.08)',
      }}
      aria-label={ariaLabel}
    >
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: '#F8EEF1', color: '#F4A6B2' }}>
        {icon}
      </div>
      <h2 className="mb-3 text-3xl" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>
        {title}
      </h2>
      <p className="mx-auto mb-8 max-w-xl text-base" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', lineHeight: 1.8 }}>
        {description}
      </p>
      <Link
        to={actionTo}
        className="mobile-full-button rounded-full px-8 py-4 text-base transition-all hover:scale-[1.02]"
        style={{
          backgroundColor: '#7A9070',
          color: '#FFFFFF',
          boxShadow: '0 8px 28px rgba(122, 144, 112, 0.28)',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
        }}
      >
        {actionLabel}
      </Link>
    </section>
  );
}