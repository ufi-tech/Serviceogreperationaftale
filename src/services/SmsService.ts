// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

// Interface for at sende en SMS-anmodning
export interface SendSmsRequest {
  phoneNumber: string;
  countryCode: string;
  message: string;
}

// Interface for SMS-statussen
export interface SmsStatus {
  id: string;
  phoneNumber: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  timestamp: string;
  linkOpened: boolean;
  customerDataSubmitted: boolean;
}

// Interface for kundedata
export interface CustomerData {
  id: string;
  fornavn: string;
  efternavn: string;
  email: string;
  telefon: string;
  adresse: string;
  postnummer: string;
  by: string;
  land: string;
  samtykke: boolean;
  createdAt: string;
  updatedAt: string;
}

class SmsService {
  // Simulerer afsendelse af SMS med link til kundedata-indsamling
  async sendCustomerDataCollectionSms(phoneNumber: string, countryCode: string, aftaleOverblikData: any): Promise<SmsStatus> {
    // Generer et unikt ID til at spore denne SMS
    const smsId = uuidv4();
    
    // Generer en dummy-URL med token, som kunden vil modtage
    const token = uuidv4();
    const kundeDataUrl = `https://service-aftale.dk/kunde-data/${token}`;
    
    // Byg SMS-besked med link og kort opsummering af aftalen
    let message = `Se din serviceaftale og indtast dine oplysninger: ${kundeDataUrl}\n\n`;
    
    // Tilføj kort opsummering af aftaleoverblikket
    if (aftaleOverblikData) {
      const { bilmaerke, model, aftaletype, loebetid } = aftaleOverblikData;
      message += `${bilmaerke} ${model} - ${aftaletype}, ${loebetid} mdr.`;
      
      // Tilføj information om tilvalgene
      const tilvalg = [];
      if (aftaleOverblikData.daekaftale?.valgt) tilvalg.push('Dækaftale');
      if (aftaleOverblikData.garantiforsikring?.valgt) tilvalg.push('Garantiforsikring');
      if (aftaleOverblikData.vejhjaelp?.valgt) tilvalg.push('Vejhjælp');
      if (aftaleOverblikData.laanebil?.valgt) tilvalg.push('Lånebil');
      
      if (tilvalg.length > 0) {
        message += `\nTilvalg: ${tilvalg.join(', ')}`;
      }
    }
    
    // I et virkeligt miljø ville vi kalde et eksternt SMS API her
    // For denne demo simulerer vi en afsendelse med timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Sending SMS to +${countryCode}${phoneNumber}: ${message}`);
        
        // Returner succes-status
        resolve({
          id: smsId,
          phoneNumber: `+${countryCode}${phoneNumber}`,
          status: 'sent',
          timestamp: new Date().toISOString(),
          linkOpened: false,
          customerDataSubmitted: false
        });
      }, 1500);
    });
  }
  
  // Kontrollerer status for SMS og kundedata-indsamling
  async checkSmsStatus(smsId: string): Promise<SmsStatus> {
    // I et virkeligt miljø ville vi tjekke en database eller kalde et API
    // For denne demo simulerer vi forskellige statusser baseret på ID
    
    // For demo: hvis ID slutter med 1-3, simuler at kunden ikke har åbnet linket endnu
    if (smsId.endsWith('1') || smsId.endsWith('2') || smsId.endsWith('3')) {
      return {
        id: smsId,
        phoneNumber: '+4512345678',
        status: 'delivered',
        timestamp: new Date().toISOString(),
        linkOpened: false,
        customerDataSubmitted: false
      };
    }
    
    // For demo: hvis ID slutter med 4-6, simuler at kunden har åbnet linket men ikke udfyldt data
    if (smsId.endsWith('4') || smsId.endsWith('5') || smsId.endsWith('6')) {
      return {
        id: smsId,
        phoneNumber: '+4512345678',
        status: 'delivered',
        timestamp: new Date().toISOString(),
        linkOpened: true,
        customerDataSubmitted: false
      };
    }
    
    // For alle andre ID'er, simuler at kunden har udfyldt deres data
    return {
      id: smsId,
      phoneNumber: '+4512345678',
      status: 'delivered',
      timestamp: new Date().toISOString(),
      linkOpened: true,
      customerDataSubmitted: true
    };
  }
  
  // Simulerer hentning af kundedata når de er blevet indsendt
  async getCustomerData(smsId: string): Promise<CustomerData | null> {
    // I et virkeligt miljø ville vi hente data fra en database eller kalde et API
    // For demo simulerer vi nogle kundedata
    
    // Kun returner data hvis vi simulerer at kunden har udfyldt deres data
    const status = await this.checkSmsStatus(smsId);
    
    if (status.customerDataSubmitted) {
      return {
        id: uuidv4(),
        fornavn: 'Anders',
        efternavn: 'Andersen',
        email: 'anders@example.com',
        telefon: '12345678',
        adresse: 'Hovedgaden 123',
        postnummer: '2100',
        by: 'København Ø',
        land: 'Danmark',
        samtykke: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    return null;
  }
}

export default new SmsService();
