import { useState } from 'react';
import { useUpdateProductSpecifications } from '../hooks/useProduct';
import { Product, ProductSpecification } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Ruler, Trash2 } from 'lucide-react';

export interface ProductSpecificationsEditorProps {
  product?: Product;
  value?: ProductSpecification[];
  onChange?: (specs: ProductSpecification[]) => void;
  disabled?: boolean;
}

export function ProductSpecificationsEditor({
  product,
  value,
  onChange,
  disabled = false,
}: ProductSpecificationsEditorProps) {
  const isControlled = typeof onChange === 'function';
  const productId = product?.id || '';
  const updateSpecs = useUpdateProductSpecifications(productId);

  const [uncontrolledSpecs, setUncontrolledSpecs] = useState<ProductSpecification[]>(
    product?.specifications || []
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const specs = isControlled ? value || [] : uncontrolledSpecs;

  const updateList = (next: ProductSpecification[]) => {
    if (isControlled) {
      onChange?.(next);
    } else {
      setUncontrolledSpecs(next);
    }
  };

  const handleAdd = () => {
    if (specs.length >= 100) {
      setErrorMsg('Maximum of 100 specifications allowed.');
      return;
    }
    updateList([...specs, { key: '', value: '', unit: '' }]);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleRemove = (index: number) => {
    const updated = [...specs];
    updated.splice(index, 1);
    updateList(updated);
    setErrorMsg(null);
  };

  const handleChange = (index: number, field: keyof ProductSpecification, val: string) => {
    const updated = [...specs];
    updated[index] = { ...updated[index], [field]: val };
    updateList(updated);
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

    if (isControlled) {
      updateList(cleanSpecs);
      setSuccessMsg('Specifications validated.');
      return;
    }

    if (!productId) return;

    updateSpecs.mutate(
      { specifications: cleanSpecs },
      {
        onError: (err: unknown) => {
          const apiError = err as {
            response?: { data?: { error?: { message?: string }; message?: string } };
          };
          setErrorMsg(
            apiError?.response?.data?.error?.message ||
              apiError?.response?.data?.message ||
              'Failed to save specifications.'
          );
        },
        onSuccess: () => {
          setErrorMsg(null);
          setSuccessMsg('Specifications saved successfully.');
          setTimeout(() => setSuccessMsg(null), 3000);
        },
      }
    );
  };

  const isSaving = updateSpecs.isPending || disabled;

  return (
    <section
      id="product-specifications"
      className="space-y-5 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_5px_22px_rgba(15,38,68,0.04)] sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef3f8] text-[var(--color-metro-navy)]">
            <Ruler className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17263b]">Technical specifications</h3>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Add measurable product data such as weight, power, ratio, speed, or dimensions.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={isSaving || specs.length >= 100}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Row
        </Button>
      </div>

      {successMsg && (
        <div
          className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700"
          role="status"
        >
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {errorMsg}
        </div>
      )}

      {specs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-[#dce3ec] bg-[#f8fafc] px-4 py-8 text-center">
          <p className="text-sm font-medium text-[#65758b]">No specifications added yet.</p>
          <p className="mt-1 text-xs text-gray-400">
            This section is optional, but useful for technical buyers.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {specs.map((spec, idx) => (
            <div
              key={idx}
              className="grid gap-3 rounded-xl border border-[#e5eaf1] bg-[#f8fafc] p-3 sm:grid-cols-[1fr_1fr_0.65fr_auto] sm:items-end"
            >
              <div className="flex-1 w-full space-y-1">
                <label htmlFor={`spec-key-${idx}`} className="text-xs font-semibold text-[#536277]">
                  Specification
                </label>
                <Input
                  id={`spec-key-${idx}`}
                  placeholder="e.g. Weight"
                  maxLength={100}
                  value={spec.key}
                  onChange={(e) => handleChange(idx, 'key', e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex-1 w-full space-y-1">
                <label
                  htmlFor={`spec-value-${idx}`}
                  className="text-xs font-semibold text-[#536277]"
                >
                  Value
                </label>
                <Input
                  id={`spec-value-${idx}`}
                  placeholder="e.g. 1.5"
                  maxLength={500}
                  value={spec.value}
                  onChange={(e) => handleChange(idx, 'value', e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex-1 w-full space-y-1">
                <label
                  htmlFor={`spec-unit-${idx}`}
                  className="text-xs font-semibold text-[#536277]"
                >
                  Unit <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <Input
                  id={`spec-unit-${idx}`}
                  placeholder="e.g. kg"
                  maxLength={50}
                  value={spec.unit || ''}
                  onChange={(e) => handleChange(idx, 'unit', e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="w-full border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 sm:w-10"
                onClick={() => handleRemove(idx)}
                disabled={isSaving}
                aria-label={`Remove specification row ${idx + 1}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {!isControlled && (
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {updateSpecs.isPending ? 'Saving...' : 'Save Specifications'}
          </Button>
        </div>
      )}
    </section>
  );
}
