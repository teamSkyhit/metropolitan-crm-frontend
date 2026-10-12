'use client';

import React from 'react';
import {
  Settings,
  Shield,
  Box,
  Factory,
  Maximize2,
  Sliders,
  Gauge,
  Zap,
  Wrench,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Activity,
  Cpu,
  Flame,
  Award,
  Truck,
  RotateCw,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  gear: Settings,
  settings: Settings,
  shield: Shield,
  safety: ShieldCheck,
  cube: Box,
  factory: Factory,
  maximize: Maximize2,
  performance: Sliders,
  speed: Gauge,
  power: Zap,
  zap: Zap,
  tools: Wrench,
  temperature: Thermometer,
  check: CheckCircle2,
  layers: Layers,
  activity: Activity,
  cpu: Cpu,
  flame: Flame,
  award: Award,
  truck: Truck,
  rotate: RotateCw,
};

export const AVAILABLE_ICON_KEYS = Object.keys(ICON_MAP);

interface ProductContentIconProps {
  icon?: string | null;
  className?: string;
  size?: number;
}

export function ProductContentIcon({
  icon,
  className = 'w-5 h-5 text-[#0b2e59]',
  size = 20,
}: ProductContentIconProps) {
  if (!icon || typeof icon !== 'string') {
    return <HelpCircle className={className} size={size} aria-hidden="true" />;
  }

  const trimmed = icon.trim();

  // If icon is an HTTPS URL, render as safe image tag
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('/')) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={trimmed}
        alt="icon"
        className={`object-contain inline-block ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  // Look up in mapped keys (case-insensitive)
  const normalizedKey = trimmed.toLowerCase();
  const IconComponent = ICON_MAP[normalizedKey];

  if (IconComponent) {
    return <IconComponent className={className} size={size} aria-hidden="true" />;
  }

  // Fallback icon for unknown keys
  return (
    <span title={`Icon: ${trimmed}`} className="inline-flex items-center justify-center">
      <HelpCircle className={className} size={size} aria-hidden="true" />
    </span>
  );
}
