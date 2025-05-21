import { parseCsv, convertToCsv, isValidNumber } from '../utils/CsvUtils';
import { WarrantyPricingRule } from './WarrantyService';

// Interface for CSV-formatet af garantiprisregler
export interface WarrantyPricingRuleCsv {
  package_id: string;
  description: string;
  price: string;
  car_age_months_from: string;
  car_age_months_to: string;
  mileage_km_from: string;
  mileage_km_to: string;
  engine_size_ccm_from: string;
  engine_size_ccm_to: string;
  vehicle_category: string;
  fuel_type: string;
}

// Interface for validationsfejl
export interface ValidationError {
  row: number;
  column: string;
  message: string;
  value: string;
}

/**
 * Service til at håndtere CSV import/eksport af garantiprisregler
 */
class WarrantyCsvService {
  /**
   * Parser CSV-indhold til WarrantyPricingRule objekter og validerer dataen
   * @param csvContent CSV-indhold som streng
   * @returns Et objekt med parsede regler og eventuelle valideringsfejl
   */
  parseAndValidateWarrantyRulesCsv(csvContent: string): { 
    rules: WarrantyPricingRule[], 
    errors: ValidationError[] 
  } {
    try {
      // Parse CSV til objekter
      const csvRules = parseCsv<WarrantyPricingRuleCsv>(csvContent);
      const errors: ValidationError[] = [];
      const rules: WarrantyPricingRule[] = [];
      
      // Valider hver række og konverter til WarrantyPricingRule
      csvRules.forEach((csvRule, index) => {
        const rowNumber = index + 2; // +2 fordi vi starter med række 1 for headers og indeks starter fra 0
        const rowErrors = this.validateCsvRule(csvRule, rowNumber);
        
        if (rowErrors.length === 0) {
          // Konverter til WarrantyPricingRule hvis ingen fejl
          rules.push(this.convertToWarrantyPricingRule(csvRule));
        } else {
          // Tilføj fejl til listen
          errors.push(...rowErrors);
        }
      });
      
      return { rules, errors };
    } catch (error) {
      console.error('Fejl under parsing af garanti-CSV:', error);
      return { 
        rules: [], 
        errors: [{ 
          row: 0, 
          column: 'general', 
          message: `Kunne ikke parse CSV-filen: ${(error as Error).message}`,
          value: '' 
        }] 
      };
    }
  }
  
  /**
   * Validerer en enkelt CSV-regel
   * @param rule CSV-regel der skal valideres
   * @param rowNumber Rækkenummer til fejlrapportering
   * @returns Array af valideringsfejl
   */
  private validateCsvRule(rule: WarrantyPricingRuleCsv, rowNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Tjek obligatoriske felter
    if (!rule.package_id || rule.package_id.trim() === '') {
      errors.push({
        row: rowNumber,
        column: 'package_id',
        message: 'Pakke-ID er påkrævet',
        value: rule.package_id
      });
    }
    
    // Tjek pris (påkrævet og skal være et tal)
    if (!rule.price || rule.price.trim() === '') {
      errors.push({
        row: rowNumber,
        column: 'price',
        message: 'Pris er påkrævet',
        value: rule.price
      });
    } else if (!isValidNumber(rule.price)) {
      errors.push({
        row: rowNumber,
        column: 'price',
        message: 'Pris skal være et tal',
        value: rule.price
      });
    }
    
    // Tjek numeriske felter
    const numericFields: (keyof WarrantyPricingRuleCsv)[] = [
      'car_age_months_from', 'car_age_months_to',
      'mileage_km_from', 'mileage_km_to',
      'engine_size_ccm_from', 'engine_size_ccm_to'
    ];
    
    numericFields.forEach(field => {
      const value = rule[field];
      if (value && value.trim() !== '' && !isValidNumber(value)) {
        errors.push({
          row: rowNumber,
          column: field,
          message: `${field} skal være et tal`,
          value
        });
      }
    });
    
    // Tjek logiske intervaller
    if (isValidNumber(rule.car_age_months_from) && isValidNumber(rule.car_age_months_to)) {
      const from = Number(rule.car_age_months_from);
      const to = Number(rule.car_age_months_to);
      if (from > to) {
        errors.push({
          row: rowNumber,
          column: 'car_age_months_from',
          message: 'Bil alder fra skal være mindre end eller lig med bil alder til',
          value: `${from} > ${to}`
        });
      }
    }
    
    if (isValidNumber(rule.mileage_km_from) && isValidNumber(rule.mileage_km_to)) {
      const from = Number(rule.mileage_km_from);
      const to = Number(rule.mileage_km_to);
      if (from > to) {
        errors.push({
          row: rowNumber,
          column: 'mileage_km_from',
          message: 'Kilometer fra skal være mindre end eller lig med kilometer til',
          value: `${from} > ${to}`
        });
      }
    }
    
    if (isValidNumber(rule.engine_size_ccm_from) && isValidNumber(rule.engine_size_ccm_to)) {
      const from = Number(rule.engine_size_ccm_from);
      const to = Number(rule.engine_size_ccm_to);
      if (from > to) {
        errors.push({
          row: rowNumber,
          column: 'engine_size_ccm_from',
          message: 'Motorstørrelse fra skal være mindre end eller lig med motorstørrelse til',
          value: `${from} > ${to}`
        });
      }
    }
    
    return errors;
  }
  
  /**
   * Konverterer en CSV-regel til et WarrantyPricingRule objekt
   * @param csvRule CSV-regel der skal konverteres
   * @returns WarrantyPricingRule objekt
   */
  private convertToWarrantyPricingRule(csvRule: WarrantyPricingRuleCsv): WarrantyPricingRule {
    return {
      id: '', // Genereres af backend/server
      packageId: csvRule.package_id,
      description: csvRule.description || undefined,
      price: Number(csvRule.price),
      carAgeMonthsFrom: csvRule.car_age_months_from ? Number(csvRule.car_age_months_from) : undefined,
      carAgeMonthsTo: csvRule.car_age_months_to ? Number(csvRule.car_age_months_to) : undefined,
      mileageKmFrom: csvRule.mileage_km_from ? Number(csvRule.mileage_km_from) : undefined,
      mileageKmTo: csvRule.mileage_km_to ? Number(csvRule.mileage_km_to) : undefined,
      engineSizeCcmFrom: csvRule.engine_size_ccm_from ? Number(csvRule.engine_size_ccm_from) : undefined,
      engineSizeCcmTo: csvRule.engine_size_ccm_to ? Number(csvRule.engine_size_ccm_to) : undefined,
      vehicleCategory: csvRule.vehicle_category || undefined,
      fuelType: csvRule.fuel_type || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Konverterer WarrantyPricingRule objekter til CSV-format
   * @param rules Array af WarrantyPricingRule objekter
   * @returns CSV indhold som streng
   */
  convertWarrantyRulesToCsv(rules: WarrantyPricingRule[]): string {
    // Konverter WarrantyPricingRule objekter til CSV-venligt format
    const csvRules: WarrantyPricingRuleCsv[] = rules.map(rule => ({
      package_id: rule.packageId,
      description: rule.description || '',
      price: String(rule.price),
      car_age_months_from: rule.carAgeMonthsFrom !== undefined ? String(rule.carAgeMonthsFrom) : '',
      car_age_months_to: rule.carAgeMonthsTo !== undefined ? String(rule.carAgeMonthsTo) : '',
      mileage_km_from: rule.mileageKmFrom !== undefined ? String(rule.mileageKmFrom) : '',
      mileage_km_to: rule.mileageKmTo !== undefined ? String(rule.mileageKmTo) : '',
      engine_size_ccm_from: rule.engineSizeCcmFrom !== undefined ? String(rule.engineSizeCcmFrom) : '',
      engine_size_ccm_to: rule.engineSizeCcmTo !== undefined ? String(rule.engineSizeCcmTo) : '',
      vehicle_category: rule.vehicleCategory || '',
      fuel_type: rule.fuelType || ''
    }));
    
    // Definer kolonnerækkefølgen
    const headers: (keyof WarrantyPricingRuleCsv)[] = [
      'package_id',
      'description',
      'price',
      'car_age_months_from',
      'car_age_months_to',
      'mileage_km_from',
      'mileage_km_to',
      'engine_size_ccm_from',
      'engine_size_ccm_to',
      'vehicle_category',
      'fuel_type'
    ];
    
    // Konverter til CSV-format
    return convertToCsv(csvRules, headers);
  }
  
  /**
   * Læser en CSV-fil og returnerer indholdet
   * @param file CSV-fil
   * @returns Promise med CSV-indhold som streng
   */
  readCsvFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = (e) => reject(new Error('Kunne ikke læse filen'));
      reader.readAsText(file);
    });
  }
}

// Eksporter en enkelt instans af servicen
export const warrantyCsvService = new WarrantyCsvService();

export default warrantyCsvService;
