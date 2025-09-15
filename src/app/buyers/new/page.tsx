import { BuyerForm } from '@/components/BuyerForm';
import { requireAuth } from '@/lib/auth';

export default async function NewBuyerPage() {
  await requireAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Lead</h1>
        <p className="text-gray-600">Add a new buyer lead to the system</p>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <BuyerForm mode="create" />
      </div>
    </div>
  );
}
