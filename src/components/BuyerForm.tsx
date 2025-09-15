'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { buyerSchema } from '@/lib/validations';
import { BuyerFormData, Buyer } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { City, PropertyType, BHK, Purpose, Timeline, Source, Status } from '@prisma/client';
import { getEnumDisplayValue } from '@/lib/utils';

interface BuyerFormProps {
  buyer?: Buyer;
  mode: 'create' | 'edit';
}

export function BuyerForm({ buyer, mode }: BuyerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const defaultDummyValues = {
    fullName: "RV",
    phone: "9876543210",
    email: "kripa@example.com",
    city: City.Chandigarh,
    propertyType: PropertyType.Apartment,
    bhk: BHK.Three,
    purpose: Purpose.Buy,
    budgetMin: 3000000,
    budgetMax: 5000000,
    timeline: Timeline.ThreeToSixMonths,
    source: Source.Referral,
    status: Status.New,
    notes: "This is a sample lead for testing purposes.",
    tags: ["VIP", "Interested"],
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: buyer
      ? {
        ...buyer,
        email: buyer.email || '',
        notes: buyer.notes || '',
        budgetMin: buyer.budgetMin || undefined,
        budgetMax: buyer.budgetMax || undefined,
        bhk: buyer.bhk || undefined,
      }
      : defaultDummyValues,
  });

  const watchedPropertyType = watch('propertyType');
  const watchedTags = watch('tags') || [];

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: BuyerFormData) => {
    setLoading(true);
    setError(null);
    try {
      const url = mode === 'create' ? '/api/buyers' : `/api/buyers/${buyer!.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const body = mode === 'edit'
        ? { ...data, updatedAt: buyer!.updatedAt.toISOString() }
        : data;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          throw new Error('Record has been updated by another user. Please refresh and try again.');
        }
        throw new Error(errorData.error || 'Failed to save buyer');
      }

      router.push('/buyers');
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <Input
            id="fullName"
            {...register('fullName')}
            error={errors.fullName?.message}
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone *
          </label>
          <Input
            id="phone"
            {...register('phone')}
            error={errors.phone?.message}
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <select
            id="city"
            {...register('city')}
            className={`w-full px-3 text-black py-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select city</option>
            {Object.values(City).map(city => (
              <option key={city} value={city}>
                {getEnumDisplayValue(city)}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
            Property Type *
          </label>
          <select
            id="propertyType"
            {...register('propertyType')}
            className={`w-full text-black px-3 py-2 border rounded-md ${errors.propertyType ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select property type</option>
            {Object.values(PropertyType).map(type => (
              <option key={type} value={type}>
                {getEnumDisplayValue(type)}
              </option>
            ))}
          </select>
          {errors.propertyType && (
            <p className="mt-1 text-sm text-red-600">{errors.propertyType.message}</p>
          )}
        </div>

        {(['Apartment', 'Villa'].includes(watchedPropertyType as string)) && (
          <div>
            <label htmlFor="bhk" className="block text-sm font-medium text-gray-700 mb-2">
              BHK *
            </label>
            <select
              id="bhk"
              {...register('bhk')}
              className={`w-full text-black px-3 py-2 border rounded-md ${errors.bhk ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select BHK</option>
              {Object.values(BHK).map(bhk => (
                <option key={bhk} value={bhk}>
                  {bhk === BHK.Studio ? 'Studio' : `${bhk} BHK`}
                </option>
              ))}
            </select>
            {errors.bhk && (
              <p className="mt-1 text-sm text-red-600">{errors.bhk.message}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
            Purpose *
          </label>
          <select
            id="purpose"
            {...register('purpose')}
            className={`w-full px-3 text-black py-2 border rounded-md ${errors.purpose ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select purpose</option>
            {Object.values(Purpose).map(purpose => (
              <option key={purpose} value={purpose}>
                {getEnumDisplayValue(purpose)}
              </option>
            ))}
          </select>
          {errors.purpose && (
            <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="budgetMin" className="block text-sm font-medium text-gray-700 mb-2">
            Budget Min (INR)
          </label>
          <Input
            id="budgetMin"
            type="number"
            {...register('budgetMin', { valueAsNumber: true })}
            error={errors.budgetMin?.message}
            placeholder="Minimum budget"
          />
        </div>

        <div>
          <label htmlFor="budgetMax" className="block text-sm font-medium text-gray-700 mb-2">
            Budget Max (INR)
          </label>
          <Input
            id="budgetMax"
            type="number"
            {...register('budgetMax', { valueAsNumber: true })}
            error={errors.budgetMax?.message}
            placeholder="Maximum budget"
          />
        </div>

        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
            Timeline *
          </label>
          <select
            id="timeline"
            {...register('timeline')}
            className={`w-full px-3 text-black py-2 border rounded-md ${errors.timeline ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select timeline</option>
            {Object.values(Timeline).map(timeline => (
              <option key={timeline} value={timeline}>
                {getEnumDisplayValue(timeline)}
              </option>
            ))}
          </select>
          {errors.timeline && (
            <p className="mt-1 text-sm text-red-600">{errors.timeline.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
            Source *
          </label>
          <select
            id="source"
            {...register('source')}
            className={`w-full px-3 text-black py-2 border rounded-md ${errors.source ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select source</option>
            {Object.values(Source).map(source => (
              <option key={source} value={source}>
                {getEnumDisplayValue(source)}
              </option>
            ))}
          </select>
          {errors.source && (
            <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>
          )}
        </div>

        {mode === 'edit' && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              id="status"
              {...register('status')}
              className={`w-full px-3 py-2 border rounded-md ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select status</option>
              {Object.values(Status).map(status => (
                <option key={status} value={status}>
                  {getEnumDisplayValue(status)}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <Textarea
          id="notes"
          {...register('notes')}
          error={errors.notes?.message}
          placeholder="Additional notes..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" onClick={addTag} variant="secondary">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {watchedTags.map((tag, index) => (
            <Badge key={index} className="cursor-pointer" onClick={() => removeTag(tag)}>
              {tag} ×
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Create Lead' : 'Update Lead'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
