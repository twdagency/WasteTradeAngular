import {
  mapCodeToMaterialFinishing,
  mapCodeToMaterialForm,
  mapCodeToMaterialGrading,
  mapCodeToMaterialItem,
  mapCountryCodeToName,
  materialTypes,
} from '@app/statics';
import {
  CompanyLocationDetail,
  CompanyStatus,
  ListingDocument,
  ListingImageType,
  ListingState,
  ListingStatus,
} from 'app/models';
import { Location } from 'app/models/admin/commercial.model';
import { OfferState, OfferStatus } from 'app/models/offer';

export const getLocationAddress = (location: CompanyLocationDetail | Location) => {
  const data = [
    location?.addressLine ?? location.street,
    location?.stateProvince,
    location?.city,
    location?.country ? mapCountryCodeToName[location?.country] : '',
  ].filter((i) => !!i);
  return data.join(', ');
};

export const formatDecimalNumber = (number: number, amount = 2): string => {
  return Number.isInteger(number) ? number.toString() : number.toFixed(amount).replace(/\.?0+$/, '');
};

export const getMaterialTypeLabel = (type: string) => {
  return materialTypes.find((i) => i.code === type)?.name;
};

export const getOfferStateColor = (state: OfferState) => {
  switch (state) {
    case OfferState.ACTIVE:
      return '#03985C';
    case OfferState.CLOSED:
      return '#D75A66';
    case OfferState.PENDING:
      return '#F9A52B';
    default:
      return '#03985C';
  }
};

export const getOfferStatusColor = (state: OfferStatus) => {
  switch (state) {
    case OfferStatus.ACCEPTED:
      return '#03985C';
    case OfferStatus.REJECTED:
      return '#D75A66';
    case OfferStatus.PENDING:
      return '#F9A52B';
    default:
      return '#03985C';
  }
};

export const getListingStateColor = (state: ListingState) => {
  switch (state) {
    case ListingState.APPROVED:
      return '#03985C';
    case ListingState.REJECTED:
      return '#D75A66';
    case ListingState.PENDING:
      return '#F9A52B';
    default:
      return '#03985C';
  }
};

export const getListingStatusColor = (state: ListingStatus) => {
  switch (state) {
    case ListingStatus.SOLD:
    case ListingStatus.AVAILABLE:
      return '#03985C';
    case ListingStatus.EXPIRED:
    case ListingStatus.REJECTED:
      return '#D75A66';
    case ListingStatus.PENDING:
      return '#F9A52B';
    default:
      return '#03985C';
  }
};

export const getCompanyStatusColor = (state?: CompanyStatus) => {
  switch (state) {
    case CompanyStatus.VERIFIED:
      return '#03985C';
    case CompanyStatus.REJECTED:
      return '#D75A66';
    case CompanyStatus.PENDING_VERIFICATION:
      return '#F9A52B';
    default:
      return '#03985C';
  }
};

export const getCompanyStatusLabel = (state?: CompanyStatus) => {
  switch (state) {
    case CompanyStatus.VERIFIED:
      return 'Verified';
    case CompanyStatus.REJECTED:
      return 'Rejected';
    case CompanyStatus.PENDING_VERIFICATION:
      return 'Pending Verification';
    default:
      return '';
  }
};

export const getCurrencySignal = (currency: string) => {
  switch (currency) {
    case 'gbp':
      return '£';
    case 'usd':
      return '$';
    case 'eur':
      return '€';
    default:
      return '';
  }
};

export const getCurrencyLabel = (currency: string) => {
  switch (currency) {
    case 'gbp':
      return 'Pounds';
    case 'usd':
      return 'Usd';
    case 'eur':
      return 'Euro';
    default:
      return '';
  }
};

export const getListingTitle = (listing: {
  materialForm?: string;
  materialItem?: string;
  materialFinishing?: string;
  material?: string;
  materialGrading?: string;
  materialType?: string;
}) => {
  if (listing.materialType === 'metal' || listing.materialType === 'rubber') {
    return mapCodeToMaterialItem[listing.materialItem ?? ''];
  }

  if (listing.materialType === 'fibre') {
    const data = [
      mapCodeToMaterialGrading[listing.materialGrading ?? ''],
      mapCodeToMaterialItem[listing.materialItem ?? ''],
    ]
      .filter((i) => !!i)
      .join(' - ');

    return data;
  }

  if (listing.materialType === 'efw') {
    return 'EFW';
  }

  const data = [
    mapCodeToMaterialItem[listing.materialItem ?? ''],
    mapCodeToMaterialForm[listing.materialForm ?? ''],
    mapCodeToMaterialFinishing[listing.materialFinishing ?? ''],
  ]
    .filter((i) => !!i)
    .join(' - ');

  return data;
};

export const getListingFeatureImage = (documents: ListingDocument[]) => {
  return documents.find((d) => d.documentType === ListingImageType.FEATURE_IMAGE)?.documentUrl;
};
