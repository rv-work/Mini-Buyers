import { notFound } from 'next/navigation';
import { BuyerDetails } from '@/components/BuyerDetails';
import { BuyerForm } from '@/components/BuyerForm';
import { prisma } from '@/lib/prisma';

interface BuyerPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export default async function BuyerPage({ params, searchParams }: BuyerPageProps) {
  // Await both params and searchParams
  const { id } = await params;
  const { edit } = await searchParams;

  const isEditing = edit === 'true';

  const buyer = await prisma.buyer.findUnique({
    where: { id },
    include: {
      owner: true,
      history: {
        include: {
          user: true,
        },
        orderBy: {
          changedAt: 'desc',
        },
        take: 5,
      },
    },
  });

  if (!buyer) {
    notFound();
  }

  if (isEditing) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
          <p className="text-gray-600">Update buyer lead information</p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <BuyerForm buyer={buyer} mode="edit" />
        </div>
      </div>
    );
  }

  return <BuyerDetails buyer={buyer} />;
}
