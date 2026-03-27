import { AssignAdmin } from 'app/share/ui/admin/commercial/admin-member/assign-type/asign-type';
import { AdminNote } from 'app/share/ui/notes/types/notes';
import { OfferState, OfferStatus } from './offer';

export interface PurchaseFilterParams {
  skip?: number;
  limit?: number;
  where: {
    buyerName?: string;
    sellerName?: string;
    searchTerm?: string;
    materialType?: string[];
    materialPacking?: string;
    location?: string;
    status?: string;
    state?: string;
    sortBy?: string;
  };
}

export interface Purchase {
  offer: Offer;
  listing: Listing;
  buyer: Buyer;
  seller: Seller;
  numberOfHaulageOffers: number;
}

export interface PurchaseResponse {
  totalCount: number;
  results: Purchase[];
}

interface Offer {
  id: number;
  createdAt: string;
  quantity: number;
  offeredPricePerUnit: number;
  totalPrice: number;
  status: OfferStatus;
  state: OfferState;
  expiresAt: string | null;
  earliestDeliveryDate: string | null;
  latestDeliveryDate: string | null;
  currency: string | null;
  message: string | null;
  rejectionReason: string | null;
  incoterms: string | null;
  shippingPort: string | null;
  needsTransport: true;
  listingId: number;
  buyerCompanyId: number;
  buyerLocationId: string | null;
  buyerUserId: number;
  buyerCountry: string;
  sellerCompanyId: string;
  sellerLocationId: string | null;
  sellerUserId: string | null;
  sellerCountry: string | null;
  acceptedByUserId: number;
  rejectedByUserId: number;
  createdByUserId: number;
  updatedAt: '2025-05-17T17:00:00.000Z';
  adminNote?: AdminNote | null;
  assignAdmin?: AssignAdmin | null;
  hasAcceptedHaulageOffer?: boolean;
  acceptedHaulageOfferId?: number | null;
  haulageOffersCount?: number;
}

interface Listing {
  id: 350;
  materialFinishing: string;
  materialForm: string;
  materialItem: string;
  materialPacking: string;
  materialType: string;
  materialWeightPerUnit: number | null;
  materialWeightWanted: number;
  materialGrading: string;
  quantity: number;
  remainingQuantity: number;
  state: OfferState;
  status: OfferStatus;
  title: string | null;
}

interface Buyer {
  user: {
    id: number;
    username: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  company: {
    id: number;
    name: string;
  };
  country: string | null;
  location: { city: string; country: string; id: number; locationName: string };
}

interface Seller extends Buyer {}

export interface Companies {
  id: string;
  name: string;
  country: string;
}

export interface CompaniesResponse {
  message: string;
  status: string;
  data: {
    buyerCompanies: Companies[];
    sellerCompanies: Companies[];
  };
}

export type CompaniesDetail = CompaniesResponse['data'];
