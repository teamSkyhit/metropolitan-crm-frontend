'use client';

import React, { useState, useRef } from 'react';
import { Heading, List, Bold, Italic, Eye, Edit3 } from 'lucide-react';

interface ProductDescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function ProductDescriptionEditor({
  value,
  onChange,
  disabled = false,
  readOnly = false,
}: ProductDescriptionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const insertFormat = (type: 'h2' | 'h3' | 'bullet' | 'bold' | 'italic') => {
    const textarea = textareaRef.current;
    const currentVal = value || '';
    if (!textarea) {
      let snippet = '';
      if (type === 'h2') snippet = '\n\n## Heading\n';
      else if (type === 'h3') snippet = '\n\n### Subheading\n';
      else if (type === 'bullet') snippet = '\n- Bullet point\n- Bullet point\n';
      else if (type === 'bold') snippet = '**bold text**';
      else if (type === 'italic') snippet = '*italic text*';

      onChange(currentVal + snippet);
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
    onChange(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + inserted.length, start + inserted.length);
    }, 0);
  };

  const parseInlineFormatting = (content: string): React.ReactNode => {
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

  const renderDescriptionPreview = (text: string) => {
    if (!text) {
      return (
        <p className="text-gray-400 italic text-sm">
          No description entered. Markdown preview will appear here.
        </p>
      );
    }

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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Product Description (Formatted Markdown)
        </label>
        <div className="flex items-center gap-1 border border-gray-200 rounded p-0.5 bg-gray-50">
          <button
            type="button"
            onClick={() => setIsPreviewMode(false)}
            className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
              !isPreviewMode
                ? 'bg-white shadow-xs text-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewMode(true)}
            className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
              isPreviewMode
                ? 'bg-white shadow-xs text-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>
      </div>

      {!isPreviewMode && !readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-50 border border-gray-200 rounded-t-md border-b-0 text-gray-600">
          <button
            type="button"
            onClick={() => insertFormat('h2')}
            className="p-1.5 hover:bg-gray-200 rounded text-xs flex items-center gap-1"
            title="Heading 2"
          >
            <Heading className="w-3.5 h-3.5" />
            <span className="font-bold">H2</span>
          </button>
          <button
            type="button"
            onClick={() => insertFormat('h3')}
            className="p-1.5 hover:bg-gray-200 rounded text-xs flex items-center gap-1"
            title="Heading 3"
          >
            <Heading className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">H3</span>
          </button>
          <div className="w-[1px] h-4 bg-gray-300 mx-1" />
          <button
            type="button"
            onClick={() => insertFormat('bold')}
            className="p-1.5 hover:bg-gray-200 rounded"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('italic')}
            className="p-1.5 hover:bg-gray-200 rounded"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('bullet')}
            className="p-1.5 hover:bg-gray-200 rounded flex items-center gap-1 text-xs"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
        </div>
      )}

      {isPreviewMode ? (
        <div className="w-full min-h-[160px] p-4 bg-gray-50 border border-gray-200 rounded-md">
          {renderDescriptionPreview(value || '')}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          id="description"
          name="description"
          rows={5}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || readOnly}
          placeholder="Detailed description with markdown formatting..."
          className={`w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-metro-navy)] focus:border-[var(--color-metro-navy)] ${
            !readOnly ? 'rounded-b-md' : 'rounded-md'
          }`}
        />
      )}
    </div>
  );
}
