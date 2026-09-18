import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
  primary: {
    backgroundColor: '#002C6C', // Hyundai Blue
    color: '#ffffff',
    border: 'none',
  },
  secondary: {
    backgroundColor: '#E4F0FF',
    color: '#002C6C',
    border: 'none',
  },
  outline: {
    backgroundColor: 'transparent',
    color: '#002C6C',
    border: '1.5px solid #002C6C',
  },
  danger: {
    backgroundColor: '#DC2626',
    color: '#ffffff',
    border: 'none',
  },
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: '13px' },
  md: { padding: '10px 18px', fontSize: '15px' },
  lg: { padding: '14px 24px', fontSize: '17px' },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', style, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        style={{
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease-in-out',
          ...sizeStyles[size],
          ...variantStyles[variant],
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
