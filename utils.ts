/**
 * @fileoverview Core utility functions for component styling and performance
 * @description Contains functions used across the UI component system
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges multiple class names using clsx and tailwind-merge
 * Used by all UI components for consistent class name handling
 * 
 * @param inputs - Array of class values to be merged
 * @returns Merged class string with Tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TRANSITIONS = {
  DEFAULT: "transition-all duration-200 ease-in-out",
  FAST: "transition-all duration-150 ease-in-out",
  SLOW: "transition-all duration-300 ease-in-out",
} as const

export const ANIMATIONS = {
  FADE_IN: "animate-in fade-in-0",
  FADE_OUT: "animate-out fade-out-0",
  SLIDE_IN: "animate-in slide-in-from-bottom-2",
  SLIDE_OUT: "animate-out slide-out-to-bottom-2",
} as const

/**
 * Throttle function for performance optimization
 * Used to limit the rate at which a function can be called
 * 
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  let lastRan: number = 0;
  
  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};