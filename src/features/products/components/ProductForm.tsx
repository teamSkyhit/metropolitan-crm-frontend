/* eslint-disable @next/next/no-img-element */
import { useState, useRef } from 'react';
import { CreateProductRequest } from '../types';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Heading, List, Bold, Italic, Eye, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductFormProps {
  initialData?: Partial<CreateProductRequest>;
  onSubmit: (data: Partial<CreateProductRequest>) => void;
  isPending: boolean;
  mode: 'create' | 'edit';
  readOnly?: boolean;
  imageFile?: File | null;
  onImageChange?: (file: File | null) => void;
}

export function ProductForm({
  initialData,
  onSubmit,
  isPending,
  mode,
  readOnly = false,
  onImageChange,
}: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CreateProductRequest>>({
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    brandId: initialData?.brandId || '',
    categoryId: initialData?.categoryId || '',
    description: initialData?.description || '',
    price: initialData?.price ?? null,
    priceVisibility: initialData?.priceVisibility ?? true,
    status: initialData?.status || 'DRAFT',
    hotDeal: initialData?.hotDeal ?? false,
  });

  const { data: brandsData, isLoading: isLoadingBrands } = useBrands({ limit: 100 });
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories({ limit: 100 });

  const brands = brandsData?.data || [];
  const categories = categoriesData?.data || [];

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5MB maximum size limit.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    onImageChange?.(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleClearImage = () => {
    onImageChange?.(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const insertFormat = (type: 'h2' | 'h3' | 'bullet' | 'bold' | 'italic') => {
    const textarea = textareaRef.current;
    const currentVal = formData.description || '';
    if (!textarea) {
      let snippet = '';
      if (type === 'h2') snippet = '\n\n## Heading\n';
      else if (type === 'h3') snippet = '\n\n### Subheading\n';
      else if (type === 'bullet') snippet = '\n- Bullet point\n- Bullet point\n';
      else if (type === 'bold') snippet = '**bold text**';
      else if (type === 'italic') snippet = '*italic text*';

      setFormData((prev) => ({ ...prev, description: currentVal + snippet }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = currentVal.substring(start, end);

    const before = currentVal.substring(0, start);
    const after = currentVal.substring(end);
    let inserted = '';

    if (type === 'h2') {
      inserted = selected ? `\n## ${selected}\n` : '\n## Heading\n';
    } else if (type === 'h3') {
      inserted = selected ? `\n### ${selected}\n` : '\n### Subheading\n';
    } else if (type === 'bullet') {
      if (selected) {
        inserted = selected
          .split('\n')
          .map((line) => (line.startsWith('- ') ? line : `- ${line}`))
          .join('\n');
      } else {
        inserted = '\n- Feature / specification point\n- Feature / specification point\n';
      }
    } else if (type === 'bold') {
      inserted = selected ? `**${selected}**` : '**bold text**';
    } else if (type === 'italic') {
      inserted = selected ? `*${selected}*` : '*italic text*';
    }

    const newVal = before + inserted + after;
    setFormData((prev) => ({ ...prev, description: newVal }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + inserted.length, start + inserted.length);
    }, 0);
  };

  const renderMarkdownPreview = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentBulletList: string[] = [];

    const flushBulletList = (keyPrefix: number) => {
      if (currentBulletList.length > 0) {
        elements.push(
          <ul
            key={`ul-${keyPrefix}`}
            className="list-disc list-inside space-y-1 my-2 text-gray-700"
          >
            {currentBulletList.map((item, idx) => (
              <li key={`li-${keyPrefix}-${idx}`} className="leading-relaxed">
                {parseInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
        currentBulletList = [];
      }
    };

    const parseInlineFormatting = (content: string): React.ReactNode => {
      // Parse bold **text** and italic *text*
      const parts = content.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-gray-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <em key={i} className="italic">
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      });
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        currentBulletList.push(trimmed.slice(2).trim());
      } else {
        flushBulletList(index);

        if (trimmed.startsWith('### ')) {
          elements.push(
            <h4 key={`h3-${index}`} className="text-sm font-bold text-gray-900 mt-3 mb-1">
              {parseInlineFormatting(trimmed.slice(4))}
            </h4>
          );
        } else if (trimmed.startsWith('## ')) {
          elements.push(
            <h3
              key={`h2-${index}`}
              className="text-base font-bold text-[var(--color-metro-navy)] mt-4 mb-1.5 pb-1 border-b border-gray-100"
            >
              {parseInlineFormatting(trimmed.slice(3))}
            </h3>
          );
        } else if (trimmed.startsWith('# ')) {
          elements.push(
            <h2
              key={`h1-${index}`}
              className="text-lg font-bold text-[var(--color-metro-navy)] mt-4 mb-2 pb-1 border-b border-gray-200"
            >
              {parseInlineFormatting(trimmed.slice(2))}
            </h2>
          );
        } else if (trimmed === '') {
          // Empty line space
          elements.push(<div key={`empty-${index}`} className="h-2" />);
        } else {
          elements.push(
            <p key={`p-${index}`} className="text-sm text-gray-700 leading-relaxed my-1">
              {parseInlineFormatting(line)}
            </p>
          );
        }
      }
    });

    flushBulletList(lines.length);
    return elements;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const { name, value, type } = target;
    if (type === 'checkbox') {
      const checked = (target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: target.value === '' ? null : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    const payload = { ...formData };
    if (payload.price === null || payload.price === undefined || String(payload.price) === '') {
      payload.price = null;
    }

    // Trim SKU and name
    if (payload.sku) payload.sku = payload.sku.trim();
    if (payload.name) payload.name = payload.name.trim();

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name *
          </label>
          <Input
            id="name"
            name="name"
            required
            maxLength={200}
            value={formData.name || ''}
            onChange={handleChange}
            disabled={isPending || readOnly}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
            SKU *
          </label>
          <Input
            id="sku"
            name="sku"
            required
            maxLength={100}
            pattern="^[a-zA-Z0-9][a-zA-Z0-9._/-]*$"
            title="Alphanumeric, can contain . _ / -"
            value={formData.sku || ''}
            onChange={handleChange}
            disabled={isPending || readOnly}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="brandId" className="block text-sm font-medium text-gray-700">
            Brand *
          </label>
          <select
            id="brandId"
            name="brandId"
            required
            value={formData.brandId || ''}
            onChange={handleChange}
            disabled={isPending || readOnly || isLoadingBrands}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
          >
            <option value="">Select Brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            value={formData.categoryId || ''}
            onChange={handleChange}
            disabled={isPending || readOnly || isLoadingCategories}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price (Optional)
          </label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price ?? ''}
            onChange={handleChange}
            disabled={isPending || readOnly}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status || 'DRAFT'}
            onChange={handleChange}
            disabled={isPending || readOnly}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="flex items-center gap-1 border border-gray-200 rounded-md p-0.5 bg-gray-50 text-xs">
            <button
              type="button"
              onClick={() => setIsPreviewMode(false)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                !isPreviewMode
                  ? 'bg-white text-gray-900 font-medium shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Write
            </button>
            <button
              type="button"
              onClick={() => setIsPreviewMode(true)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                isPreviewMode
                  ? 'bg-white text-gray-900 font-medium shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        {!isPreviewMode && !readOnly && (
          <div className="flex items-center gap-1 p-1.5 bg-gray-50 border border-b-0 border-gray-300 rounded-t-md text-gray-600 text-xs flex-wrap">
            <button
              type="button"
              onClick={() => insertFormat('h2')}
              title="Heading 2 (## Heading)"
              className="p-1.5 hover:bg-white hover:text-gray-900 rounded border border-transparent hover:border-gray-200 flex items-center gap-1 transition-colors"
            >
              <Heading className="w-3.5 h-3.5" />
              <span className="font-semibold">H2</span>
            </button>
            <button
              type="button"
              onClick={() => insertFormat('h3')}
              title="Heading 3 (### Subheading)"
              className="p-1.5 hover:bg-white hover:text-gray-900 rounded border border-transparent hover:border-gray-200 flex items-center gap-1 transition-colors"
            >
              <Heading className="w-3.5 h-3.5" />
              <span className="font-semibold text-[10px]">H3</span>
            </button>
            <div className="h-4 w-px bg-gray-300 mx-1" />
            <button
              type="button"
              onClick={() => insertFormat('bold')}
              title="Bold (**text**)"
              className="p-1.5 hover:bg-white hover:text-gray-900 rounded border border-transparent hover:border-gray-200 transition-colors"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat('italic')}
              title="Italic (*text*)"
              className="p-1.5 hover:bg-white hover:text-gray-900 rounded border border-transparent hover:border-gray-200 transition-colors"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-gray-300 mx-1" />
            <button
              type="button"
              onClick={() => insertFormat('bullet')}
              title="Bullet List (- item)"
              className="p-1.5 hover:bg-white hover:text-gray-900 rounded border border-transparent hover:border-gray-200 flex items-center gap-1 transition-colors"
            >
              <List className="w-3.5 h-3.5" />
              <span>Bullet List</span>
            </button>
            <span className="text-[11px] text-gray-400 ml-auto hidden sm:inline">
              Supports Headings, Bullets & Markdown
            </span>
          </div>
        )}

        {isPreviewMode ? (
          <div className="min-h-[140px] max-h-[300px] overflow-y-auto p-4 rounded-md border border-gray-300 bg-white prose prose-sm max-w-none text-gray-800 text-sm">
            {formData.description ? (
              <div className="space-y-1">{renderMarkdownPreview(formData.description)}</div>
            ) : (
              <span className="text-gray-400 italic">No description content to preview.</span>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            id="description"
            name="description"
            rows={6}
            maxLength={50000}
            value={formData.description || ''}
            onChange={handleChange}
            disabled={isPending || readOnly}
            placeholder={`Add structured product overview:\n\n## Overview\nHigh-performance industrial product suitable for heavy duty operations.\n\n## Key Features\n- Heavy duty construction\n- High efficiency output\n- Easy maintenance`}
            className={`block w-full shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-3 border border-gray-300 ${
              !readOnly ? 'rounded-b-md' : 'rounded-md'
            }`}
          />
        )}
      </div>

      {mode === 'create' && (
        <div className="space-y-2 p-4 bg-gray-50/70 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700">
            Product Image (Optional)
          </label>
          <p className="text-xs text-gray-500">
            Select a primary image to upload automatically when creating this product. Max 5MB (PNG,
            JPEG, WebP).
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            disabled={isPending || readOnly}
          />

          <div className="flex items-center gap-4 pt-2">
            {previewUrl ? (
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Product preview"
                  className="w-24 h-24 object-cover rounded-md border border-gray-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  disabled={isPending || readOnly}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow focus:outline-none"
                  title="Remove selected image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-md bg-white border border-dashed border-gray-300 flex flex-col items-center justify-center text-xs text-gray-400">
                <Upload className="w-5 h-5 mb-1 text-gray-400" />
                <span>No file</span>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending || readOnly}
              className="flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>{previewUrl ? 'Change Image' : 'Select Image'}</span>
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-6 items-center">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="priceVisibility"
            checked={formData.priceVisibility}
            onChange={handleChange}
            disabled={isPending || readOnly}
            className="rounded border-gray-300 text-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)]"
          />
          Price Visible
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="hotDeal"
            checked={formData.hotDeal}
            onChange={handleChange}
            disabled={isPending || readOnly}
            className="rounded border-gray-300 text-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)]"
          />
          Hot Deal
        </label>
      </div>

      {!readOnly && (
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <Button
            type="submit"
            disabled={isPending || brands.length === 0 || categories.length === 0}
          >
            {isPending ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
          </Button>
        </div>
      )}
      {!readOnly &&
        ((brands.length === 0 && !isLoadingBrands) ||
          (categories.length === 0 && !isLoadingCategories)) && (
          <p className="text-red-600 text-sm text-right mt-2">
            You must have at least one Brand and Category in the system to create a product.
          </p>
        )}
    </form>
  );
}
