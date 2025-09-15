'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BuyerWithHistory } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatBudgetRange, getEnumDisplayValue } from '@/lib/utils';

interface BuyerDetailsProps {
  buyer: BuyerWithHistory;
}

export function BuyerDetails({ buyer }: BuyerDetailsProps) {
  const [showHistory, setShowHistory] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'default';
      case 'Qualified':
        return 'success';
      case 'Contacted':
        return 'warning';
      case 'Converted':
        return 'success';
      case 'Dropped':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{buyer.fullName}</h1>
          <div className="flex items-center space-x-3">
            <Badge variant={getStatusColor(buyer.status) as 'default' | 'success' | 'warning' | 'danger'}>
              {getEnumDisplayValue(buyer.status)}
            </Badge>
            <Link href={`/buyers/${buyer.id}?edit=true`}>

              <Button>Edit Lead</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Contact Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-900">Phone:</span>
                <p className="text-sm text-gray-600">{buyer.phone}</p>
              </div>
              {buyer.email && (
                <div>
                  <span className="text-sm font-medium text-gray-900">Email:</span>
                  <p className="text-sm text-gray-600">{buyer.email}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-900">Source:</span>
                <p className="text-sm text-gray-600">{getEnumDisplayValue(buyer.source)}</p>
              </div>
            </div>
          </div>

          {/* Property Requirements */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Property Requirements
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-900">Location:</span>
                <p className="text-sm text-gray-600">{getEnumDisplayValue(buyer.city)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">Property Type:</span>
                <p className="text-sm text-gray-600">{getEnumDisplayValue(buyer.propertyType)}</p>
              </div>
              {buyer.bhk && (
                <div>
                  <span className="text-sm font-medium text-gray-900">BHK:</span>
                  <p className="text-sm text-gray-600">
                    {buyer.bhk === 'Studio' ? 'Studio' : `${buyer.bhk} BHK`}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-900">Purpose:</span>
                <p className="text-sm text-gray-600">{getEnumDisplayValue(buyer.purpose)}</p>
              </div>
            </div>
          </div>

          {/* Budget & Timeline */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Budget & Timeline
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-900">Budget:</span>
                <p className="text-sm text-gray-600">
                  {formatBudgetRange(buyer.budgetMin, buyer.budgetMax)}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">Timeline:</span>
                <p className="text-sm text-gray-600">{getEnumDisplayValue(buyer.timeline)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">Created:</span>
                <p className="text-sm text-gray-600">
                  {new Date(buyer.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">Last Updated:</span>
                <p className="text-sm text-gray-600">
                  {new Date(buyer.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {buyer.notes && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Notes
            </h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{buyer.notes}</p>
          </div>
        )}

        {/* Tags */}
        {buyer.tags.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {buyer.tags.map((tag, index) => (
                <Badge key={index} variant="default">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Change History</h2>
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </Button>
        </div>

        {showHistory && (
          <div className="space-y-4">
            {buyer.history.length === 0 ? (
              <p className="text-sm text-gray-500">No history available</p>
            ) : (
              buyer.history.map((entry) => (
                <div key={entry.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {entry.user.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.changedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-2 rounded">
                      {JSON.stringify(entry.diff, null, 2)}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
