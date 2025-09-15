import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import Link from 'next/link';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Buyer Lead Intake',
  description: 'Manage buyer leads efficiently',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('demo-user');
  const isAuthenticated = !!userCookie?.value;

  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50">
            {isAuthenticated && (
              <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-8">
                      <Link href="/buyers" className="text-xl font-bold text-gray-900">
                        Buyer Leads
                      </Link>
                      <div className="flex space-x-4">
                        <Link
                          href="/buyers"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          All Leads
                        </Link>
                        <Link
                          href="/buyers/new"
                          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                        >
                          New Lead
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <form action="/api/auth/demo" method="POST">
                        <input type="hidden" name="action" value="logout" />
                        <button
                          type="submit"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Logout
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </nav>
            )}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
