import { useState } from 'react';
import { useUpdateProductSpecifications } from '../hooks/useProduct';
import { Product, ProductSpecification } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ProductSpecificationsEditor({ product }: { product: Product }) {
  const updateSpecs = useUpdateProductSpecifications(product.id);
  const [specs, setSpecs] = useState<ProductSpecification[]>(product.specifications || []);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [prevSpecs, setPrevSpecs] = useState(product.specifications);
  if (product.specifications !== prevSpecs) {
    setPrevSpecs(product.specifications);
    setSpecs(product.specifications || []);
  }

  const handleAdd = () => {
    if (specs.length >= 100) {
      setErrorMsg('Maximum of 100 specifications allowed.');
      return;
    }
    setSpecs([...specs, { key: '', value: '', unit: '' }]);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleRemove = (index: number) => {
    const newSpecs = [...specs];
    newSpecs.splice(index, 1);
    setSpecs(newSpecs);
    setErrorMsg(null);
  };

  const handleChange = (index: number, field: keyof ProductSpecification, value: string) => {
    const newSpecs = [...specs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setSpecs(newSpecs);
    setErrorMsg(null);
  };

  const handleSave = () => {
    setErrorMsg(null);

    // Filter out completely empty rows
    const cleanSpecs = specs.filter((s) => s.key.trim() || s.value.trim());

    // Validate
    const keys = new Set<string>();
    for (const spec of cleanSpecs) {
      if (!spec.key.trim() || !spec.value.trim()) {
        setErrorMsg('Both Key and Value are required for all specifications.');
        return;
      }
      const lowerKey = spec.key.trim().toLowerCase();
      if (keys.has(lowerKey)) {
        setErrorMsg(
          `Duplicate specification key found: "${spec.key.trim()}". Keys must be unique.`
        );
        return;
      }
      keys.add(lowerKey);
    }

    updateSpecs.mutate(
      { specifications: cleanSpecs },
      {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        onError: (err: any) =>
          setErrorMsg(err?.response?.data?.message || 'Failed to save specifications.'),
        onSuccess: () => {
          setErrorMsg(null);
          setSuccessMsg('Specifications saved successfully.');
          setTimeout(() => setSuccessMsg(null), 3000);
        },
      }
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Specifications</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={updateSpecs.isPending || specs.length >= 100}
        >
          Add Row
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
          {errorMsg}
        </div>
      )}

      {specs.length === 0 ? (
        <p className="text-sm text-gray-500 italic py-4">No specifications added yet.</p>
      ) : (
        <div className="space-y-3">
          {specs.map((spec, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 w-full space-y-1">
                <label className="sr-only">Key</label>
                <Input
                  placeholder="Key (e.g. Weight)"
                  maxLength={100}
                  value={spec.key}
                  onChange={(e) => handleChange(idx, 'key', e.target.value)}
                  disabled={updateSpecs.isPending}
                />
              </div>
              <div className="flex-1 w-full space-y-1">
                <label className="sr-only">Value</label>
                <Input
                  placeholder="Value (e.g. 1.5)"
                  maxLength={500}
                  value={spec.value}
                  onChange={(e) => handleChange(idx, 'value', e.target.value)}
                  disabled={updateSpecs.isPending}
                />
              </div>
              <div className="flex-1 w-full space-y-1">
                <label className="sr-only">Unit (Optional)</label>
                <Input
                  placeholder="Unit (e.g. kg)"
                  maxLength={50}
                  value={spec.unit || ''}
                  onChange={(e) => handleChange(idx, 'unit', e.target.value)}
                  disabled={updateSpecs.isPending}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="text-red-600 hover:text-red-700 border-gray-300 sm:w-auto w-full"
                onClick={() => handleRemove(idx)}
                disabled={updateSpecs.isPending}
                aria-label="Remove row"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 border-t border-gray-200 flex justify-end">
        <Button onClick={handleSave} disabled={updateSpecs.isPending}>
          {updateSpecs.isPending ? 'Saving...' : 'Save Specifications'}
        </Button>
      </div>
    </div>
  );
}
