import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {title && (
          <header className="bg-white border-b border-gray-200 px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </header>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
