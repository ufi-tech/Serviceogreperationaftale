// EU lande data med valuta og momssatser
export interface CountryOption {
  value: string;
  label: string;
  currency: {
    code: string;
    symbol: string;
    position: 'before' | 'after'; // Bestemmer om symbol vises før eller efter beløb
  };
  vatRate: number; // Momssats i procent
  phoneCode: string; // Landekode for telefonnummer
  defaultLang: string; // Default sprog
}

export const euCountries: CountryOption[] = [
  {
    value: 'dk',
    label: 'Danmark',
    currency: {
      code: 'DKK',
      symbol: 'kr.',
      position: 'after'
    },
    vatRate: 25,
    phoneCode: '+45',
    defaultLang: 'da'
  },
  {
    value: 'se',
    label: 'Sverige',
    currency: {
      code: 'SEK',
      symbol: 'kr',
      position: 'after'
    },
    vatRate: 25,
    phoneCode: '+46',
    defaultLang: 'sv'
  },
  {
    value: 'no',
    label: 'Norge',
    currency: {
      code: 'NOK',
      symbol: 'kr',
      position: 'after'
    },
    vatRate: 25,
    phoneCode: '+47',
    defaultLang: 'nb'
  },
  {
    value: 'de',
    label: 'Tyskland',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 19,
    phoneCode: '+49',
    defaultLang: 'de'
  },
  {
    value: 'nl',
    label: 'Holland',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 21,
    phoneCode: '+31',
    defaultLang: 'nl'
  },
  {
    value: 'be',
    label: 'Belgien',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 21,
    phoneCode: '+32',
    defaultLang: 'nl'
  },
  {
    value: 'fr',
    label: 'Frankrig',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 20,
    phoneCode: '+33',
    defaultLang: 'fr'
  },
  {
    value: 'es',
    label: 'Spanien',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 21,
    phoneCode: '+34',
    defaultLang: 'es'
  },
  {
    value: 'it',
    label: 'Italien',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 22,
    phoneCode: '+39',
    defaultLang: 'it'
  },
  {
    value: 'pl',
    label: 'Polen',
    currency: {
      code: 'PLN',
      symbol: 'zł',
      position: 'after'
    },
    vatRate: 23,
    phoneCode: '+48',
    defaultLang: 'pl'
  },
  {
    value: 'cz',
    label: 'Tjekkiet',
    currency: {
      code: 'CZK',
      symbol: 'Kč',
      position: 'after'
    },
    vatRate: 21,
    phoneCode: '+420',
    defaultLang: 'cs'
  },
  {
    value: 'at',
    label: 'Østrig',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 20,
    phoneCode: '+43',
    defaultLang: 'de'
  },
  {
    value: 'ie',
    label: 'Irland',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 23,
    phoneCode: '+353',
    defaultLang: 'en'
  },
  {
    value: 'fi',
    label: 'Finland',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 24,
    phoneCode: '+358',
    defaultLang: 'fi'
  },
  {
    value: 'pt',
    label: 'Portugal',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 23,
    phoneCode: '+351',
    defaultLang: 'pt'
  },
  {
    value: 'gr',
    label: 'Grækenland',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 24,
    phoneCode: '+30',
    defaultLang: 'el'
  },
  {
    value: 'hu',
    label: 'Ungarn',
    currency: {
      code: 'HUF',
      symbol: 'Ft',
      position: 'after'
    },
    vatRate: 27,
    phoneCode: '+36',
    defaultLang: 'hu'
  },
  {
    value: 'ro',
    label: 'Rumænien',
    currency: {
      code: 'RON',
      symbol: 'lei',
      position: 'after'
    },
    vatRate: 19,
    phoneCode: '+40',
    defaultLang: 'ro'
  },
  {
    value: 'bg',
    label: 'Bulgarien',
    currency: {
      code: 'BGN',
      symbol: 'лв',
      position: 'after'
    },
    vatRate: 20,
    phoneCode: '+359',
    defaultLang: 'bg'
  },
  {
    value: 'hr',
    label: 'Kroatien',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 25,
    phoneCode: '+385',
    defaultLang: 'hr'
  },
  {
    value: 'si',
    label: 'Slovenien',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 22,
    phoneCode: '+386',
    defaultLang: 'sl'
  },
  {
    value: 'sk',
    label: 'Slovakiet',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 20,
    phoneCode: '+421',
    defaultLang: 'sk'
  },
  {
    value: 'ee',
    label: 'Estland',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 20,
    phoneCode: '+372',
    defaultLang: 'et'
  },
  {
    value: 'lv',
    label: 'Letland',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 21,
    phoneCode: '+371',
    defaultLang: 'lv'
  },
  {
    value: 'lt',
    label: 'Litauen',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 21,
    phoneCode: '+370',
    defaultLang: 'lt'
  },
  {
    value: 'lu',
    label: 'Luxembourg',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 17,
    phoneCode: '+352',
    defaultLang: 'fr'
  },
  {
    value: 'mt',
    label: 'Malta',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 18,
    phoneCode: '+356',
    defaultLang: 'mt'
  },
  {
    value: 'cy',
    label: 'Cypern',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after'
    },
    vatRate: 19,
    phoneCode: '+357',
    defaultLang: 'el'
  }
];

// Formatering af priser baseret på landets valuta
export const formatCurrency = (amount: number, country: CountryOption): string => {
  // Konverter til to decimaler og brug lokaleString for formatering
  const formattedAmount = amount.toLocaleString(country.defaultLang, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // Tilføj valutasymbol før eller efter baseret på landets konvention
  if (country.currency.position === 'before') {
    return `${country.currency.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount} ${country.currency.symbol}`;
  }
};

// Find et land baseret på landekode
export const findCountryByCode = (code: string): CountryOption | undefined => {
  return euCountries.find(country => country.value === code.toLowerCase());
};

// Standard land (Danmark)
export const defaultCountry = euCountries[0];
