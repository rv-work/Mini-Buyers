'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { City, PropertyType, Status, Timeline } from '@prisma/client';
import { getEnumDisplayValue } from '@/lib/utils';

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [timeline, setTimeline] = useState(searchParams.get('timeline') || '');

  const updateFilters = useCallback(() => {
    const params = new URLSearchParams();

    if (search.trim()) params.set('search', search.trim());
    if (city) params.set('city', city);
    if (propertyType) params.set('propertyType', propertyType);
    if (status) params.set('status', status);
    if (timeline) params.set('timeline', timeline);

    params.set('page', '1');

    // Navigate to the new URL
    const queryString = params.toString();
    const newUrl = queryString ? `/buyers?${queryString}` : '/buyers';

    console.log('Updating filters:', { search, city, propertyType, status, timeline });
    console.log('New URL:', newUrl);

    router.push(newUrl);
  }, [search, city, propertyType, status, timeline, router]);

  useEffect(() => {
    if (searchParams.get('search') !== search) {
      const timer = setTimeout(() => {
        updateFilters();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [search, updateFilters, searchParams]);

  // Effect for other filters (immediate update)
  useEffect(() => {
    const currentCity = searchParams.get('city') || '';
    const currentPropertyType = searchParams.get('propertyType') || '';
    const currentStatus = searchParams.get('status') || '';
    const currentTimeline = searchParams.get('timeline') || '';

    if (
      currentCity !== city ||
      currentPropertyType !== propertyType ||
      currentStatus !== status ||
      currentTimeline !== timeline
    ) {
      updateFilters();
    }
  }, [city, propertyType, status, timeline, updateFilters, searchParams]);

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setPropertyType('');
    setStatus('');
    setTimeline('');
    router.push('buyers');
  };

  const handleSelectChange = (field: string, value: string) => {
    console.log('Select changed:', field, value);

    switch (field) {
      case 'city':
        setCity(value);
        break;
      case 'propertyType':
        setPropertyType(value);
        break;
      case 'status':
        setStatus(value);
        break;
      case 'timeline':
        setTimeline(value);
        break;
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Search changed:', value);
    setSearch(value);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <Input
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div>
          <Select
            value={city}
            onChange={(e) => handleSelectChange('city', e.target.value)}
            options={Object.values(City).map(c => ({
              value: c,
              label: getEnumDisplayValue(c),
            }))}
          >
            <option value="">All Cities</option>
          </Select>
        </div>

        <div>
          <Select
            value={propertyType}
            onChange={(e) => handleSelectChange('propertyType', e.target.value)}
            options={Object.values(PropertyType).map(p => ({
              value: p,
              label: getEnumDisplayValue(p),
            }))}
          >
            <option value="">All Properties</option>
          </Select>
        </div>

        <div>
          <Select
            value={status}
            onChange={(e) => handleSelectChange('status', e.target.value)}
            options={Object.values(Status).map(s => ({
              value: s,
              label: getEnumDisplayValue(s),
            }))}
          >
            <option value="">All Status</option>
          </Select>
        </div>

        <div>
          <Select
            value={timeline}
            onChange={(e) => handleSelectChange('timeline', e.target.value)}
            options={Object.values(Timeline).map(t => ({
              value: t,
              label: getEnumDisplayValue(t),
            }))}
          >
            <option value="">All Timelines</option>
          </Select>
        </div>
      </div>

      {(search || city || propertyType || status || timeline) && (
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={clearFilters} size="sm">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}