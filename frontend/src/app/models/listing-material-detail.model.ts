import { Currency } from './currency';
import { CompanyDocumentType } from './document.model';
import { ListingDocument } from './listing-material.model';

// Expiry information interface
export interface ExpiryInfo {
  isExpired: boolean;
  isNearingExpiry: boolean;
  daysUntilExpiry: number;
  expiryDate: string;
}

// Document model
export interface IDocument {
  createdAt: string;
  updatedAt: string;
  id: number;
  documentType: CompanyDocumentType;
  documentUrl: string;
  listingId: number;
  uploadedByUserId: number;
  reviewedByUserId: number | null;
  documentName: string;
  status: string;
  rejectionReason?: string | null;
  reviewedAt?: string;
  expiryDate?: string;
  companyId: number;
}

// Listing model
export interface Listing {
  createdAt: string;
  updatedAt: string;
  id: number;
  companyId: number;
  locationId: number | null;
  createdByUserId: number;
  materialType?: string;
  materialItem?: string;
  materialForm?: string;
  materialGrading?: string;
  materialColor: string;
  materialFinishing: string;
  materialPacking: string;
  country: string;
  listingType: 'sell' | 'wanted';
  title: string;
  description: string | null;
  quantity: number;
  remainingQuantity: number | null;
  materialFlowIndex: string;
  materialWeightPerUnit: number | null;
  weightPerLoad: number | null;
  materialRemainInCountry: boolean;
  currency: Currency | null;
  additionalNotes: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
  state: string;
  isFeatured: boolean;
  isUrgent: boolean;
  capacityPerMonth: number;
  materialWeightWanted: number;
  wasteStoration: string;
  listingRenewalPeriod: string | null;
  listingDuration: string;
  viewCount: number | null;
  documents: ListingDocument[];
  expiryInfo?: ExpiryInfo;

  hasApprovedOffer: boolean;
  hasPendingOffer: boolean;
  totalWeight: number;
  pricePerMetricTonne: number;
  incoterms: string;
  materialWeight: number;
  weightUnit: string;
  numberOfLoads: number;
}

// Company model
export interface Company {
  id: number;
  countryCode: string | null;
  name: string;
  registrationNumber: string | null;
  vatNumber: string | null;
  vatRegistrationCountry: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  country: string | null;
  stateProvince: string | null;
  postalCode: string | null;
  website: string | null;
  phoneNumber: string | null;
  mobileNumber: string | null;
  companyType: string | null;
  favoriteMaterials: string[];
  companyInterest: string;
  isHaulier: boolean;
  boxClearingAgent: boolean;
  fleetType: string | null;
  areasCovered: string | null;
  containerTypes: string | null;
  status: string;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Response model
type UserInfo = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
};
export interface ListingMaterialDetailResponse {
  status: string;
  data: {
    listing: Listing;
    company: Company;
    createdBy?: {
      user: UserInfo;
    };
    buyerDetails?: {
      contactPerson: UserInfo;
      address: {
        addressLine: string;
        street: string;
        postcode: string;
        city: string;
        country: string;
        stateProvince: string;
      };
    };
    locationDetails: {
      address: {
        addressLine: string;
        street: string;
        postcode: string;
        city: string;
        country: string;
        stateProvince: string;
      };
    };
  };
  message: string;
}

export type ListingMaterialDetail = ListingMaterialDetailResponse['data'];

export interface RequestInformationPayload {
  listingId: number;
  requestPictures: boolean | null;
  requestSpecSheets: boolean | null;
  requestDescription: boolean | null;
  freeText: string | null;
}

export interface RequestInformationResponse {
  id: number;
  userId: number;
  listingId: number;
  requestPictures: boolean;
  requestSpecSheets: boolean;
  requestDescription: boolean;
  freeText: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
