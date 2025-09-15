/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Papa from 'papaparse';

interface ImportResult {
  row: number;
  data: any;
  errors?: string[];
  success: boolean;
}

interface ImportSummary {
  total: number;
  success: number;
  errors: number;
  inserted: number;
}

export function ImportExport() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      const response = await fetch(`/api/buyers/export?${params}`);

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buyers-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResults([]);
    setImportSummary(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          if (results.data.length > 200) {
            alert('Maximum 200 rows allowed');
            setImporting(false);
            return;
          }

          const response = await fetch('/api/buyers/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rows: results.data }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Import failed');
          }

          const result = await response.json();
          setImportResults(result.results);
          setImportSummary(result.summary);
        } catch (error) {
          console.error('Import error:', error);
          alert('Import failed. Please check your CSV format and try again.');
        } finally {
          setImporting(false);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Failed to parse CSV file. Please check the format.');
        setImporting(false);
      },
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Import/Export</h3>
          <p className="text-sm text-gray-600">
            Export current filtered data, import new leads from CSV, or download a template
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleExport} disabled={exporting} variant="outline">
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>

          <Button
            onClick={() => {
              window.location.href = '/api/buyers/template';
            }}
            variant="outline"
          >
            Download Template
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            style={{ display: 'none' }}
          />

          <Button onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? 'Importing...' : 'Import CSV'}
          </Button>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-700">
        <h4 className="font-medium mb-1">CSV Import Instructions:</h4>
        <ul className="list-disc ml-5 space-y-1">
          <li>Maximum <b>200 rows</b> allowed per upload.</li>
          <li>File must be in <b>.csv</b> format with headers included.</li>
          <li>
            Columns: <code>fullName, email, phone, city, propertyType, bhk, purpose, budgetMin, budgetMax, timeline, source, status, notes, tags</code>.
          </li>
          <li><b>Enums must match exactly</b> (case-sensitive):
            <ul className="ml-5 list-disc">
              <li><b>City:</b> Chandigarh, Mohali, Zirakpur, Panchkula, Other</li>
              <li><b>PropertyType:</b> Apartment, Villa, Plot, Office, Retail</li>
              <li><b>BHK:</b> Studio, 1, 2, 3, 4</li>
              <li><b>Purpose:</b> Buy, Rent</li>
              <li><b>Timeline:</b> 0-3m, 3-6m, Exploring</li>
              <li><b>Source:</b> Website, Referral, Walk-in, Call, Other</li>
              <li><b>Status:</b> New, Qualified, Contacted, Visited, Negotiation, Converted, Dropped</li>
            </ul>
          </li>
          <li><b>tags</b> should be comma-separated (e.g., <code>hot,priority</code>).</li>
          <li>Missing optional fields can be left blank.</li>
        </ul>
      </div>

      {/* Import Summary */}
      {importSummary && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium text-gray-900 mb-2">Import Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="font-medium">Total:</span> {importSummary.total}</div>
            <div className="text-green-600"><span className="font-medium">Success:</span> {importSummary.success}</div>
            <div className="text-red-600"><span className="font-medium">Errors:</span> {importSummary.errors}</div>
            <div className="text-blue-600"><span className="font-medium">Inserted:</span> {importSummary.inserted}</div>
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResults.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-2">Import Results</h4>
          <div className="max-h-64 overflow-y-auto border rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Errors</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {importResults.map((result) => (
                  <tr key={result.row}>
                    <td className="px-4 py-2 text-sm text-gray-900">{result.row}</td>
                    <td className="px-4 py-2 text-sm">
                      {result.success ? (
                        <span className="text-green-600">Success</span>
                      ) : (
                        <span className="text-red-600">Error</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{result.data.fullName || '-'}</td>
                    <td className="px-4 py-2 text-sm text-red-600">{result.errors?.join(', ') || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
