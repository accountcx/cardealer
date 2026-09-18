import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function Card({ title, subtitle, children, style, ...props }: CardProps) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        ...style,
      }}
      {...props}
    >
      {title && (
        <h3
          style={{
            margin: '0 0 4px 0',
            fontSize: '18px',
            fontWeight: 700,
            color: '#111827',
          }}
        >
          {title}
        </h3>
      )}
      {subtitle && (
        <p
          style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            color: '#6B7280',
          }}
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
