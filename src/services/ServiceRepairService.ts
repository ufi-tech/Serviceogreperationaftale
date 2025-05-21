// Datamodeller for service & reparation
export interface ServiceRepairProvider {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRepairPackage {
  id: string;
  providerId: string;
  name: string;
  status: 'active' | 'inactive';
  description?: string;
  serviceIntervals?: string[];
  termsUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRepairPricingRule {
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
  vehicleCategory?: string;
  fuelType?: string;
  brandCode?: string;
  modelCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRepairPriceRequest {
  packageId: string;
  carAgeMonths: number;
  mileageKm: number;
  engineSizeCcm?: number;
  vehicleCategory?: string;
  fuelType?: string;
  brandCode?: string;
  modelCode?: string;
}

export interface ServiceRepairPriceResponse {
  originalPrice: number;
  finalPrice: number;
  currency: string;
  validUntil?: string;
}

// Service til at håndtere API-kald relateret til service & reparation
class ServiceRepairService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || '';
  }

  /**
   * Henter alle service & reparations-udbydere
   */
  async getServiceRepairProviders(): Promise<ServiceRepairProvider[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/service-repair-options`);
      if (!response.ok) {
        throw new Error(`Fejl ved hentning af service & reparations-udbydere: ${response.statusText}`);
      }
      const data = await response.json();
      return data.providers || [];
    } catch (error) {
      console.error('Fejl ved hentning af service & reparations-udbydere:', error);
      // Fallback til mock data i udviklingsfasen
      return this.getMockServiceRepairProviders();
    }
  }

  /**
   * Henter service & reparations-pakker for en specifik udbyder
   */
  async getServiceRepairPackages(providerId: string): Promise<ServiceRepairPackage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/service-repair-options?providerId=${providerId}`);
      if (!response.ok) {
        throw new Error(`Fejl ved hentning af service & reparations-pakker: ${response.statusText}`);
      }
      const data = await response.json();
      return data.packages || [];
    } catch (error) {
      console.error('Fejl ved hentning af service & reparations-pakker:', error);
      // Fallback til mock data i udviklingsfasen
      return this.getMockServiceRepairPackages(providerId);
    }
  }

  /**
   * Beregner prisen for en service & reparations-pakke baseret på biloplysninger
   */
  async calculateServiceRepairPrice(requestData: ServiceRepairPriceRequest): Promise<ServiceRepairPriceResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/calculate-service-repair-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Fejl ved beregning af service & reparations-pris: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fejl ved beregning af service & reparations-pris:', error);
      // Fallback til mock beregning i udviklingsfasen
      return this.getMockServiceRepairPrice(requestData);
    }
  }

  /**
   * Henter en mockup af service & reparations-udbydere (til udvikling uden backend)
   */
  getMockServiceRepairProviders(): ServiceRepairProvider[] {
    return [
      {
        id: 'autotjek',
        name: 'AutoTjek Service',
        contactPerson: 'Peter Hansen',
        email: 'peter@autotjek.dk',
        phone: '+45 22334455',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'serviceteam',
        name: 'Service Team A/S',
        contactPerson: 'Mette Nielsen',
        email: 'mette@serviceteam.dk',
        phone: '+45 66778899',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'autoservice',
        name: 'Auto Service Danmark',
        contactPerson: 'Ole Jensen',
        email: 'ole@autoservice.dk',
        phone: '+45 11223344',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  /**
   * Henter en mockup af service & reparations-pakker for en bestemt udbyder (til udvikling uden backend)
   */
  getMockServiceRepairPackages(providerId: string): ServiceRepairPackage[] {
    const packages: { [key: string]: ServiceRepairPackage[] } = {
      'autotjek': [
        {
          id: 'autotjek-basic',
          providerId: 'autotjek',
          name: 'AutoTjek Basis Service',
          status: 'active',
          description: 'Grundlæggende serviceeftersyn for alle biler',
          serviceIntervals: ['12 måneder', '15.000 km'],
          termsUrl: 'https://example.com/autotjek-basic-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'autotjek-premium',
          providerId: 'autotjek',
          name: 'AutoTjek Premium Service',
          status: 'active',
          description: 'Udvidet serviceeftersyn med ekstra kontroller',
          serviceIntervals: ['12 måneder', '15.000 km'],
          termsUrl: 'https://example.com/autotjek-premium-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      'serviceteam': [
        {
          id: 'serviceteam-standard',
          providerId: 'serviceteam',
          name: 'Service Team Standard',
          status: 'active',
          description: 'Standardservice efter fabrikkens forskrifter',
          serviceIntervals: ['12 måneder', '20.000 km'],
          termsUrl: 'https://example.com/serviceteam-standard-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'serviceteam-plus',
          providerId: 'serviceteam',
          name: 'Service Team Plus',
          status: 'active',
          description: 'Udvidet service med klimaanlæg og bremsecheck',
          serviceIntervals: ['12 måneder', '20.000 km'],
          termsUrl: 'https://example.com/serviceteam-plus-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      'autoservice': [
        {
          id: 'autoservice-lille',
          providerId: 'autoservice',
          name: 'Lille Service',
          status: 'active',
          description: 'Grundlæggende servicepakke',
          serviceIntervals: ['12 måneder', '15.000 km'],
          termsUrl: 'https://example.com/autoservice-lille-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'autoservice-stor',
          providerId: 'autoservice',
          name: 'Stort Service',
          status: 'active',
          description: 'Omfattende service med fuld gennemgang',
          serviceIntervals: ['24 måneder', '30.000 km'],
          termsUrl: 'https://example.com/autoservice-stor-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'autoservice-komplet',
          providerId: 'autoservice',
          name: 'Komplet Service Pakke',
          status: 'active',
          description: 'Alt-i-én servicepakke med ekstra fordele',
          serviceIntervals: ['12 måneder', '15.000 km'],
          termsUrl: 'https://example.com/autoservice-komplet-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };

    return packages[providerId] || [];
  }

  /**
   * Beregner en mockup af service & reparations-pris (til udvikling uden backend)
   */
  getMockServiceRepairPrice(request: ServiceRepairPriceRequest): ServiceRepairPriceResponse {
    // Basispriser for forskellige pakker
    const basePrices: { [key: string]: number } = {
      'autotjek-basic': 1500,
      'autotjek-premium': 2500,
      'serviceteam-standard': 1800,
      'serviceteam-plus': 2800,
      'autoservice-lille': 1600,
      'autoservice-stor': 2900,
      'autoservice-komplet': 3800
    };

    // Find basispris
    let basePrice = basePrices[request.packageId] || 2000;

    // Juster pris baseret på bilens alder
    if (request.carAgeMonths > 36) {
      basePrice += 300;
    }
    if (request.carAgeMonths > 60) {
      basePrice += 500;
    }

    // Juster pris baseret på kilometerstand
    if (request.mileageKm > 100000) {
      basePrice += 300;
    }
    if (request.mileageKm > 150000) {
      basePrice += 500;
    }

    // Juster pris baseret på motorstørrelse
    if (request.engineSizeCcm && request.engineSizeCcm > 2000) {
      basePrice += 400;
    }

    return {
      originalPrice: basePrice,
      finalPrice: basePrice,
      currency: 'DKK',
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 dage fra nu
    };
  }
}

// Eksporter en enkelt instans af servicen
export const serviceRepairService = new ServiceRepairService();

export default serviceRepairService;
