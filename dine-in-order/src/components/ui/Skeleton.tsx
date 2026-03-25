import type { CSSProperties } from 'react';

type SkeletonVariant = 'text' | 'card' | 'circle';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  className?: string;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full rounded-md',
  card: 'h-32 w-full rounded-2xl',
  circle: 'h-10 w-10 rounded-full',
};

function mergeClasses(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function toCssLength(value: number | string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === 'number' ? `${value}px` : value;
}

export function Skeleton({ variant = 'text', width, height, className }: SkeletonProps) {
  const style: CSSProperties = {
    width: toCssLength(width),
    height: toCssLength(height),
  };

  return (
    <div
      className={mergeClasses('animate-pulse bg-slate-200', variantStyles[variant], className)}
      style={style}
      aria-hidden="true"
    />
  );
}

export type { SkeletonProps, SkeletonVariant };
