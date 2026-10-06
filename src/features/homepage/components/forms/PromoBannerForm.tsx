
import React, { useState } from 'react';
import { PromoBannerContent } from '../../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MediaSelectorModal } from '@/features/media/components/MediaSelectorModal';
import { MediaPreview } from '@/features/media/components/MediaPreview';


interface Props {
  content: PromoBannerContent;
  onChange: (content: PromoBannerContent) => void;
}

export function PromoBannerForm({ content, onChange }: Props) {
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Heading *</label>
        <Input 
          value={content.heading || ''} 
          onChange={(e) => onChange({ ...content, heading: e.target.value })} 
          placeholder="Promo Heading" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <Input 
          value={content.description || ''} 
          onChange={(e) => onChange({ ...content, description: e.target.value || null })} 
          placeholder="Promo Description" 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CTA Label</label>
          <Input 
            value={content.ctaLabel || ''} 
            onChange={(e) => onChange({ ...content, ctaLabel: e.target.value || null })} 
            placeholder="e.g. Shop Now" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CTA URL</label>
          <Input 
            value={content.ctaUrl || ''} 
            onChange={(e) => onChange({ ...content, ctaUrl: e.target.value || null })} 
            placeholder="e.g. /products" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image *</label>
        <div className="flex items-center gap-4">
          <div className="h-20 w-32 bg-gray-100 border border-gray-200 rounded flex items-center justify-center overflow-hidden">
             <MediaPreview mediaId={content.mediaId} />
          </div>
          <Button type="button" variant="outline" onClick={() => setIsMediaOpen(true)}>
            {content.mediaId ? 'Change Image' : 'Select Image'}
          </Button>
        </div>
        {!content.mediaId && <p className="text-sm text-red-500 mt-1">Image is required.</p>}
      </div>

      {isMediaOpen && (
        <MediaSelectorModal
          isOpen={isMediaOpen}
          onClose={() => setIsMediaOpen(false)}
          onSelect={(media) => {
            onChange({ ...content, mediaId: media.id });
            setIsMediaOpen(false);
          }}
        />
      )}
    </div>
  );
}
