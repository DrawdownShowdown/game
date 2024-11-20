import React from 'react';
import { cn } from "./utils";

export function formatNumber(value: number): string {
  if (value === 0) return "0.00";
  
  const absValue = Math.abs(value);
  if (absValue < 0.01) return "0.00";
  
  if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}m`;
  }
  
  if (absValue >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  
  return value.toFixed(2);
}

interface NumberDisplayProps {
  value: number;
  className?: string;
  showFullValueOnHover?: boolean;
  prefix?: string;
}

export const NumberDisplay = React.memo(({ 
  value, 
  className,
  showFullValueOnHover = true,
  prefix = ''
}: NumberDisplayProps) => {
  const formattedValue = formatNumber(value);
  
  if (!showFullValueOnHover) {
    return (
      <span className={cn("tabular-nums", className)}>
        {prefix}{formattedValue}
      </span>
    );
  }

  return (
    <span 
      className={cn("relative group cursor-help tabular-nums", className)}
      title={value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}
    >
      {prefix}{formattedValue}
    </span>
  );
});

NumberDisplay.displayName = 'NumberDisplay';

// Format values specifically for chart tooltips
export function formatTooltipValue(value: number): string {
  return `$${formatNumber(value)}`;
}

// For win/loss display with multipliers
export function formatChangeValue(change: number, multiplier?: number): string {
  const prefix = change > 0 ? '+' : '';
  const formatted = `${prefix}${formatNumber(Math.abs(change))}`;
  if (multiplier && change > 0) {
    return `${formatted} (${multiplier}x)`;
  }
  return formatted;
}