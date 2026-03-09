/** Clave usada por SettingsView para guardar los datos de empresa */
export const SETTINGS_KEY = 'agropecuario_company_settings';

export interface CompanySettings {
  businessName: string;
  legalId: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  currency: string;
}

const DEFAULTS: CompanySettings = {
  businessName: 'Agropecuario S.A.',
  legalId: '',
  phone: '',
  email: '',
  address: '',
  province: 'San José',
  currency: 'CRC',
};

/** Lee la configuración de empresa desde localStorage.
 *  Si no hay datos guardados retorna los valores por defecto. */
export function getCompanySettings(): CompanySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULTS };
}
