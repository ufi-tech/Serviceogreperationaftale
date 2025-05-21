// Datamodeller for garantiforsikring
export interface WarrantyProvider {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarrantyPackage {
  id: string;
  providerId: string;
  name: string;
  status: 'active' | 'inactive';
  keyCoverages?: string[];
  termsUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarrantyPricingRule {
  id: string;
  packageId: string;
  description?: string;
  price: number;
  carAgeMonthsFrom?: number;
  carAgeMonthsTo?: number;
  mileageKmFrom?: number;
  mileageKmTo?: number;
  engineSizeCcmFrom?: number;
  engineSizeCcmTo?: number;
  motorEffectHpFrom?: number; // Motoreffekt i hestekræfter (HK) for elbiler
  motorEffectHpTo?: number; // Motoreffekt i hestekræfter (HK) for elbiler
  vehicleCategory?: string;
  fuelType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarrantyPriceRequest {
  packageId: string;
  carAgeMonths: number;
  mileageKm: number;
  engineSizeCcm?: number;
  vehicleCategory?: string;
  fuelType?: string;
  dealerCoverage?: number; // Procentvis forhandlerdækning (0-100)
}

export interface WarrantyPriceResponse {
  originalPrice: number;
  finalPrice: number;
  currency: string;
  dealerCoverage?: number;
  validUntil?: string;
}

// Service til at håndtere API-kald relateret til garantiforsikring
class WarrantyService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || '';
  }

  /**
   * Henter alle garantiforsikringsudbydere
   */
  async getWarrantyProviders(): Promise<WarrantyProvider[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/warranty-options`);
      if (!response.ok) {
        throw new Error(`Fejl ved hentning af garantiudbydere: ${response.statusText}`);
      }
      const data = await response.json();
      return data.providers || [];
    } catch (error) {
      console.error('Fejl ved hentning af garantiudbydere:', error);
      return [];
    }
  }

  /**
   * Henter garantipakker for en specifik udbyder
   */
  async getWarrantyPackages(providerId: string): Promise<WarrantyPackage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/warranty-options?providerId=${providerId}`);
      if (!response.ok) {
        throw new Error(`Fejl ved hentning af garantipakker: ${response.statusText}`);
      }
      const data = await response.json();
      return data.packages || [];
    } catch (error) {
      console.error('Fejl ved hentning af garantipakker:', error);
      return [];
    }
  }

  /**
   * Beregner prisen for en garantipakke baseret på biloplysninger
   */
  async calculateWarrantyPrice(requestData: WarrantyPriceRequest): Promise<WarrantyPriceResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/calculate-warranty-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Fejl ved beregning af garantipris: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fejl ved beregning af garantipris:', error);
      return null;
    }
  }

  /**
   * Henter en mockup af garantiudbydere (til udvikling uden backend)
   */
  getMockWarrantyProviders(): WarrantyProvider[] {
    return [
      {
        id: 'fragus',
        name: 'Fragus Group',
        contactPerson: 'Jens Hansen',
        email: 'jens@fragusgroup.dk',
        phone: '+45 12345678',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'cargarantie',
        name: 'Car Garantie',
        contactPerson: 'Lars Larsen',
        email: 'lars@cargarantie.dk',
        phone: '+45 87654321',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'autogarantie',
        name: 'Auto Garantie Danmark',
        contactPerson: 'Maria Nielsen',
        email: 'maria@autogarantie.dk',
        phone: '+45 45678912',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  /**
   * Henter en mockup af garantipakker for en bestemt udbyder (til udvikling uden backend)
   */
  getMockWarrantyPackages(providerId: string): WarrantyPackage[] {
    const packages: { [key: string]: WarrantyPackage[] } = {
      'fragus': [
        {
          id: 'fragus-basic',
          providerId: 'fragus',
          name: 'Fragus Basic',
          status: 'active',
          keyCoverages: ['Motor', 'Gearkasse', 'Kobling'],
          termsUrl: 'https://example.com/fragus-basic-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'fragus-premium',
          providerId: 'fragus',
          name: 'Fragus Premium',
          status: 'active',
          keyCoverages: ['Motor', 'Gearkasse', 'Kobling', 'Elektronik', 'AC'],
          termsUrl: 'https://example.com/fragus-premium-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'fragus-platinum',
          providerId: 'fragus',
          name: 'Fragus Platinum',
          status: 'active',
          keyCoverages: ['Motor', 'Gearkasse', 'Kobling', 'Elektronik', 'AC', 'Bremser', 'Styretøj'],
          termsUrl: 'https://example.com/fragus-platinum-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      'cargarantie': [
        {
          id: 'cargarantie-basic',
          providerId: 'cargarantie',
          name: 'CarGarantie Basic',
          status: 'active',
          keyCoverages: ['Motor', 'Gearkasse'],
          termsUrl: 'https://example.com/cargarantie-basic-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'cargarantie-premium',
          providerId: 'cargarantie',
          name: 'CarGarantie Premium',
          status: 'active',
          keyCoverages: ['Motor', 'Gearkasse', 'Elektronik', 'AC'],
          termsUrl: 'https://example.com/cargarantie-premium-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      'autogarantie': [
        {
          id: 'autogarantie-std',
          providerId: 'autogarantie',
          name: 'Auto Garantie Standard',
          status: 'active',
          keyCoverages: ['Motor', 'Gearkasse', 'Kobling'],
          termsUrl: 'https://example.com/autogarantie-std-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'autogarantie-plus',
          providerId: 'autogarantie',
          name: 'Auto Garantie Plus',
          status: 'active',
          keyCoverages: ['Motor', 'Gearkasse', 'Kobling', 'Elektronik'],
          termsUrl: 'https://example.com/autogarantie-plus-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'autogarantie-elite',
          providerId: 'autogarantie',
          name: 'Auto Garantie Elite',
          status: 'active',
          keyCoverages: ['Motor', 'Gearkasse', 'Kobling', 'Elektronik', 'AC', 'Styretøj'],
          termsUrl: 'https://example.com/autogarantie-elite-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };

    return packages[providerId] || [];
  }

  /**
   * Beregner en mockup af garantipris (til udvikling uden backend)
   */
  getMockWarrantyPrice(request: WarrantyPriceRequest): WarrantyPriceResponse {
    // Basispriser for forskellige pakker
    const basePrices: { [key: string]: number } = {
      'fragus-basic': 3000,
      'fragus-premium': 4500,
      'fragus-platinum': 6000,
      'cargarantie-basic': 2800,
      'cargarantie-premium': 4200,
      'autogarantie-std': 2900,
      'autogarantie-plus': 4400,
      'autogarantie-elite': 5800
    };

    // Find basispris
    let basePrice = basePrices[request.packageId] || 4000;

    // Juster pris baseret på bilens alder
    if (request.carAgeMonths > 36) {
      basePrice += 1000;
    }
    if (request.carAgeMonths > 60) {
      basePrice += 1500;
    }

    // Juster pris baseret på kilometerstand
    if (request.mileageKm > 100000) {
      basePrice += 800;
    }
    if (request.mileageKm > 150000) {
      basePrice += 1200;
    }

    // Beregn den endelige pris efter evt. forhandlerdækning
    const dealerCoverage = request.dealerCoverage || 0;
    const finalPrice = basePrice - (basePrice * (dealerCoverage / 100));

    return {
      originalPrice: basePrice,
      finalPrice: finalPrice,
      currency: 'DKK',
      dealerCoverage: dealerCoverage,
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 dage fra nu
    };
  }
}

// Eksporter en enkelt instans af servicen
export const warrantyService = new WarrantyService();

export default warrantyService;
