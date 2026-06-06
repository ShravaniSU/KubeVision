import React from 'react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '24px',
        width: '100%',
      }}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-muted)',
          }}
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {crumb.href && !isLast ? (
                  <Link
                    to={crumb.href}
                    style={{
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span style={{ color: isLast ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <span>/</span>}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{subtitle}</p>
          )}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>{actions}</div>
        )}
      </div>
    </div>
  );
};
