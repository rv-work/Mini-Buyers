import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default async function Home() {
  const cookieStore = cookies();
  const userCookie = (await cookieStore).get('demo-user');

  if (userCookie?.value) {
    redirect('/buyers');
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Buyer Lead Intake
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Demo application for managing buyer leads
          </p>
        </div>
        <form action="/api/auth/demo" method="POST" className="mt-8 space-y-6">
          <input type="hidden" name="action" value="login" />
          <Button type="submit" className="w-full">
            Continue as Demo User
          </Button>
        </form>
      </div>
    </div>
  );
}
