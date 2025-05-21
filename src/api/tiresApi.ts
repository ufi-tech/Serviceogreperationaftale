// tiresApi.ts - API-funktioner til dækrelaterede operationer

// Interface for dækkonfiguration
export interface TirePricingConfig {
  marginPerTire: number;            // Fast avance pr. dæk ekskl. moms
  mountingFeePerTire: number;       // Monteringsudgift pr. dæk ekskl. moms
  disposalFeePerTire: number;       // Bortskaffelsesgebyr pr. dæk ekskl. moms
  storageFeePerSeason: number;      // Opbevaringsudgift pr. sæson ekskl. moms
  seasonalChangeFee: number;        // Udgift til sæsonskifte ekskl. moms
  
  // Basiskilometer for forskellige dæktyper
  baseKmBudget: number;            // Basiskilometer for budget-dæk
  baseKmEconomy: number;          // Basiskilometer for economy-dæk
  baseKmPremium: number;           // Basiskilometer for premium-dæk
  
  // Justeringsfaktorer for dækholdbarhed
  weightFactorPer100kg: number;    // Reduktion i procent pr. 100 kg over 1500 kg (f.eks. 2 = 2%)
  powerFactorPer10hp: number;      // Reduktion i procent pr. 10 hk over 120 hk (f.eks. 1 = 1%)
  highMileageReduction: number;     // Reduktion i procent ved høj årlig kørsel over 25.000 km (f.eks. 5 = 5%)
  
  // Mønsterdybde værdiparametre
  minTreadDepthValue: number;      // Mønsterdybde (i mm) hvor dæk har 0% værdi (typisk 3mm)
  maxTreadDepthValue: number;      // Mønsterdybde (i mm) hvor dæk har 100% værdi (typisk 8mm, nye dæk)
}

// Interface for dækdatabase
export interface TireData {
  id: string;
  brand: string;             // Mærke (f.eks. Continental, Bridgestone)
  model: string;             // Model (f.eks. Premium Contact 6)
  size: string;              // Størrelse (f.eks. 205/55R16)
  season: 'summer' | 'winter' | 'all-season';  // Sæson
  category: 'budget' | 'economy' | 'premium'; // Priskategori
  basePrice: number;         // Grundpris ekskl. moms
  stock: number;             // Lagerbeholdning
  ean: string;               // EAN-kode
  supplierRef: string;       // Leverandør reference
}

// Standardkonfiguration der returneres hvis der ikke er gemt en tidligere konfiguration
const defaultConfig: TirePricingConfig = {
  marginPerTire: 300,
  mountingFeePerTire: 100,
  disposalFeePerTire: 25,
  storageFeePerSeason: 400,
  seasonalChangeFee: 800,
  
  // Basiskilometer for forskellige dæktyper
  baseKmBudget: 30000,
  baseKmEconomy: 40000,
  baseKmPremium: 55000,
  
  // Justeringsfaktorer for dækholdbarhed
  weightFactorPer100kg: 2.0,     // 2% reduktion pr. 100 kg over 1500 kg
  powerFactorPer10hp: 1.0,       // 1% reduktion pr. 10 hk over 120 hk
  highMileageReduction: 5.0,     // 5% reduktion ved kørsel over 25.000 km/år
  
  // Mønsterdybde værdiparametre
  minTreadDepthValue: 3.0,       // 3mm = 0% værdi
  maxTreadDepthValue: 8.0        // 8mm = 100% værdi (nye dæk)
};

// Hent dækkonfigurationen
export const getTirePricingConfig = async (): Promise<TirePricingConfig> => {
  try {
    // I en rigtig implementering ville dette være et API-kald
    // For nu simulerer vi det med localStorage
    const savedConfig = localStorage.getItem('tirePricingConfig');
    
    if (savedConfig) {
      return JSON.parse(savedConfig);
    } else {
      // Hvis der ikke findes en gemt konfiguration, returner standardværdier
      return defaultConfig;
    }
  } catch (error) {
    console.error('Fejl ved hentning af dækkonfiguration:', error);
    return defaultConfig;
  }
};

// Gem dækkonfigurationen
export const saveTirePricingConfig = async (config: TirePricingConfig): Promise<boolean> => {
  try {
    // I en rigtig implementering ville dette være et API-kald
    // For nu simulerer vi det med localStorage
    localStorage.setItem('tirePricingConfig', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Fejl ved gemning af dækkonfiguration:', error);
    return false;
  }
};

// Hent alle dæk
export const getTires = async (
  filters?: { 
    size?: string,
    brand?: string,
    season?: string,
    category?: string
  }
): Promise<TireData[]> => {
  try {
    // I en rigtig implementering ville dette være et API-kald
    // For nu simulerer vi det med localStorage
    const savedTires = localStorage.getItem('tiresDatabase');
    let tires: TireData[] = savedTires ? JSON.parse(savedTires) : mockTires;
    
    // Filtrer dæk baseret på parametre
    if (filters) {
      if (filters.size) {
        tires = tires.filter(tire => tire.size === filters.size);
      }
      if (typeof filters.brand === 'string' && filters.brand !== '') {
        tires = tires.filter(tire => tire.brand.toLowerCase().includes(filters.brand!.toLowerCase()));
      }
      if (filters.season) {
        tires = tires.filter(tire => tire.season === filters.season);
      }
      if (filters.category) {
        tires = tires.filter(tire => tire.category === filters.category);
      }
    }
    
    return tires;
  } catch (error) {
    console.error('Fejl ved hentning af dæk:', error);
    return [];
  }
};

// Opdater et dæk eller tilføj et nyt
export const saveTire = async (tire: TireData): Promise<boolean> => {
  try {
    // I en rigtig implementering ville dette være et API-kald
    // For nu simulerer vi det med localStorage
    const savedTires = localStorage.getItem('tiresDatabase');
    let tires: TireData[] = savedTires ? JSON.parse(savedTires) : mockTires;
    
    // Find indeks for eksisterende dæk (hvis det findes)
    const index = tires.findIndex(t => t.id === tire.id);
    
    if (index >= 0) {
      // Opdater eksisterende dæk
      tires[index] = tire;
    } else {
      // Tilføj nyt dæk med unikt ID
      tire.id = crypto.randomUUID();
      tires.push(tire);
    }
    
    localStorage.setItem('tiresDatabase', JSON.stringify(tires));
    return true;
  } catch (error) {
    console.error('Fejl ved gemning af dæk:', error);
    return false;
  }
};

// Slet et dæk
export const deleteTire = async (tireId: string): Promise<boolean> => {
  try {
    // I en rigtig implementering ville dette være et API-kald
    // For nu simulerer vi det med localStorage
    const savedTires = localStorage.getItem('tiresDatabase');
    let tires: TireData[] = savedTires ? JSON.parse(savedTires) : mockTires;
    
    // Filtrer dækket ud
    tires = tires.filter(t => t.id !== tireId);
    
    localStorage.setItem('tiresDatabase', JSON.stringify(tires));
    return true;
  } catch (error) {
    console.error('Fejl ved sletning af dæk:', error);
    return false;
  }
};

// Håndter CSV-import af dæk
export const importTiresFromCSV = async (csvData: string): Promise<boolean> => {
  try {
    const rows = csvData.split('\n');
    const headers = rows[0].split(',');
    
    // Find indeks for hver kolonne
    const brandIndex = headers.findIndex(h => h.trim().toLowerCase() === 'brand');
    const modelIndex = headers.findIndex(h => h.trim().toLowerCase() === 'model');
    const sizeIndex = headers.findIndex(h => h.trim().toLowerCase() === 'size');
    const seasonIndex = headers.findIndex(h => h.trim().toLowerCase() === 'season');
    const categoryIndex = headers.findIndex(h => h.trim().toLowerCase() === 'category');
    const priceIndex = headers.findIndex(h => h.trim().toLowerCase() === 'price');
    const stockIndex = headers.findIndex(h => h.trim().toLowerCase() === 'stock');
    const eanIndex = headers.findIndex(h => h.trim().toLowerCase() === 'ean');
    const supplierRefIndex = headers.findIndex(h => h.trim().toLowerCase() === 'supplier_ref');
    
    // Tjek om alle påkrævede kolonner findes
    if (brandIndex === -1 || modelIndex === -1 || sizeIndex === -1 || 
        seasonIndex === -1 || categoryIndex === -1 || priceIndex === -1) {
      throw new Error('CSV-filen mangler påkrævede kolonner');
    }
    
    // Konverter CSV-data til TireData-objekter
    const tires: TireData[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue; // Spring tomme rækker over
      
      const columns = rows[i].split(',');
      
      // Valider sæson
      const season = columns[seasonIndex].trim().toLowerCase();
      let validSeason: 'summer' | 'winter' | 'all-season';
      
      switch (season) {
        case 'summer':
        case 'sommer':
          validSeason = 'summer';
          break;
        case 'winter':
        case 'vinter':
          validSeason = 'winter';
          break;
        case 'all-season':
        case 'helår':
        case 'helårs':
          validSeason = 'all-season';
          break;
        default:
          validSeason = 'summer'; // Standard hvis sæson ikke er korrekt angivet
      }
      
      // Valider kategori
      const category = columns[categoryIndex].trim().toLowerCase();
      let validCategory: 'budget' | 'economy' | 'premium';
      
      switch (category) {
        case 'budget':
          validCategory = 'budget';
          break;
        case 'standard':
        case 'economy':
          validCategory = 'economy';
          break;
        case 'premium':
          validCategory = 'premium';
          break;
        default:
          validCategory = 'economy'; // Economy hvis kategori ikke er korrekt angivet
      }
      
      const tire: TireData = {
        id: crypto.randomUUID(),
        brand: columns[brandIndex].trim(),
        model: columns[modelIndex].trim(),
        size: columns[sizeIndex].trim(),
        season: validSeason,
        category: validCategory,
        basePrice: parseFloat(columns[priceIndex].trim()),
        stock: stockIndex !== -1 ? parseInt(columns[stockIndex].trim()) || 0 : 0,
        ean: eanIndex !== -1 ? columns[eanIndex].trim() : '',
        supplierRef: supplierRefIndex !== -1 ? columns[supplierRefIndex].trim() : ''
      };
      
      tires.push(tire);
    }
    
    // Gem de importerede dæk
    const savedTires = localStorage.getItem('tiresDatabase');
    let existingTires: TireData[] = savedTires ? JSON.parse(savedTires) : mockTires;
    
    // Her kan du vælge om du vil erstatte alle, kun tilføje nye, eller kombinere
    // For nu erstatter vi alle eksisterende dæk
    localStorage.setItem('tiresDatabase', JSON.stringify(tires));
    
    return true;
  } catch (error) {
    console.error('Fejl ved import af CSV:', error);
    return false;
  }
};

// Eksporter dæk til CSV
export const exportTiresToCSV = async (): Promise<string> => {
  try {
    const savedTires = localStorage.getItem('tiresDatabase');
    const tires: TireData[] = savedTires ? JSON.parse(savedTires) : mockTires;
    
    // Opret CSV-header
    let csv = 'brand,model,size,season,category,price,stock,ean,supplier_ref\n';
    
    // Tilføj hver række
    tires.forEach(tire => {
      csv += `${tire.brand},${tire.model},${tire.size},${tire.season},${tire.category},${tire.basePrice},${tire.stock},${tire.ean},${tire.supplierRef}\n`;
    });
    
    return csv;
  } catch (error) {
    console.error('Fejl ved eksport til CSV:', error);
    return '';
  }
};

// Mock-data til tests og demo
const mockTires: TireData[] = [
  {
    id: '1',
    brand: 'Continental',
    model: 'PremiumContact 6',
    size: '205/55R16',
    season: 'summer',
    category: 'premium',
    basePrice: 800,
    stock: 12,
    ean: '4019238791907',
    supplierRef: 'CONT-PC6-20555-16'
  },
  {
    id: '2',
    brand: 'Michelin',
    model: 'CrossClimate 2',
    size: '205/55R16',
    season: 'all-season',
    category: 'premium',
    basePrice: 950,
    stock: 8,
    ean: '3528709274715',
    supplierRef: 'MICH-CC2-20555-16'
  },
  {
    id: '3',
    brand: 'Bridgestone',
    model: 'Blizzak LM005',
    size: '205/55R16',
    season: 'winter',
    category: 'premium',
    basePrice: 850,
    stock: 16,
    ean: '3286341533316',
    supplierRef: 'BRID-BLZ-20555-16'
  },
  {
    id: '4',
    brand: 'Hankook',
    model: 'Ventus Prime 3',
    size: '205/55R16',
    season: 'summer',
    category: 'economy',
    basePrice: 600,
    stock: 20,
    ean: '8808563450759',
    supplierRef: 'HANK-VP3-20555-16'
  },
  {
    id: '5',
    brand: 'Falken',
    model: 'EUROALL SEASON AS210',
    size: '205/55R16',
    season: 'all-season',
    category: 'economy',
    basePrice: 650,
    stock: 14,
    ean: '4250427420233',
    supplierRef: 'FALK-EAS-20555-16'
  },
  {
    id: '6',
    brand: 'Nokian',
    model: 'WR Snowproof',
    size: '205/55R16',
    season: 'winter',
    category: 'economy',
    basePrice: 700,
    stock: 18,
    ean: '6419440349190',
    supplierRef: 'NOKI-WRS-20555-16'
  },
  {
    id: '7',
    brand: 'Barum',
    model: 'Bravuris 5HM',
    size: '205/55R16',
    season: 'summer',
    category: 'budget',
    basePrice: 450,
    stock: 24,
    ean: '4024063003347',
    supplierRef: 'BARU-BR5-20555-16'
  },
  {
    id: '8',
    brand: 'Kormoran',
    model: 'All Season',
    size: '205/55R16',
    season: 'all-season',
    category: 'budget',
    basePrice: 500,
    stock: 10,
    ean: '3528709681339',
    supplierRef: 'KORM-ALS-20555-16'
  },
  {
    id: '9',
    brand: 'Viking',
    model: 'WinTech',
    size: '205/55R16',
    season: 'winter',
    category: 'budget',
    basePrice: 520,
    stock: 22,
    ean: '4024063664326',
    supplierRef: 'VIKI-WNT-20555-16'
  },
  {
    id: '10',
    brand: 'Pirelli',
    model: 'P Zero',
    size: '225/45R18',
    season: 'summer',
    category: 'premium',
    basePrice: 1200,
    stock: 6,
    ean: '8019227375176',
    supplierRef: 'PIRE-PZ-22545-18'
  },
  {
    id: '11',
    brand: 'Goodyear',
    model: 'UltraGrip Performance+',
    size: '225/45R18',
    season: 'winter',
    category: 'premium',
    basePrice: 1300,
    stock: 4,
    ean: '5452000829771',
    supplierRef: 'GOOD-UGP-22545-18'
  },
  {
    id: '12',
    brand: 'Continental',
    model: 'EcoContact 6',
    size: '185/65R15',
    season: 'summer',
    category: 'premium',
    basePrice: 650,
    stock: 16,
    ean: '4019238812886',
    supplierRef: 'CONT-EC6-18565-15'
  }
];
