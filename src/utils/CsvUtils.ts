/**
 * Utility klasse til at håndtere CSV filer
 * Bruges til at læse og validere forskellige CSV-formater
 */

/**
 * Funktion til at parse en CSV-streng til et array af objekter
 * @param csvString CSV-indhold som streng
 * @param delimiter Kolonne-adskiller (default er komma)
 * @returns Et array af objekter hvor nøgler er kolonnenavne
 */
export function parseCsv<T>(csvString: string, delimiter: string = ','): T[] {
  try {
    // Split CSV string into lines
    const lines = csvString.split(/\r\n|\n|\r/).filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      throw new Error('CSV-filen er tom');
    }
    
    // Parse header line to get column names
    const headers = lines[0].split(delimiter).map(header => header.trim());
    
    // Parse data lines
    const results: T[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length === 0) continue;
      
      // Split line into values
      const values = line.split(delimiter);
      
      // Map values to object properties
      const obj: any = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = values[j]?.trim() || '';
      }
      
      results.push(obj as T);
    }
    
    return results;
  } catch (error) {
    console.error('Fejl under parsing af CSV:', error);
    throw new Error(`Kunne ikke parse CSV-filen: ${(error as Error).message}`);
  }
}

/**
 * Konverterer et array af objekter til CSV-format
 * @param data Array af objekter der skal konverteres
 * @param headers Liste af kolonneoverskrifter (nøgler i objekterne)
 * @param delimiter Kolonne-adskiller (default er komma)
 * @returns CSV-streng
 */
export function convertToCsv<T extends Record<string, any>>(
  data: T[], 
  headers: (keyof T)[], 
  delimiter: string = ','
): string {
  try {
    // Create header row
    const headerRow = headers.join(delimiter);
    
    // Create data rows
    const rows = data.map(item => {
      return headers.map(header => {
        // Handle special cases (arrays, objects, undefined, null)
        const value = item[header];
        if (value === undefined || value === null) {
          return '';
        } else if (Array.isArray(value)) {
          return `"${value.join(';')}"`;
        } else if (typeof value === 'object') {
          return `"${JSON.stringify(value)}"`;
        } else {
          // Escape quotes and wrap in quotes if the value contains delimiter
          const strValue = String(value);
          return strValue.includes(delimiter) 
            ? `"${strValue.replace(/"/g, '""')}"`
            : strValue;
        }
      }).join(delimiter);
    });
    
    // Combine header and data rows
    return [headerRow, ...rows].join('\n');
  } catch (error) {
    console.error('Fejl under konvertering til CSV:', error);
    throw new Error(`Kunne ikke konvertere data til CSV: ${(error as Error).message}`);
  }
}

/**
 * Validerer om en streng kan konverteres til et tal
 * @param value Værdi der skal valideres
 * @returns true hvis værdien er et gyldigt tal
 */
export function isValidNumber(value: string): boolean {
  if (value === '' || value === undefined) return true; // Tomt er tilladt
  return !isNaN(Number(value)) && value.trim() !== '';
}

/**
 * Validerer om en streng kan konverteres til en boolean
 * @param value Værdi der skal valideres
 * @returns true hvis værdien er en gyldig boolean
 */
export function isValidBoolean(value: string): boolean {
  if (value === '' || value === undefined) return true; // Tomt er tilladt
  const lowerValue = value.toLowerCase().trim();
  return ['true', 'false', '1', '0', 'ja', 'nej', 'yes', 'no'].includes(lowerValue);
}

/**
 * Konverterer en streng til en boolean værdi
 * @param value Værdi der skal konverteres
 * @returns boolean værdi eller undefined hvis værdi er tom
 */
export function parseBoolean(value: string): boolean | undefined {
  if (value === '' || value === undefined) return undefined;
  const lowerValue = value.toLowerCase().trim();
  return ['true', '1', 'ja', 'yes'].includes(lowerValue);
}
