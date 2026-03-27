import { AdminNote } from 'app/share/ui/notes/types/notes';
import { ListingState } from './listing-material.model';
import { SellListingDetail } from './listing.model';
import { Companies } from './purchases.model';

export enum WantedListingSortBy {
  COMPANY_NAME_ASC = 'companyNameAsc',
  COMPANY_NAME_DESC = 'companyNameDesc',
  MATERIAL_TYPE_ASC = 'materialTypeAsc',
  MATERIAL_TYPE_DESC = 'materialTypeDesc',
  COUNTRY_ASC = 'countryAsc',
  COUNTRY_DESC = 'countryDesc',
}

export interface WantedCompanies extends Companies {
  first_name: string;
  last_name: string;
}

export interface WantedCompaniesResponse {
  message: string;
  status: string;
  data: {
    companies: WantedCompanies[];
  };
}

export type WantedCompaniesDetail = WantedCompaniesResponse['data'];

export interface WantedListingFilter {
  limit: number;
  skip: number;
  where: {
    listingType: 'wanted';
    firstName: string;
    lastName: string;
    company: string;
    country: string;
    materialType: string;
    searchTerm: string;
    sortBy: WantedListingSortBy;
    status: string;
    state: string;
  };
}

export interface WantedListingDetail
  extends Omit<
    SellListingDetail,
    'listing_type' | 'title' | 'location_id' | 'state' | 'location_name' | 'price_per_metric_tonne' | 'location_other'
  > {
  listing_type: 'wanted';
  title: string | null;
  location_id: number | null;
  state: ListingState;
  location_name: string | null;
  price_per_metric_tonne?: number | null;
  location_other?: string | null;
  adminNote: AdminNote;
}

export interface WantedListingResponse {
  totalCount: number;
  results: WantedListingDetail[];
}
