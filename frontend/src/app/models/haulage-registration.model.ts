export interface HaulageRegistration {
  email: string;
  password?: string;
  prefix: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  phoneNumberUser: string;
  mobileNumberUser: string;
  whereDidYouHearAboutUs: string;

  companyName: string;
  vatNumber: string;
  vatRegistrationCountry: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  stateProvince: string;
  country: string;
  phoneNumberCompany: string;
  mobileNumberCompany: string;

  fleetType: string;
  areasCovered: string[];
  containerTypes: string[];

  documents: Array<{
    documentType: string;
    expiryDate: string;
    documentUrl: string;
  }>;
}
