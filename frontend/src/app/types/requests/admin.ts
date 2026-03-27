import { Company, ListingDocument, ListingMaterial, ListingState, ListingStatus, User, UserInfor } from 'app/models';
import { ListingMemberItem, Location, MemberDetail } from 'app/models/admin/commercial.model';
import { HaulageBidDetail, HaulageBidItem } from 'app/models/admin/haulage-bid.model';
import { HaulageMakeOfferRequest } from 'app/models/haulage.model';
import { Listing } from 'app/models/listing-material-detail.model';
import { AssignAdmin } from 'app/share/ui/admin/commercial/admin-member/assign-type/asign-type';
import { AdminNote } from 'app/share/ui/notes/types/notes';

// interface Listing {
//   id: number;
//   materialType: string;
//   materialItem: string;
//   materialGrading: string;
//   materialForm: string;
//   materialPacking: string;
//   materialFlowIndex: string;
//   materialWeightWanted: number;
//   capacityPerMonth: number;
//   currency: string;
//   startDate: string;
//   listingDuration: string;
//   listingRenewalPeriod: string;
//   additionalNotes: string;
//   status: string;
//   state: string;
//   createdAt: string;
//   updatedAt: string;
//   companyId: number;
//   createdByUserId: number;
//   listingType: string;
//   country: string;
//   wasteStoration: string;
// }

interface SellerInformation {
  id: number;
  fullName: string;
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
}

interface BuyerDetails {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyMobile: string;
  companyWebsite: string;
  companyDescription: string;
  vatNumber: string;
  registrationNumber: string;
  companyType: string;
  companyInterest: string;
  isBuyer: boolean;
  isSeller: boolean;
  isHaulier: boolean;
  favoriteMaterials: string[];
  containerTypes: string[];
  areasCovered: string[];

  address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    country: string;
    stateProvince: string;
    postalCode: string;
  };

  contactPerson: {
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    phoneNumber: string;
  };

  location: Location;
}
interface MaterialInformation {
  materialName: string;
  materialType: string;
  materialForm: string;
  materialGrading: string;
  materialColor: string;
  materialFinishing: string;
  materialPacking: string;
  materialFlowIndex: number | null;
  materialWeightPerUnit: number;
  materialRemainInCountry: boolean;
  country: string;
  currency: string;
  packaging: string;
  capacityPerMonth: number | null;
  materialWeightWanted: number | null;
  quantity: number;
  remainingQuantity: number;
  wasteStoration: string;
  pricePerMetricTonne: string;
}

export interface StorageDetails {
  id: number;
  locationName: string;
  sitePointContact: string | null;
  phoneNumber: string;

  address: {
    addressLine: string;
    street: string;
    postcode: string;
    city: string;
    country: string;
    stateProvince: string;
  };

  operatingHours: {
    openTime: string;
    closeTime: string;
  };

  facilities: {
    loadingRamp: boolean;
    weighbridge: boolean;
    selfLoadUnloadCapability: boolean;
  };

  containerTypes: string[];
  acceptedMaterials: string[];

  siteSpecificInstructions: string;
  accessRestrictions: string;
  otherMaterial: string | null;
  isMainLocation: boolean;
}

interface BidStatus {
  status: ListingStatus;
  state: ListingState;
}

export interface GetListingDetailResponse {
  status: string;
  data: {
    listing: ListingMaterial;
    userInformation: SellerInformation;
    buyerDetails: BuyerDetails;
    materialInformation: MaterialInformation;
    storageDetails: StorageDetails;
    bidStatus: BidStatus;
    bestOffer: string;
    bestOfferCurrency: string;
    numberOfOffers: number;
    documents: {
      all: ListingDocument[];
      featureImage: string;
    };
  };
  message: string;
}

export enum ListingRequestActionEnum {
  ACCEPT = 'accept',
  REJECT = 'reject',
  REQUEST_INFORMATION = 'request_information',
}

export interface ListingActionParams {
  rejectionReason?: string;
  message?: string;
}

export interface GetMembersParams {
  page: number;
  pageSize: number;
  [key: string]: any;
}

export type GetMembersResponse = {
  data: ListingMemberItem[];
  total: number;
};

export type GetMemberDetailResponse = {
  status: string;
  message: string;
  data: MemberDetail;
};

export interface SampleRequestItem {
  id: number;
  listingId: number;
  buyerUserId: number;
  buyerCompanyId: number;
  buyerLocation?: string;
  buyerCountry?: string;
  sellerUserId: number;
  sellerCompanyId: number;
  sellerLocation?: string;
  sellerCountry?: string;
  assignedAdminId?: number;
  numberOfSamples: number;
  sampleSize: string; // e.g., "1kg", "5kg"
  buyerMessage?: string;
  status:
    | 'Sample Requested'
    | 'Sample Approved'
    | 'Sample Dispatched'
    | 'Sample In Transit'
    | 'Customs Cleared'
    | 'Sample Delivered'
    | 'Customer Feedback Requested'
    | 'Feedback Provided'
    | 'Cancelled';
  sentDate?: Date;
  materialName: string;
  receivedDate?: Date;
  postageLabelUrl?: string;
  isSyncedSalesForce: boolean;
  lastSyncedSalesForceDate?: Date;
  salesforceId?: string;
  createdAt: Date;
  updatedAt: Date;
  assignAdmin?: AssignAdmin;
  adminNote?: AdminNote;
  listing: Listing;
  buyerUser: UserInfor;
  buyerCompany: Company;
  sellerUser: UserInfor;
  sellerCompany: Company;
}

export interface GetSamplesParams extends GetMembersParams {}
export interface GetSamplesResponse {
  status: string;
  message: string;
  data: {
    results: SampleRequestItem[];
    totalCount: number;
    limit: number;
    skip: number;
  };
}

export interface MfiRequestItem {
  id: number;
  listingId: number;
  buyerUserId: number;
  buyerCompanyId: number;
  buyerLocation?: string;
  buyerCountry?: string;
  sellerUserId: number;
  sellerCompanyId: number;
  sellerLocation?: string;
  sellerCountry?: string;
  assignedAdminId?: number;
  buyerMessage?: string;
  status: 'Awaiting Payment' | 'Pending' | 'Tested';
  testedDate?: Date;
  mfiResult?: number; // MFI test result value
  isSyncedSalesForce: boolean;
  lastSyncedSalesForceDate?: Date;
  salesforceId?: string;
  createdAt: Date;
  updatedAt: Date;
  materialName: string;
  adminNote?: AdminNote;
  assignAdmin?: AssignAdmin;
  listing: Listing;
  buyerUser: UserInfor;
  buyerCompany: Company;
  sellerUser: UserInfor;
  sellerCompany: Company;
}

export interface GetMfiParams extends GetMembersParams {}
export interface GetMfiResponse {
  status: string;
  message: string;
  data: {
    results: MfiRequestItem[];
    totalCount: number;
    limit: number;
    skip: number;
  };
}

export enum MemberRequestActionEnum {
  ACCEPT = 'approve',
  REJECT = 'reject',
  REQUEST_INFORMATION = 'request_info',
}

export type MemberRequestActionParams = {
  reject_reason?: string;
  message?: string;
};

export interface CreateAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  globalRole: string;
  phoneNumber: string;
}

export interface CreateAdminResponse {
  status: string;
  message: string;
  data: {
    id: number;
  };
}

export interface GetHaulageBidParams {
  page: number;
  pageSize: number;
  [key: string]: any;
}
export interface GetHaulageBidResponse {
  status: string;
  message: string;
  data: {
    results: HaulageBidItem[];
    totalCount: number;
  };
}

export interface GetHaulageBidDetailResponse {
  status: string;
  message: string;
  data: HaulageBidDetail;
}

export interface EditAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  globalRole: string;
  phoneNumber: string;
}

export interface EditAdminResponse {
  status: string;
  message: string;
  data: {
    createdAt: string;
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    globalRole: string;
    status: string;
    lastLoginAt: string;
  };
}

export interface GetHaulierFilterParams {
  search?: string;
  skip?: number;
  limit?: number;
}

export interface HaulierListItem {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: number;
  companyName: string;
  containerTypes: string[];
}

export interface GetHaulierListResponse {
  status: string;
  message: string;
  data: {
    results: HaulierListItem[];
    totalCount: number;
  };
}

export interface AdminMakeOfferRequest extends HaulageMakeOfferRequest {
  haulierUserId: number;
  haulierCompanyId: number;
}

export interface AdminMakeOfferResponse extends HaulageMakeOfferRequest {
  createdAt: string;
  updatedAt: string;
  id: number;
  status: string;
  isSyncedSalesForce: boolean;
}

// Haulage Loads
export interface HaulageLoad {
  id: number;
  loadNumber: string;
  collectionDate: string | null;
  shippedDate: string | null;
  grossWeight: string | null;
  palletWeight: string | null;
  loadStatus: string | null;
  haulageOfferId: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetHaulageLoadsResponse {
  status: string;
  message: string;
  data: HaulageLoad[];
}
