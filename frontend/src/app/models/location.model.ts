import { IDocument } from './listing-material-detail.model';

export interface CompanyLocationDetail {
  id: number;
  locationName: string;
  mainLocation: boolean;
  prefix?: string;
  firstName: string;
  lastName: string;
  positionInCompany: string;
  sitePointContact?: string | null;
  phoneNumber: string;
  addressLine: string;
  street?: string;
  postcode: string;
  city: string;
  country: string;
  stateProvince: string;
  officeOpenTime: string;
  officeCloseTime: string;
  loadingRamp: boolean;
  weighbridge: boolean | null;
  containerType: string[];
  selfLoadUnLoadCapability: boolean;
  accessRestrictions: string;
  siteSpecificInstructions: string | null;
  acceptedMaterials: string[] | null;
  otherMaterial: string | null;
  createdAt: string;
  updatedAt: string;
  companyId: number;
  companyLocationDocuments: IDocument[];
}

export interface CompanyLocationResponse {
  totalCount: number;
  results: CompanyLocationDetail[];
}

// Trailer types only (WT doesn't use containers) - matches SF trailer_type__c picklist
export enum TrailerType {
  CURTAIN_SIDER = 'Curtain Sider',
  CONTAINERS = 'Containers',
  TIPPER_TRUCKS = 'Tipper Trucks',
  WALKING_FLOOR = 'Walking Floor',
}

// Keep ContainerType as alias for backward compatibility
export const ContainerType = TrailerType;

export const TrailerTypeList = [
  { name: 'Curtain Sider', value: TrailerType.CURTAIN_SIDER },
  { name: 'Containers', value: TrailerType.CONTAINERS },
  { name: 'Tipper Trucks', value: TrailerType.TIPPER_TRUCKS },
  { name: 'Walking Floor', value: TrailerType.WALKING_FLOOR },
];

// Keep ContainerTypeList as alias for backward compatibility
export const ContainerTypeList = TrailerTypeList;

export const mapLocationContainerCodeToName = TrailerTypeList.reduce(
  (memo, item) => {
    memo[item.value] = item.name;
    return memo;
  },
  {
    // Legacy values for backward compatibility
    curtain_slider_standard: 'Curtain Sider',
    shipping_container: 'Containers',
    walking_floor: 'Walking Floor',
    tipperTrucks: 'Tipper Trucks',
  } as Record<string, string>,
);

export interface UpdateCompanyLocationPayload extends Partial<CompanyLocationDetail> {}

export interface AddCompanyLocationResponse {
  status: string;
  message: string;
  data: {
    companyLocation: Omit<CompanyLocationDetail, 'companyLocationDocuments'>;
    companyLocationDocuments: IDocument[];
  };
}
