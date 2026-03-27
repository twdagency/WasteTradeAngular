export interface TradingRegistration {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  prefix: string;
  jobTitle: string;
  phoneNumber: string;
  mobileNumber: string;
  whereDidYouHearAboutUs: string;
  companyName: string;
  companyInterest: string[];
  favoriteMaterials: string[];
}

export interface RegistrationResult {
  data: {
    accessToken: string;
    company: any; // TODO: Define the type
    companyUser: any; // TODO: Define the type
    user: any; // TODO: Define the type
  };
  message: string;
  status: string;
}

export interface CompanyInfo {
  id: number;
  countryCode: string;
  name: string;
  vatNumber: string;
  vatRegistrationCountry: string;
  addressLine1: string;
  city: string;
  country: string;
  stateProvince: string;
  postalCode: string;
  companyType: string;
}

export interface CompanyLocation extends Partial<CompanyInfo> {
  companyId: number;
  locationName: string;
  firstName: string;
  lastName: string;
  positionInCompany: string;
  phoneNumber: string;
  officeOpenTime: string;
  officeCloseTime: string;
  loadingRamp: boolean;
  weighbridge: boolean;
  containerType: string[];
  selfLoadUnloadCapability: boolean;
  accessRestrictions: string;
}
