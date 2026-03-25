import * as api from '../services/api';

export interface CompanySettings {
  id?: number;
  businessName: string;
  legalId: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  currency: string;
  printMode: 'browser' | 'escpos';
  printerName?: string;
  cashierName?: string;
  taxExempt: boolean;
  
  // Hacienda
  haciendaUsername?: string;
  haciendaPassword?: string;
  haciendaAmbiente: 'stag' | 'prod';
  haciendaClientId: string;
  haciendaTokenUrl?: string;
  haciendaRecepcionUrl?: string;
  haciendaKeystorePassword?: string;
  haciendaActividadEconomica?: string;
  canton?: string;
  distrito?: string;
  barrio?: string;
  hasCertificate?: boolean;
}

export const DEFAULTS: CompanySettings = {
  businessName: 'Agropecuario S.A.',
  legalId: '',
  phone: '',
  email: '',
  address: '',
  currency: 'CRC',
  printMode: 'browser',
  printerName: '',
  cashierName: '',
  taxExempt: false,
  haciendaAmbiente: 'stag',
  haciendaClientId: 'api-stag',
  province: '1',
  canton: '01',
  distrito: '01',
  barrio: '01',
  haciendaActividadEconomica: '512102'
};

/** Lee la configuración de empresa desde el Backend. */
export async function getCompanySettings(): Promise<CompanySettings> {
  try {
    const data = await api.getSettings();
    return { ...DEFAULTS, ...data };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { ...DEFAULTS };
  }
}

/** Guarda la configuración en el Backend. */
export async function saveCompanySettings(settings: CompanySettings): Promise<CompanySettings> {
  try {
    return await api.updateSettings(settings);
  } catch (error) {
    console.error("Error saving settings:", error);
    throw error;
  }
}

/** Carga el certificado .p12 al Backend. */
export async function uploadCertificate(file: File): Promise<string> {
  return await api.uploadCertificate(file);
}
