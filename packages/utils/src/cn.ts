import { clsx, type ClassValue } from 'clsx';
import { extendedTwMerge } from './tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return extendedTwMerge(clsx(inputs));
}
