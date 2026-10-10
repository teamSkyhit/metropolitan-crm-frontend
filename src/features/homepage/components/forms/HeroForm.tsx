import React, { useState } from 'react';
import { HeroContent, HeroSlide } from '../../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MediaSelectorModal } from '@/features/media/components/MediaSelectorModal';
import { MediaPreview } from '@/features/media/components/MediaPreview';
import { Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';

interface Props {
  content: HeroContent;
  onChange: (content: HeroContent) => void;
}

export function HeroForm({ content, onChange }: Props) {
  const slides = content.slides || [];

  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      heading: 'New Slide',
      mediaId: '',
      sortOrder: slides.length,
      isActive: true,
    };
    onChange({ ...content, slides: [...slides, newSlide] });
    setEditingSlideIndex(slides.length);
  };

  const handleUpdateSlide = (index: number, updated: HeroSlide) => {
    const newSlides = [...slides];
    newSlides[index] = updated;
    onChange({ ...content, slides: newSlides });
  };

  const handleRemoveSlide = (index: number) => {
    const newSlides = slides.filter((_, i) => i !== index);
    onChange({ ...content, slides: newSlides });
    if (editingSlideIndex === index) setEditingSlideIndex(null);
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    onChange({ ...content, slides: newSlides });
    if (editingSlideIndex === index) setEditingSlideIndex(targetIndex);
    else if (editingSlideIndex === targetIndex) setEditingSlideIndex(index);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-700">Hero Slides ({slides.length}/10)</h4>
        <Button
          type="button"
          onClick={handleAddSlide}
          disabled={slides.length >= 10}
          size="sm"
          className="bg-[var(--color-metro-navy)]"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Slide
        </Button>
      </div>

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveSlide(index, 'up')}
                    disabled={index === 0}
                    className="p-0.5 text-gray-400 hover:text-gray-900 disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSlide(index, 'down')}
                    disabled={index === slides.length - 1}
                    className="p-0.5 text-gray-400 hover:text-gray-900 disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded border border-gray-200 overflow-hidden bg-white flex-shrink-0 flex items-center justify-center">
                    <MediaPreview mediaId={slide.mediaId} />
                  </div>
                  <span className="font-medium text-gray-900">
                    Slide {index + 1}: {slide.heading}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSlideIndex(editingSlideIndex === index ? null : index)}
                >
                  {editingSlideIndex === index ? 'Done' : 'Edit'}
                </Button>
                <button
                  type="button"
                  onClick={() => handleRemoveSlide(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {editingSlideIndex === index && (
              <div className="p-4 bg-white border-t border-gray-200 space-y-4">
                <SlideEditor slide={slide} onChange={(s) => handleUpdateSlide(index, s)} />
              </div>
            )}
          </div>
        ))}
        {slides.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No slides added. Add a slide to display the Hero section.
          </p>
        )}
      </div>
    </div>
  );
}

function SlideEditor({ slide, onChange }: { slide: HeroSlide; onChange: (s: HeroSlide) => void }) {
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={slide.isActive}
          onChange={(e) => onChange({ ...slide, isActive: e.target.checked })}
          className="h-4 w-4 text-[var(--color-metro-navy)] border-gray-300 rounded"
        />
        <label className="text-sm font-medium text-gray-700">Slide Active</label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Heading *</label>
        <Input
          value={slide.heading}
          onChange={(e) => onChange({ ...slide, heading: e.target.value })}
          placeholder="Main slide text"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subheading</label>
        <Input
          value={slide.subheading || ''}
          onChange={(e) => onChange({ ...slide, subheading: e.target.value || null })}
          placeholder="Optional secondary text"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CTA Label</label>
          <Input
            value={slide.ctaLabel || ''}
            onChange={(e) => onChange({ ...slide, ctaLabel: e.target.value || null })}
            placeholder="e.g. Shop Now"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CTA URL</label>
          <Input
            value={slide.ctaUrl || ''}
            onChange={(e) => onChange({ ...slide, ctaUrl: e.target.value || null })}
            placeholder="e.g. /products"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slide Image *</label>
        <div className="flex items-center gap-4">
          <div className="h-20 w-32 bg-gray-100 border border-gray-200 rounded flex items-center justify-center overflow-hidden">
            <MediaPreview mediaId={slide.mediaId} />
          </div>
          <Button type="button" variant="outline" onClick={() => setIsMediaOpen(true)}>
            {slide.mediaId ? 'Change Image' : 'Select Image'}
          </Button>
        </div>
        {!slide.mediaId && <p className="text-sm text-red-500 mt-1">Image is required.</p>}
      </div>

      {isMediaOpen && (
        <MediaSelectorModal
          isOpen={isMediaOpen}
          onClose={() => setIsMediaOpen(false)}
          onSelect={(media) => {
            onChange({ ...slide, mediaId: media.id });
            setIsMediaOpen(false);
          }}
        />
      )}
    </div>
  );
}
