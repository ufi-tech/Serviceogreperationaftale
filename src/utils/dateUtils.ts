/**
 * Utility functions for date handling
 */

/**
 * Converts ISO dates (YYYY-MM-DD) to Danish format (DD.MM.YYYY)
 * @param dateStr Date string in ISO format with hyphens (e.g., 2025-05-20)
 * @returns Formatted date string in Danish format
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'Ikke angivet';
  
  // Try to parse the date (JavaScript accepts YYYY-MM-DD as standard format)
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    // Date could not be parsed, so return it unchanged
    return dateStr;
  }
  
  // Format date with Danish format DD.MM.YYYY with periods as separators
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
};

/**
 * Calculates age in years from a date string
 * @param dateStr Date string in ISO format (YYYY-MM-DD)
 * @returns Age in years (floor value)
 */
export const calculateAgeInYears = (dateStr: string): number => {
  if (!dateStr) return 0;

  const date = new Date(dateStr);
  const now = new Date();

  const timeDiff = now.getTime() - date.getTime();
  const yearsDiff = timeDiff / (1000 * 3600 * 24 * 365.25);

  return Math.floor(yearsDiff);
};
