import { Company } from './auth.model';

export interface UpdateProfilePayload {
  prefix?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
}

export interface UpdateCompanyPayload extends Partial<Company> {}
