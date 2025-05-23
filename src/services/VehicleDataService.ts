/**
 * VehicleDataService.ts
 * 
 * Service for fetching vehicle data from the Carrus API using license plate or VIN number.
 * The API provides detailed vehicle information for Danish vehicles.
 */

// Define interfaces for the API response structure
interface CarrusVehicleResponse {
  vehicles: Vehicle[];
  totalNumberOfVehicles: number;
  latestTimestampInResult: string;
  dataVersion: number;
}

interface Vehicle {
  vehicleId: string;
  transactions: Transaction[];
  vehicleDetails: VehicleDetails;
  inspections: Inspection[];
  vehicleTypeApproval?: any; // Type approval data, kan indeholde vigtige køretøjsoplysninger
}

interface Transaction {
  time: string;
  registrationNumber?: string;
  status: string;
  statusName: string;
  primaryOwner?: Owner;
  primaryUser?: User;
  leasingDetails?: LeasingDetails;
}

interface Owner {
  registrantType: string;
  postalCode?: string;
  postalDistrict?: string;
  company?: {
    name: string;
    cvr: string;
  };
  registrantClassification?: {
    code: string;
    name: string;
  };
}

interface User {
  registrantType: string;
  postalCode?: string;
  postalDistrict?: string;
  company?: {
    name: string;
    cvr: string;
  };
}

interface LeasingDetails {
  leasingType: string;
  leasingPeriodMonths?: number;
  leasingCompany?: {
    name: string;
    cvr: string;
  };
}

interface VehicleDetails {
  vehicleIdentificationNumber: string;
  registrationNumber?: string;
  firstRegistrationDate: string;
  make: string;
  model: string;
  variant?: string;
  modelYear: number;
  enginePowerKw?: number;
  enginePowerHp?: number;
  totalCylinderCapacityCm3?: number;
  fuel: string;
  massInRunningOrderKg?: number;
  bodywork?: string;
  colour?: string;
  numberOfSeatingPositions?: number;
  numberOfDoors?: number;
  nedcFuelConsumptionKmPerL?: number;
  nedcFuelConsumptionLPer100Km?: number;
  nedcCO2EmissionsGPerKm?: number;
  euroEmissionLevel?: string;
  hasParticulateFilter?: boolean;
  optionalEquipment?: string[];
  standardEquipment?: string[];
}

interface Inspection {
  time: string;
  typeName: string;
  resultName: string;
  odometerReading?: number;
  nextInspectionDate?: string;
}

// Error types
export enum VehicleDataErrorType {
  NOT_FOUND = 'NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class VehicleDataError extends Error {
  type: VehicleDataErrorType;

  constructor(message: string, type: VehicleDataErrorType) {
    super(message);
    this.type = type;
    this.name = 'VehicleDataError';
  }
}

/**
 * VehicleDataService for fetching and processing vehicle data from the Carrus API
 */
class VehicleDataService {
  private static instance: VehicleDataService;
  private readonly API_BASE_URL = 'https://bilstatistik.api.carruslink.dk/vehicle';
  private readonly API_KEY = 'ir5uSxUiWNYXGEen_gDoX3YNSNGfsWcLYgxCNmUc7HE';

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance of VehicleDataService
   */
  public static getInstance(): VehicleDataService {
    if (!VehicleDataService.instance) {
      VehicleDataService.instance = new VehicleDataService();
    }
    return VehicleDataService.instance;
  }

  /**
   * Fetch vehicle data by license plate
   * @param licensePlate Danish license plate (e.g., "AX15700")
   * @returns Promise with vehicle data
   * @throws VehicleDataError if vehicle not found or network error
   */
  public async getVehicleDataByLicensePlate(licensePlate: string): Promise<CarrusVehicleResponse> {
    try {
      const sanitizedLicensePlate = this.sanitizeInput(licensePlate);
      return await this.fetchVehicleData(sanitizedLicensePlate);
    } catch (error) {
      this.handleError(error, `License plate: ${licensePlate}`);
    }
  }

  /**
   * Fetch vehicle data by VIN number
   * @param vin Vehicle Identification Number (e.g., "VF17RRL0H50576482")
   * @returns Promise with vehicle data
   * @throws VehicleDataError if vehicle not found or network error
   */
  public async getVehicleDataByVin(vin: string): Promise<CarrusVehicleResponse> {
    try {
      const sanitizedVin = this.sanitizeInput(vin);
      return await this.fetchVehicleData(sanitizedVin);
    } catch (error) {
      this.handleError(error, `VIN: ${vin}`);
    }
  }

  /**
   * Sanitize input to prevent injection and remove unwanted characters
   */
  private sanitizeInput(input: string): string {
    // Remove spaces, dashes, and other special characters
    return input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  /**
   * Fetch vehicle data from the API
   */
  private async fetchVehicleData(identifier: string): Promise<CarrusVehicleResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${identifier}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new VehicleDataError(
            `Vehicle not found with identifier: ${identifier}`,
            VehicleDataErrorType.NOT_FOUND
          );
        }
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json() as CarrusVehicleResponse;
    } catch (error) {
      if (error instanceof VehicleDataError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new VehicleDataError(
          'Network error while fetching vehicle data. Please check your connection.',
          VehicleDataErrorType.NETWORK_ERROR
        );
      }
      
      throw new VehicleDataError(
        `Failed to fetch vehicle data: ${error instanceof Error ? error.message : String(error)}`,
        VehicleDataErrorType.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Handle and rethrow errors with appropriate type
   */
  private handleError(error: unknown, context: string): never {
    if (error instanceof VehicleDataError) {
      throw error;
    }
    
    throw new VehicleDataError(
      `Failed to get vehicle data (${context}): ${error instanceof Error ? error.message : String(error)}`,
      VehicleDataErrorType.UNKNOWN_ERROR
    );
  }

  /**
   * Extract basic vehicle information from the API response
   * @param response The full API response
   * @returns Object with basic vehicle information
   */
  public extractBasicVehicleInfo(response: CarrusVehicleResponse) {
    if (!response.vehicles || response.vehicles.length === 0) {
      return null;
    }

    const vehicle = response.vehicles[0];
    const details = vehicle.vehicleDetails;
    const typeApproval = vehicle.vehicleTypeApproval; // Type approval kan indeholde vigtige data
    const currentTransaction = vehicle.transactions[0]; // Most recent transaction
    
    // Sikre at alle felter har de korrekte typer, så der ikke opstår fejl når de bruges senere
    // Konverter alle strengværdier eller lav null/undefined check
    const safeString = (value: any): string => {
      if (value === null || value === undefined) return '';
      return typeof value === 'string' ? value : String(value);
    };
    
    const safeNumber = (value: any): number | undefined => {
      if (value === null || value === undefined) return undefined;
      // Forsøg at konvertere streng til tal hvis nødvendigt
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? undefined : parsed;
      }
      return typeof value === 'number' ? value : undefined;
    };
    
    // DUMP KOMPLET API RESPONSE FOR FEJLSØGNING
    console.log('=== FULDT API-SVAR ===');
    console.log(JSON.stringify(response, null, 2)); // Giver en formateret visning af hele API-svaret
    
    // ANALYSERE NØGLEDATAKILDER
    console.log('=== NØGLE DATAKILDER ===');
    console.log('vehicleDetails:', details);
    console.log('vehicleTypeApproval:', typeApproval);
    
    // Tjek for alternative datakilder (type approval, variants, etc.)
    const altSources: Record<string, any> = {
      details,
      typeApproval
    };
    
    // Tag variants data hvis tilgængelig
    if (typeApproval?.variants && typeApproval.variants.length > 0) {
      altSources.variant = typeApproval.variants[0];
    }
    
    // Hjælpefunktion til at søge rekursivt gennem objekter efter specifikke nøgleord
    const findValuesWithKeyPattern = (obj: any, pattern: string, depth: number = 0, maxDepth: number = 5): any[] => {
      if (depth > maxDepth || obj === null || typeof obj !== 'object') {
        return [];
      }
      
      let results: any[] = [];
      
      // Gennemgå alle egenskaber i objektet
      for (const [key, value] of Object.entries(obj)) {
        // Hvis nøglen matcher mønsteret og værdien ikke er null/undefined/tom streng
        if (key.toLowerCase().includes(pattern.toLowerCase()) && value !== null && value !== undefined && value !== '') {
          results.push({ key, value, path: `depth:${depth}` });
        }
        
        // Rekursiv søgning i underobjekter
        if (typeof value === 'object' && value !== null) {
          const nestedResults = findValuesWithKeyPattern(value, pattern, depth + 1, maxDepth);
          results = [...results, ...nestedResults];
        }
      }
      
      return results;
    };
    
    // Søg rekursivt efter data i hele API-svaret
    console.log('=== REKURSIV SØGNING EFTER VIGTIGE FELTER ===');
    
    // Søg efter bilmærke (make, brand, manufacturer...)
    const makeResults = findValuesWithKeyPattern(response, 'make')
      .concat(findValuesWithKeyPattern(response, 'brand'))
      .concat(findValuesWithKeyPattern(response, 'manufacturer'))
      .concat(findValuesWithKeyPattern(response, 'commercialName'));
    console.log('Potentielle bilmærke værdier:', makeResults);
    
    // Søg efter model
    const modelResults = findValuesWithKeyPattern(response, 'model')
      .concat(findValuesWithKeyPattern(response, 'variant'))
      .concat(findValuesWithKeyPattern(response, 'version'))
      .concat(findValuesWithKeyPattern(response, 'typeDescriptor'));
    console.log('Potentielle model værdier:', modelResults);
    
    // Søg efter første registreringsdato
    const regDateResults = findValuesWithKeyPattern(response, 'registrat')
      .concat(findValuesWithKeyPattern(response, 'firstDate'))
      .concat(findValuesWithKeyPattern(response, 'dateOf'));
    console.log('Potentielle registreringsdato værdier:', regDateResults);
    
    // Søg efter vægt
    const weightResults = findValuesWithKeyPattern(response, 'weight')
      .concat(findValuesWithKeyPattern(response, 'mass'))
      .concat(findValuesWithKeyPattern(response, 'kg'));
    console.log('Potentielle vægt værdier:', weightResults);
    
    // Vælg de bedste kandidater fra søgeresultaterne
    const getBestCandidate = (results: any[], preferredKey?: string): any => {
      if (results.length === 0) return null;
      
      // Hvis der er en foretrukken nøgle, prøv at finde den først
      if (preferredKey) {
        const preferred = results.find(r => r.key === preferredKey || r.key.endsWith(`.${preferredKey}`));
        if (preferred) return preferred.value;
      }
      
      // Ellers brug den første værdi, der ikke er et objekt
      for (const result of results) {
        if (typeof result.value !== 'object') {
          return result.value;
        }
      }
      
      // Som sidste udvej, brug den første værdi
      return results[0]?.value || null;
    };
    
    // Prøv at få data fra typeApproval (denne indeholder ofte de rigtige data)
    const makeFromTypeApproval = typeApproval?.make || typeApproval?.manufacturer || 
                               typeApproval?.commercialName;
    const modelFromTypeApproval = typeApproval?.model || typeApproval?.commercialType || 
                                typeApproval?.variant;
    const weightFromTypeApproval = typeApproval?.massInRunningOrderKg || typeApproval?.kerb || 
                                 typeApproval?.weightInRunningOrder;
    
    // Hent de bedste kandidater til hver egenskab med prioriteret rækkefølge
    const bestMake = makeFromTypeApproval || 
                   details.make || 
                   getBestCandidate(makeResults, 'make') || 
                   '';
                   
    const bestModel = modelFromTypeApproval || 
                    details.model || 
                    getBestCandidate(modelResults, 'model') || 
                    '';
                    
    const bestRegDate = details.firstRegistrationDate || 
                       getBestCandidate(regDateResults, 'firstRegistrationDate') || 
                       '';
                       
    const bestWeight = weightFromTypeApproval || 
                     details.massInRunningOrderKg || 
                     getBestCandidate(weightResults, 'massInRunningOrderKg') || 
                     0;
    
    console.log('=== VALGTE VÆRDIER ===');
    console.log('Valgt bilmærke fra typeApproval:', makeFromTypeApproval);
    console.log('Valgt model fra typeApproval:', modelFromTypeApproval);
    console.log('Valgt vægt fra typeApproval:', weightFromTypeApproval);
    console.log('Final bilmærke:', bestMake, typeof bestMake);
    console.log('Final model:', bestModel, typeof bestModel);
    console.log('Final registreringsdato:', bestRegDate, typeof bestRegDate);
    console.log('Final vægt:', bestWeight, typeof bestWeight);
    
    // Returnerer det behandlede køretøj med sikre typer
    return {
      make: safeString(bestMake),
      model: safeString(bestModel),
      variant: safeString(details.variant || typeApproval?.variant),
      year: safeNumber(details.modelYear) ?? 0,
      registrationNumber: safeString(details.registrationNumber),
      vin: safeString(details.vehicleIdentificationNumber),
      firstRegistrationDate: safeString(bestRegDate),
      fuel: safeString(details.fuel || typeApproval?.fuelType),
      color: safeString(details.colour),
      status: safeString(currentTransaction?.status),
      statusName: safeString(currentTransaction?.statusName),
      enginePowerKw: safeNumber(details.enginePowerKw || typeApproval?.powerKw),
      enginePowerHp: safeNumber(details.enginePowerHp || typeApproval?.powerHp),
      engineCapacity: safeNumber(details.totalCylinderCapacityCm3 || typeApproval?.engineCapacity),
      fuelConsumption: safeNumber(details.nedcFuelConsumptionKmPerL),
      co2Emissions: safeNumber(details.nedcCO2EmissionsGPerKm),
      weight: safeNumber(bestWeight),
      bodyType: safeString(details.bodywork || typeApproval?.bodyType),
      seats: safeNumber(details.numberOfSeatingPositions || typeApproval?.seats),
      doors: safeNumber(details.numberOfDoors || typeApproval?.doors)
    };
  }

  /**
   * Get the latest inspection data from the API response
   * @param response The full API response
   * @returns Object with latest inspection information or null if no inspections
   */
  public getLatestInspection(response: CarrusVehicleResponse) {
    if (!response.vehicles || 
        response.vehicles.length === 0 || 
        !response.vehicles[0].inspections || 
        response.vehicles[0].inspections.length === 0) {
      return null;
    }

    // Sort inspections by date (newest first)
    const sortedInspections = [...response.vehicles[0].inspections]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    const latest = sortedInspections[0];
    
    return {
      date: latest.time,
      result: latest.resultName,
      type: latest.typeName,
      odometerReading: latest.odometerReading,
      nextInspectionDate: latest.nextInspectionDate
    };
  }
}

// Export the singleton instance
export default VehicleDataService.getInstance();
