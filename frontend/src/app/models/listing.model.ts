import { AssignAdmin } from 'app/share/ui/admin/commercial/admin-member/assign-type/asign-type';
import { AdminNote } from 'app/share/ui/notes/types/notes';
import { Currency } from './currency';
import { ListingState, ListingStatus } from './listing-material.model';
import { Companies } from './purchases.model';

export interface CreatedBy {
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
  location: {
    id?: number;
    locationName?: string;
    country: string;
  };
}

export interface SellListingDetail {
  id: number;
  created_by_user_id: number;
  listing_type: 'sell' | 'buy' | 'wanted';
  title: string;
  description: string | null;
  quantity: number;
  currency: Currency | null;
  additional_notes: string | null;
  status: ListingStatus;
  is_featured: boolean;
  is_urgent: boolean;
  view_count: number | null;
  created_at: string;
  updated_at: string;
  company_id: number;
  material_type: string;
  material_item: string;
  material_form: string;
  material_grading: string;
  material_color: string;
  material_finishing: string;
  material_packing: string;
  country: string;
  remaining_quantity: number | null;
  material_flow_index: string;
  material_weight_per_unit: number | null;
  material_remain_in_country: boolean;
  start_date: string;
  end_date: string | null;
  capacity_per_month: number;
  material_weight_wanted: number;
  waste_storation: string;
  renewal_period: string;
  listing_duration: number | null;
  location_id: number;
  state: ListingState;
  rejection_reason: string | null;
  message: string | null;
  pricePerMetricTonne: string;
  location_other: string;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  location_name: string;
  numberOfOffers: number;
  bestOffer: any | null;
  bestOfferCurrency?: string;
  createdBy: CreatedBy;
  adminNote?: AdminNote;
  assignAdmin?: AssignAdmin;
}

export interface SellListingResponse {
  totalCount: number;
  results: SellListingDetail[];
}

export interface SellerCompaniesResponse {
  status: string;
  message: string;
  data: { companies: Companies[] };
}
