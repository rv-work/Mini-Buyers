import { Suspense } from 'react';
import { SearchFilters } from '@/components/SearchFilters';
import { BuyerList } from '@/components/BuyerList';
import { ImportExport } from '@/components/ImportExport';
import { searchFiltersSchema } from '@/lib/validations';
import { requireAuth } from '@/lib/auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function BuyersContent({ searchParams }: { searchParams: any }) {
  const user = await requireAuth();

  const filters = searchFiltersSchema.parse({
    search: searchParams.search || undefined,
    city: searchParams.city || undefined,
    propertyType: searchParams.propertyType || undefined,
    status: searchParams.status || undefined,
    timeline: searchParams.timeline || undefined,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  });

  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value.toString());
  });


  console.log("para: ", params)

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/buyers?${params}`, {
    headers: {
      Cookie: `demo-user=${user.id}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch buyers');
  }

  const data = await response.json();

  return (
    <>
      <ImportExport />
      <SearchFilters />
      <BuyerList {...data} />
    </>
  );
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function BuyersPage({ searchParams }: { searchParams: any }) {
  const params = await searchParams;
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buyer Leads</h1>
        <p className="text-gray-600">Manage and track your buyer leads</p>
      </div>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />}>
        <BuyersContent searchParams={params} />
      </Suspense>
    </div>
  );
}

