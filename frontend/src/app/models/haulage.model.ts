export interface WasteCarrierLicenseItem {
  fileName: string;
  expiryDate: string;
  documentUrl: string;
}

export interface HaulageProfile {
  accountId: string;
  prefix: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phoneNumber: string;

  companyName: string;
  vatRegistrationCountry: string;
  vatNumber: string;
  registrationNumber: string;

  addressLine1: string;
  addressLine2?: string | null;
  postalCode: string;
  city: string;
  stateProvince: string;
  country: string;

  companyPhoneNumber: string;
  companyMobileNumber: string;

  fleetType: FleetType;
  areasCovered: string[];
  containerTypes: string[];

  wasteCarrierLicense?: WasteCarrierLicenseItem[];

  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;

  status: string;
}

export interface HaulageProfileResponse {
  success: boolean;
  data: HaulageProfile;
}

export interface HaulageProfileRequest {
  prefix: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  phoneNumber: string;
  email: string;

  companyName: string;
  vatRegistrationCountry: string;
  vatNumber: string;
  registrationNumber: string;

  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  stateProvince: string;
  country: string;

  companyPhoneNumber: string;
  companyMobileNumber: string;

  fleetType: string;
  areasCovered: string[];
  containerTypes: string[];

  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;
}

export const euCountryList = [
  { value: 'austria', name: 'Austria' },
  { value: 'belgium', name: 'Belgium' },
  { value: 'bulgaria', name: 'Bulgaria' },
  { value: 'croatia', name: 'Croatia' },
  { value: 'czech_republic', name: 'Czech Republic' },
  { value: 'denmark', name: 'Denmark' },
  { value: 'estonia', name: 'Estonia' },
  { value: 'cyprus', name: 'Cyprus' },
  { value: 'finland', name: 'Finland' },
  { value: 'france', name: 'France' },
  { value: 'germany', name: 'Germany' },
  { value: 'greece', name: 'Greece' },
  { value: 'hungary', name: 'Hungary' },
  { value: 'ireland', name: 'Ireland' },
  { value: 'italy', name: 'Italy' },
  { value: 'latvia', name: 'Latvia' },
  { value: 'lithuania', name: 'Lithuania' },
  { value: 'luxembourg', name: 'Luxembourg' },
  { value: 'malta', name: 'Malta' },
  { value: 'netherlands', name: 'Netherlands' },
  { value: 'poland', name: 'Poland' },
  { value: 'portugal', name: 'Portugal' },
  { value: 'romania', name: 'Romania' },
  { value: 'slovakia', name: 'Slovakia' },
  { value: 'slovenia', name: 'Slovenia' },
  { value: 'spain', name: 'Spain' },
  { value: 'sweden', name: 'Sweden' },
];

// Trailer types only (WT doesn't use containers)
export enum TrailerType {
  CURTAIN_SIDER = 'Curtain Sider',
  CONTAINERS = 'Containers',
  TIPPER_TRUCKS = 'Tipper Trucks',
  WALKING_FLOOR = 'Walking Floor',
}

// Keep ContainerType as alias for backward compatibility
export const ContainerType = TrailerType;

export const trailerTypeList = [
  { value: TrailerType.CURTAIN_SIDER, name: 'Curtain Sider' },
  { value: TrailerType.CONTAINERS, name: 'Containers' },
  { value: TrailerType.TIPPER_TRUCKS, name: 'Tipper Trucks' },
  { value: TrailerType.WALKING_FLOOR, name: 'Walking Floor' },
];

// Keep containerTypeList as alias for backward compatibility
export const containerTypeList = trailerTypeList;

export const mapContainerCodeToName = trailerTypeList.reduce(
  (memo, item) => {
    memo[item.value] = item.name;
    return memo;
  },
  {
    // Legacy values for backward compatibility
    shipping_container: 'Containers',
    curtain_slider_standard: 'Curtain Sider',
    curtain_slider_high_cube: 'Curtain Sider',
    walking_floor: 'Walking Floor',
  } as Record<string, string>,
);

export enum FleetType {
  freightForwarder = 'freight_forwarder',
  ownFleet = 'own_fleet',
}

export const fleetTypeList = [
  { name: 'Freight Forwarder', value: FleetType.freightForwarder },
  { name: 'Own Fleet', value: FleetType.ownFleet },
];
export enum HaulageOfferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  INFORMATION_REQUESTED = 'information_requested',
  OPEN_FOR_EDITS = 'open_for_edits',
  PARTIALLY_SHIPPED = 'partially_shipped',
  SHIPPED = 'shipped',
}

export enum TransportProvider {
  OWN_HAULAGE = 'own_haulage',
  THIRD_PARTY = 'third_party',
  MIXED = 'mixed',
}

export const TransportProviderMap = {
  [TransportProvider.OWN_HAULAGE]: 'Own Haulage',
  [TransportProvider.THIRD_PARTY]: 'Third Party',
  [TransportProvider.MIXED]: 'Mixed',
};

export interface OfferSummary {
  id: number;
  quantity: string;
  earliestDeliveryDate: string;
  latestDeliveryDate: string;
  offeredPricePerUnit: string;
  currency: string;
  totalPrice: string;
  incoterms: string;
}

interface MaterialDetail {
  type: string;
  item: string;
  form: string;
  grading: string;
  color: string;
  finishing: string;
  packing: string;
  weightPerUnit: number;
  wasteStoration: string;
}

interface UserCompany {
  userId: number;
  username: string;
  companyId: number;
  companyName: string;
  country: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  siteRestrictions: string;
  loadingTimes: {
    openTime: string;
    closeTime: string;
  };
  averageWeightPerLoad: string | null;
  location: LocationInfo;
}

export interface HaulageOfferDetail {
  id: number;
  offerId: number;
  haulierCompanyId: number;
  haulierUserId: number;

  trailerContainerType: string;
  completingCustomsClearance: boolean;

  numberOfLoads: number;
  quantityPerLoad: string;
  haulageCostPerLoad: string;
  currency: string;
  customsFee: string;
  haulageTotal: string;

  transportProvider: TransportProvider;
  suggestedCollectionDate: string;
  expectedTransitTime: string;
  demurrageAtDestination: number;
  notes: string | null;

  status: HaulageOfferStatus;

  createdAt: string;
  updatedAt: string;

  materialName: string;
  material: MaterialDetail;
  listing: {
    id: number;
    title: null | string;
  };
  seller: UserCompany;
  buyer: UserCompany;

  offer: OfferSummary;

  numOfLoadBidOn: string;
  desiredDeliveryWindow: string;
}

export interface HaulageOfferDetailResponse {
  status: string;
  message: string;
  data: HaulageOfferDetail;
}

export interface HaulageOfferItem {
  createdAt: string;
  updatedAt: string;
  id: number;
  offerId: number;
  haulierCompanyId: number;
  haulierUserId: number;

  trailerContainerType: string;
  completingCustomsClearance: boolean;

  numberOfLoads: number;
  quantityPerLoad: number;
  haulageCostPerLoad: string;
  currency: string;
  customsFee: string;
  haulageTotal: string;

  transportProvider: TransportProvider;
  suggestedCollectionDate: string;
  expectedTransitTime: string;
  demurrageAtDestination: number;
  notes: string | null;

  status: HaulageOfferStatus;
  isSyncedSalesForce: boolean;
  lastSyncedSalesForceDate: string | null;
  salesforceId: string | null;

  materialName: string;
  materialType: string;
  materialItem: string;
  materialForm: string;
  materialGrading: string;
  materialColor: string;
  materialFinishing: string;
  materialPacking: string;
  pickupLocation: LocationInfo;
  destination: LocationInfo;
  earliestDeliveryDate: string;
  latestDeliveryDate: string;

  buyer: {
    companyId: string;
    companyName: string;
    country: string;
    location: LocationInfo;
  };
  seller: {
    companyId: string;
    companyName: string;
    country: string;
    location: LocationInfo;
  };
}

export interface HaulageOfferResponse {
  status: string;
  message: string;
  data: {
    results: HaulageOfferItem[];
    totalCount: number;
  };
}

export interface LocationInfo {
  id: number;
  addressLine: string;
  street: string;
  postcode: string;
  city: string;
  country: string;
  stateProvince: string;
  containerType: string[];
}

export interface HaulageMakeOfferRequest {
  offerId: number;
  trailerContainerType: string;
  completingCustomsClearance: boolean;
  haulageCostPerLoad: number;
  currency: string;
  transportProvider: TransportProvider;
  suggestedCollectionDate: string;
  expectedTransitTime: string;
  demurrageAtDestination: number;
  note: string | null;
}

export type HaulageOfferLoadItem = {
  offerId: number;
  expiresAt: string;
  listingId: number;
  materialType: string;
  materialItem: string;
  materialForm: string;
  materialGrading: string;
  materialColor: string;
  materialFinishing: string;
  materialPacking: string;
  pickupLocation: {
    id: number;
    addressLine: string;
    street: string;
    postcode: string;
    city: string;
    country: string;
    stateProvince: string;
    containerType: string[];
  };
  destination: {
    id: number;
    addressLine: string;
    street: string;
    postcode: string;
    city: string;
    country: string;
    stateProvince: string;
    containerType: string[];
  };
  numberOfLoads: number;
  quantityPerLoad: number;
  earliestDeliveryDate: string;
  latestDeliveryDate: string;
};

export type GetHaulageOfferLoadParams = {
  skip: number;
  limit: number;
  textSearch?: string;
  materialType?: string;
  materialItem?: string;
  materialPacking?: string;
  pickupCountry?: string;
  destinationCountry?: string;
  deliveryDateFrom?: string;
  deliveryDateTo?: string;
};

export type GetHaulageOfferLoadResponse = {
  results: HaulageOfferLoadItem[];
  totalCount: number;
};

export enum HaulageRequestActionEnum {
  APPROVE = 'approve',
  REJECT = 'reject',
  REQUEST_INFORMATION = 'request_information',
  OPEN_FOR_EDITS = 'open_for_edits',
}

export interface HaulageDocumentItem {
  id: number;
  haulageOfferId: number;
  documentTitle: string;
  documentUrl: string;
  salesforceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HaulageDocumentResponse {
  status: string;
  message: string;
  data: HaulageDocumentItem[];
}

export interface GetCompanyHaulierParams {
  skip: number;
  limit: number;
  where: {
    role: string;
    status: string;
    tabFilter: string;
  };
}

export interface CompanyHaulierItem {
  id: number;
  prefix: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  email: string;
  userStatus: string;
  status: string;
  companyRole: string;
  username: string;
  companyData: {
    id: number;
    name: string;
    country: string;
    isHaulier: boolean;
    isBuyer: boolean;
    isSeller: boolean;
    companyInterest: null;
    containerTypes: string[];
  };
}

export interface GetCompanyHaulierListResponse {
  results: CompanyHaulierItem[];
  totalCount: number;
}
