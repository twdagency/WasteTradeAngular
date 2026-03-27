import { Currency } from '../currency';
import { HaulageOfferStatus, TransportProvider } from '../haulage.model';

export interface HaulagePartySummary {
  id: number;
  companyName: string;
  firstName: string;
  lastName: string;
  pricePerMetricTonne: string;
  locationId: number;
  username: string;
}

export interface HaulageListingSummary {
  id: number;
  materialItem: string;
  materialType: string;
  materialPacking: string;
  incoterms: string;
  pickupLocation: string;
  destinationLocation: string;
}

export interface HaulageOfferSummary {
  quantity: number;
  pricePerMetricTonne: number;
  currency: Currency;
  earliestDeliveryDate: string;
  latestDeliveryDate: string;
}

export enum StatusColor {
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
  INFO = 'info',
  SECONDARY = 'secondary',
}

export interface HaulageBidItem {
  haulageOfferId: number;
  bidDate: string;
  status: string;
  formattedStatus: string;
  statusColor: StatusColor;

  numberOfLoads: number;
  quantityPerLoad: number;
  haulageTotal: number;
  currency: Currency;

  expectedTransitTime: string;
  transportProvider: TransportProvider;
  materialForm: string;
  materialFinishing: string;
  materialGrading: string;

  haulier: HaulagePartySummary;
  buyer: HaulagePartySummary;
  seller: HaulagePartySummary;

  listing: HaulageListingSummary;
  offer: HaulageOfferSummary;
  financial: HaulageFinancialDetail;
}

export interface HaulageBidSummary {
  numberOfLoads: number;
  currency: Currency;
  haulageBidAmount: number;
  quantityPerLoad: number;
  haulageTotal: number;
  status: string;
}

export interface HaulageSellerDetail extends HaulagePartySummary {
  email: string;
  pickupLocation: string;
  totalPrice: number;
}

export interface HaulageBuyerDeliveryWindow {
  earliest: string;
  latest: string;
}

export interface HaulageBuyerDetail extends HaulagePartySummary {
  email: string;
  destination: string;
  deliveryWindow: HaulageBuyerDeliveryWindow;
  bidAmount: number;
}

export interface HaulageHaulierDetail extends HaulagePartySummary {
  email: string;
  trailerContainerType: string;
  numberOfLoads: number;
  quantityPerLoad: number;
  haulageCostPerLoad: number;
  haulageTotal: number;
  transportProvider: TransportProvider;
  suggestedCollectionDate: string;
  expectedTransitTime: string;
  demurrageAtDestination: number;
  notes: string;
}

export interface HaulageMaterialDetail {
  name: string;
  type: string;
  form: string;
  grading: string;
  color: string;
  finishing: string;
  packing: string;
  incoterms: string;
  loadsRemaining: number;
  avgWeightPerLoad: number;
}

export interface HaulageFinancialBuyerOffer {
  bidValuePerMT: number;
  currency: string;
}

export interface HaulageFinancialSellerOffer {
  offerPerMT: number;
  total: number;
}

export interface HaulageFinancialDetail {
  totalWeight: number;
  bidTotal: number;
  currency: Currency;
  isPERNEligible: boolean;
  pernFee: number;
  finalSellerTotal: number;
  buyerOffer: HaulageFinancialBuyerOffer;
  sellerOffer: HaulageFinancialSellerOffer;
}

export interface HaulageLoadDetails {
  totalLoads: number;
  shippedLoads: number; // Response field from backend
  shippedDate: string | null;
}

export interface HaulageBidDetail {
  haulageOfferId: number;
  bidDate: string;
  status: HaulageOfferStatus;
  formattedStatus: string;
  statusColor: StatusColor;

  summary: HaulageBidSummary;
  seller: HaulageSellerDetail;
  buyer: HaulageBuyerDetail;
  haulier: HaulageHaulierDetail;
  material: HaulageMaterialDetail;
  financial: HaulageFinancialDetail;
  loadDetails: HaulageLoadDetails;
}

export function getStatusColor(status: StatusColor | undefined) {
  switch (status) {
    case StatusColor.SUCCESS:
      return '#03985C';
    case StatusColor.DANGER:
    case StatusColor.SECONDARY:
      return '#D75A66';
    case StatusColor.WARNING:
      return '#F9A52B';
    default:
      return '#03985C';
  }
}
