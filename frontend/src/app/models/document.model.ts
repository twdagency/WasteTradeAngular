import { CompanyDocument } from './auth.model';

export enum CompanyDocumentType {
  EnvironmentalPermit = 'environmental_permit',
  WasteExemption = 'waste_exemption',
  WasteCarrierLicense = 'carrier_license',
}

export enum DocumentStatus {
  Active = 'active',
  Pending = 'pending',
  Expired = 'expired',
}
export interface UpdateDocumentPayload {
  id?: number;
  documentType: CompanyDocumentType;
  documentName: string;
  documentUrl: string;
  status: DocumentStatus;
}

export interface UpdateDocumentResponse {
  status: string;
  message: string;
  data: CompanyDocument[];
}
