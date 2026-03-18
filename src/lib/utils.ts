import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Cleans and normalizes string values: trims whitespace and converts to uppercase
 * or returns null for empty/falsy values
 */
export const cleanString = (val: string | null | undefined): string | null =>
  (val && val.trim() !== "") ? val.trim().toUpperCase() : null;

/**
 * Formats an ISO date string to YYYY-MM-DD format for HTML date inputs
 */
export const formatDateToInput = (dateStr: string | null): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return "";
  }
};

/**
 * Formats a date string to DD/MM/YYYY format for display in tables
 */
export const formatDateForDisplay = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
  } catch (e) {
    return "-";
  }
};

