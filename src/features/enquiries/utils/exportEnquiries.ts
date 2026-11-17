import { EnquirySummary } from '../types';
import { formatDate } from '@/lib/utils/format';

/**
 * Escapes a single cell value for standard RFC 4180 CSV.
 */
function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates CSV content from a list of enquiries.
 */
export function generateEnquiriesCsv(enquiries: EnquirySummary[]): string {
  const headers = [
    'Enquiry ID',
    'Customer Name',
    'Company',
    'Email',
    'Mobile',
    'City',
    'Status',
    'Assigned To',
    'Items Count',
    'Created At',
    'Updated At',
  ];

  const rows = enquiries.map((enq) => [
    escapeCsvCell(enq.id),
    escapeCsvCell(enq.name),
    escapeCsvCell(enq.company || '-'),
    escapeCsvCell(enq.email),
    escapeCsvCell(enq.mobile),
    escapeCsvCell(enq.city || '-'),
    escapeCsvCell(enq.status.replace(/_/g, ' ')),
    escapeCsvCell(enq.assignedTo ? enq.assignedTo.name : 'Unassigned'),
    escapeCsvCell(enq.lineItemCount),
    escapeCsvCell(formatDate(enq.createdAt)),
    escapeCsvCell(formatDate(enq.updatedAt)),
  ]);

  const csvLines = [headers.map((h) => `"${h}"`).join(','), ...rows.map((row) => row.join(','))];

  return csvLines.join('\r\n');
}

/**
 * Triggers a browser file download of the enquiries CSV.
 * Uses UTF-8 BOM so Microsoft Excel automatically recognizes UTF-8 encoding.
 */
export function downloadEnquiriesCsv(enquiries: EnquirySummary[], filename: string): void {
  const csvContent = generateEnquiriesCsv(enquiries);
  // \uFEFF is the UTF-8 Byte Order Mark (BOM) ensuring correct rendering in Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
