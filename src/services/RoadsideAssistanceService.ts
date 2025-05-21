// Datamodeller for vejhjælp (roadside assistance)
export interface RoadsideProvider {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  internalNotes?: string;
  active: boolean; // Angiver om udbyderen er aktiv/synlig i systemet
  preferred: boolean; // Angiver om udbyderen er foretrukken
  logoUrl?: string; // URL til udbyderens logo
  createdAt: string;
  updatedAt: string;
}

export interface RoadsidePackage {
  id: string;
  providerId: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  coverage: string[];
  price: number;
  termsUrl?: string;
  recommended?: boolean; // Angiver om pakken er anbefalet
  order?: number; // Bruges til at sortere pakker
  createdAt: string;
  updatedAt: string;
}

export interface RoadsidePricingRule {
  id: string;
  packageId: string;
  description?: string;
  price: number;
  carAgeMonthsFrom?: number;
  carAgeMonthsTo?: number;
  vehicleCategory?: string;
  fuelType?: string;
  isCommercial?: boolean;
  countryRegion?: string; // 'denmark' | 'nordic' | 'europe'
  createdAt: string;
  updatedAt: string;
}

// Service til at håndtere API-kald relateret til vejhjælp
export class RoadsideAssistanceService {
  private baseUrl: string;
  private adminBaseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || '';
    this.adminBaseUrl = process.env.REACT_APP_ADMIN_API_URL || this.baseUrl;
  }

  /**
   * Henter alle vejhjælpsudbydere
   */
  async getRoadsideProviders(): Promise<RoadsideProvider[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/roadside-providers`);
      if (!response.ok) {
        throw new Error(`Fejl ved hentning af vejhjælpsudbydere: ${response.statusText}`);
      }
      const data = await response.json();
      return data.providers || [];
    } catch (error) {
      console.error('Fejl ved hentning af vejhjælpsudbydere:', error);
      return [];
    }
  }

  /**
   * Henter vejhjælpspakker for en specifik udbyder
   */
  async getRoadsidePackages(providerId: string): Promise<RoadsidePackage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/roadside-packages?providerId=${providerId}`);
      if (!response.ok) {
        throw new Error(`Fejl ved hentning af vejhjælpspakker: ${response.statusText}`);
      }
      const data = await response.json();
      return data.packages || [];
    } catch (error) {
      console.error('Fejl ved hentning af vejhjælpspakker:', error);
      return [];
    }
  }

  /**
   * Henter prisregler for en specifik vejhjælpspakke
   */
  async getRoadsidePricingRules(packageId: string): Promise<RoadsidePricingRule[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/roadside-pricing-rules?packageId=${packageId}`);
      if (!response.ok) {
        throw new Error(`Fejl ved hentning af prisregler: ${response.statusText}`);
      }
      const data = await response.json();
      return data.rules || [];
    } catch (error) {
      console.error('Fejl ved hentning af prisregler:', error);
      return [];
    }
  }
  
  // ================ ADMIN FUNKTIONER ================
  
  /**
   * Henter alle vejhjælpsudbydere til admin
   */
  async getAdminRoadsideProviders(): Promise<RoadsideProvider[]> {
    try {
      const response = await fetch(`${this.adminBaseUrl}/api/admin/roadside-providers`);
      if (!response.ok) {
        throw new Error(`Fejl ved hentning af vejhjælpsudbydere: ${response.statusText}`);
      }
      const data = await response.json();
      return data.providers || [];
    } catch (error) {
      console.error('Fejl ved hentning af vejhjælpsudbydere:', error);
      return this.getMockRoadsideProviders(); // Returner mock-data ved fejl
    }
  }
  
  /**
   * Henter en specifik vejhjælpsudbyder til admin
   */
  async getAdminRoadsideProvider(providerId: string): Promise<RoadsideProvider | null> {
    try {
      const response = await fetch(`${this.adminBaseUrl}/api/admin/roadside-providers/${providerId}`);
      if (!response.ok) {
        throw new Error(`Fejl ved hentning af vejhjælpsudbyder: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Fejl ved hentning af vejhjælpsudbyder ${providerId}:`, error);
      return null;
    }
  }
  
  /**
   * Opretter en ny vejhjælpsudbyder
   */
  async createRoadsideProvider(provider: Omit<RoadsideProvider, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoadsideProvider | null> {
    try {
      const response = await fetch(`${this.adminBaseUrl}/api/admin/roadside-providers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(provider),
      });
      if (!response.ok) {
        throw new Error(`Fejl ved oprettelse af vejhjælpsudbyder: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Fejl ved oprettelse af vejhjælpsudbyder:', error);
      return null;
    }
  }
  
  /**
   * Opdaterer en eksisterende vejhjælpsudbyder
   */
  async updateRoadsideProvider(providerId: string, provider: Partial<RoadsideProvider>): Promise<RoadsideProvider | null> {
    try {
      const response = await fetch(`${this.adminBaseUrl}/api/admin/roadside-providers/${providerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(provider),
      });
      if (!response.ok) {
        throw new Error(`Fejl ved opdatering af vejhjælpsudbyder: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Fejl ved opdatering af vejhjælpsudbyder ${providerId}:`, error);
      return null;
    }
  }
  
  /**
   * Sletter en vejhjælpsudbyder
   */
  async deleteRoadsideProvider(providerId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.adminBaseUrl}/api/admin/roadside-providers/${providerId}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error(`Fejl ved sletning af vejhjælpsudbyder ${providerId}:`, error);
      return false;
    }
  }
  
  /**
   * Henter alle vejhjælpspakker til admin
   */
  async getAdminRoadsidePackages(providerId?: string): Promise<RoadsidePackage[]> {
    try {
      const url = providerId 
        ? `${this.adminBaseUrl}/api/admin/roadside-packages?providerId=${providerId}`
        : `${this.adminBaseUrl}/api/admin/roadside-packages`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Fejl ved hentning af vejhjælpspakker: ${response.statusText}`);
      }
      const data = await response.json();
      return data.packages || [];
    } catch (error) {
      console.error('Fejl ved hentning af vejhjælpspakker:', error);
      return providerId ? this.getMockRoadsidePackages(providerId) : [];
    }
  }
  
  /**
   * Henter en specifik vejhjælpspakke til admin
   */
  async getAdminRoadsidePackage(packageId: string): Promise<RoadsidePackage | null> {
    try {
      const response = await fetch(`${this.adminBaseUrl}/api/admin/roadside-packages/${packageId}`);
      if (!response.ok) {
        throw new Error(`Fejl ved hentning af vejhjælpspakke: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Fejl ved hentning af vejhjælpspakke ${packageId}:`, error);
      return null;
    }
  }
  
  /**
   * Opretter en ny vejhjælpspakke
   */
  async createRoadsidePackage(pkg: Omit<RoadsidePackage, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoadsidePackage | null> {
    try {
      const response = await fetch(`${this.adminBaseUrl}/api/admin/roadside-packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pkg),
      });
      if (!response.ok) {
        throw new Error(`Fejl ved oprettelse af vejhjælpspakke: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Fejl ved oprettelse af vejhjælpspakke:', error);
      return null;
    }
  }
  
  /**
   * Opdaterer en eksisterende vejhjælpspakke
   */
  async updateRoadsidePackage(packageId: string, pkg: Partial<RoadsidePackage>): Promise<RoadsidePackage | null> {
    try {
      const response = await fetch(`${this.adminBaseUrl}/api/admin/roadside-packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pkg),
      });
      if (!response.ok) {
        throw new Error(`Fejl ved opdatering af vejhjælpspakke: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Fejl ved opdatering af vejhjælpspakke ${packageId}:`, error);
      return null;
    }
  }
  
  /**
   * Sletter en vejhjælpspakke
   */
  async deleteRoadsidePackage(packageId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.adminBaseUrl}/api/admin/roadside-packages/${packageId}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error(`Fejl ved sletning af vejhjælpspakke ${packageId}:`, error);
      return false;
    }
  }
  
  /**
   * Henter en mockup af vejhjælpsudbydere (til udvikling uden backend)
   */
  getMockRoadsideProviders(): RoadsideProvider[] {
    return [
      {
        id: 'falck',
        name: 'Falck Vejhjælp',
        contactPerson: 'Peter Jensen',
        email: 'peter@falck.dk',
        phone: '+45 70 10 20 30',
        active: true,
        preferred: true,
        logoUrl: 'https://example.com/falck-logo.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'sos',
        name: 'SOS International',
        contactPerson: 'Marie Hansen',
        email: 'marie@sos.dk',
        phone: '+45 70 10 50 60',
        active: true,
        preferred: false,
        logoUrl: 'https://example.com/sos-logo.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'dansk-autohjælp',
        name: 'Dansk Autohjælp',
        contactPerson: 'Lars Nielsen',
        email: 'lars@autohjaelp.dk',
        phone: '+45 70 10 80 90',
        active: true,
        preferred: false,
        logoUrl: 'https://example.com/dansk-autohjaelp-logo.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
  
  /**
   * Henter en mockup af vejhjælpspakker for en bestemt udbyder (til udvikling uden backend)
   */
  getMockRoadsidePackages(providerId: string): RoadsidePackage[] {
    const packages: { [key: string]: RoadsidePackage[] } = {
      'falck': [
        {
          id: 'falck-basic',
          providerId: 'falck',
          name: 'Falck Basic',
          description: 'Grundlæggende vejhjælp i Danmark',
          status: 'active',
          coverage: ['Danmark', 'Starthjælp', 'Hjulskifte', 'Bugsering'],
          price: 199,
          termsUrl: 'https://example.com/falck-basic-terms.pdf',
          recommended: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'falck-plus',
          providerId: 'falck',
          name: 'Falck Plus',
          description: 'Udvidet vejhjælp i Norden',
          status: 'active',
          coverage: ['Norden', 'Starthjælp', 'Hjulskifte', 'Bugsering', 'Hotelovernatning'],
          price: 299,
          termsUrl: 'https://example.com/falck-plus-terms.pdf',
          recommended: false,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'falck-europa',
          providerId: 'falck',
          name: 'Falck Europa',
          description: 'Komplet vejhjælp i hele Europa',
          status: 'active',
          coverage: ['Europa', 'Starthjælp', 'Hjulskifte', 'Bugsering', 'Hotelovernatning', 'Hjemtransport'],
          price: 399,
          termsUrl: 'https://example.com/falck-europa-terms.pdf',
          recommended: false,
          order: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      'sos': [
        {
          id: 'sos-standard',
          providerId: 'sos',
          name: 'SOS Standard',
          description: 'Vejhjælp i Danmark og udvalgte lande',
          status: 'active',
          coverage: ['Danmark', 'Sverige', 'Norge', 'Tyskland', 'Starthjælp', 'Bugsering'],
          price: 249,
          termsUrl: 'https://example.com/sos-standard-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'sos-premium',
          providerId: 'sos',
          name: 'SOS Premium',
          description: 'Komplet vejhjælp i Europa med ekstra dækning',
          status: 'active',
          coverage: ['Europa', 'Starthjælp', 'Hjulskifte', 'Bugsering', 'Hotelovernatning', 'Hjemtransport', 'Lejebil'],
          price: 349,
          termsUrl: 'https://example.com/sos-premium-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      'dansk-autohjælp': [
        {
          id: 'dah-basis',
          providerId: 'dansk-autohjælp',
          name: 'Basis Vejhjælp',
          description: 'Lokal vejhjælp i Danmark',
          status: 'active',
          coverage: ['Danmark', 'Starthjælp', 'Hjulskifte', 'Bugsering (kort distance)'],
          price: 179,
          termsUrl: 'https://example.com/dah-basis-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'dah-komplet',
          providerId: 'dansk-autohjælp',
          name: 'Komplet Vejhjælp',
          description: 'Omfattende vejhjælp i hele Danmark',
          status: 'active',
          coverage: ['Danmark', 'Starthjælp', 'Hjulskifte', 'Bugsering', 'Nødreparation'],
          price: 259,
          termsUrl: 'https://example.com/dah-komplet-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'dah-europa',
          providerId: 'dansk-autohjælp',
          name: 'Europa Vejhjælp',
          description: 'Komplet vejhjælp i hele Europa',
          status: 'active',
          coverage: ['Europa', 'Starthjælp', 'Hjulskifte', 'Bugsering', 'Hotelovernatning', 'Hjemtransport'],
          price: 349,
          termsUrl: 'https://example.com/dah-europa-terms.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };
    
    return packages[providerId] || [];
  }
  
  /**
   * Henter en mockup af prisregler for en bestemt pakke (til udvikling uden backend)
   */
  getMockRoadsidePricingRules(packageId: string): RoadsidePricingRule[] {
    // Nogle generiske prisregler
    return [
      {
        id: `rule-${packageId}-1`,
        packageId: packageId,
        description: 'Standardpris - personbil',
        price: 25,
        vehicleCategory: 'personbil',
        countryRegion: 'denmark',
        isCommercial: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `rule-${packageId}-2`,
        packageId: packageId,
        description: 'Standardpris - varebil',
        price: 35,
        vehicleCategory: 'varebil',
        countryRegion: 'denmark',
        isCommercial: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `rule-${packageId}-3`,
        packageId: packageId,
        description: 'Europa - personbil',
        price: 45,
        vehicleCategory: 'personbil',
        countryRegion: 'europe',
        isCommercial: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `rule-${packageId}-4`,
        packageId: packageId,
        description: 'Erhvervskunde - varebil',
        price: 60,
        vehicleCategory: 'varebil',
        countryRegion: 'denmark',
        isCommercial: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

// Eksporter en enkelt instans af servicen
export const roadsideAssistanceService = new RoadsideAssistanceService();

export default roadsideAssistanceService;
