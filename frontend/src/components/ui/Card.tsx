import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function Card({ title, description, children, className = '', ...props }: CardProps) {
  const cardClassName = ['bg-white rounded-lg shadow-sm border border-gray-200', className].join(' ');
  
  return (
    <div className={cardClassName} {...props}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
