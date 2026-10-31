import { describe, it, expect, vi } from 'vitest';
import { generateEnquiriesCsv, downloadEnquiriesCsv } from './exportEnquiries';
import { EnquirySummary } from '../types';

const mockEnquiries: EnquirySummary[] = [
  {
    id: 'enq-101',
    name: 'Devaki Damodara',
    company: 'SkyHit Media',
    email: 'devaki@example.com',
    mobile: '07893698267',
    city: 'Hyderabad',
    status: 'CONTACTED',
    assignedTo: { id: 'usr-1', name: 'Devaki' },
    lineItemCount: 1,
    createdAt: '2026-10-30T10:00:00.000Z',
    updatedAt: '2026-10-30T11:00:00.000Z',
  },
  {
    id: 'enq-102',
    name: 'John, Doe "Jr."',
    company: null,
    email: 'john@example.com',
    mobile: '1234567890',
    city: null,
    status: 'NEW',
    assignedTo: null,
    lineItemCount: 2,
    createdAt: '2026-10-29T10:00:00.000Z',
    updatedAt: '2026-10-29T10:00:00.000Z',
  },
];

describe('generateEnquiriesCsv', () => {
  it('generates headers and correctly formatted rows', () => {
    const csv = generateEnquiriesCsv(mockEnquiries);
    const lines = csv.split('\r\n');

    expect(lines[0]).toBe(
      '"Enquiry ID","Customer Name","Company","Email","Mobile","City","Status","Assigned To","Items Count","Created At","Updated At"'
    );
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('"enq-101"');
    expect(lines[1]).toContain('"Devaki Damodara"');
    expect(lines[1]).toContain('"SkyHit Media"');
    expect(lines[1]).toContain('"CONTACTED"');
    expect(lines[1]).toContain('"Devaki"');
  });

  it('escapes commas and double quotes correctly per RFC 4180', () => {
    const csv = generateEnquiriesCsv(mockEnquiries);
    const lines = csv.split('\r\n');

    // "John, Doe ""Jr."""
    expect(lines[2]).toContain('"John, Doe ""Jr."""');
    expect(lines[2]).toContain('"-"'); // Company was null
    expect(lines[2]).toContain('"Unassigned"'); // AssignedTo was null
  });

  it('handles empty list gracefully', () => {
    const csv = generateEnquiriesCsv([]);
    const lines = csv.split('\r\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('"Enquiry ID"');
  });
});

describe('downloadEnquiriesCsv', () => {
  it('creates an anchor element and clicks it to download', () => {
    const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    downloadEnquiriesCsv(mockEnquiries, 'test_export.csv');

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');

    clickSpy.mockRestore();
  });
});
