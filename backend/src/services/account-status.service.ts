import { BindingScope, injectable } from '@loopback/core';
import { repository } from '@loopback/repository';
import { BANNER_MESSAGES } from '../config/banner-messages';
import { CompanyDocumentStatus, CompanyStatus } from '../enum';
import {
    CompaniesRepository,
    CompanyDocumentsRepository,
    CompanyLocationsRepository,
    CompanyUsersRepository,
    UserRepository,
} from '../repositories';

export interface AccountStatusResult {
    showBanner: boolean;
    bannerType?: 'incomplete_onboarding' | 'verification_pending' | 'verification_failed' | 'document_expiring';
    message: string;
    documentDetails?: {
        name: string;
        expiryDate: string;
        daysRemaining: number;
    };
}

@injectable({ scope: BindingScope.TRANSIENT })
export class AccountStatusService {
    constructor(
        @repository(UserRepository)
        public userRepository: UserRepository,
        @repository(CompaniesRepository)
        public companiesRepository: CompaniesRepository,
        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,
        @repository(CompanyDocumentsRepository)
        public companyDocumentsRepository: CompanyDocumentsRepository,
        @repository(CompanyLocationsRepository)
        public companyLocationsRepository: CompanyLocationsRepository,
    ) {}

    async getAccountStatus(userId: number): Promise<AccountStatusResult> {
        // Get company data for the user (banner messages are company-centric)
        const companyUser = await this.companyUsersRepository.findOne({
            where: { userId },
            include: ['company'],
        });

        if (!companyUser || !companyUser.company) {
            return {
                showBanner: false,
                message: 'No company associated with user',
            };
        }

        const company = companyUser.company;

        // PRIORITY 1: Check company verification status FIRST (per task requirement)
        // If rejected by admin, show verification failed regardless of missing documents/locations
        if (company.status === CompanyStatus.REJECTED) {
            const config = BANNER_MESSAGES.verificationFailed;
            return {
                showBanner: true,
                bannerType: 'verification_failed',
                message: config.message,
            };
        }

        if (company.status === CompanyStatus.REQUEST_INFORMATION) {
            const config = BANNER_MESSAGES.verificationFailed;
            return {
                showBanner: true,
                bannerType: 'verification_failed',
                message: company.adminMessage ?? config.message,
            };
        }

        // PRIORITY 2: Check for incomplete onboarding (only if not rejected by admin)
        const onboardingStatus = await this.checkOnboardingCompletion(company.id!);
        if (!onboardingStatus.isComplete && company.status !== CompanyStatus.ACTIVE) {
            const config = BANNER_MESSAGES.incompleteOnboarding;
            return {
                showBanner: true,
                bannerType: 'incomplete_onboarding',
                message: config.message,
            };
        }

        // PRIORITY 3: Check for document expiry (30 days warning)
        const expiringDoc = await this.checkDocumentExpiry(company.id!);
        if (expiringDoc) {
            const config = BANNER_MESSAGES.documentExpiring;
            return {
                showBanner: true,
                bannerType: 'document_expiring',
                message: config.message
                    .replace('{documentName}', expiringDoc.name)
                    .replace('{expiryDate}', expiringDoc.expiryDate),
                documentDetails: expiringDoc,
            };
        }

        // PRIORITY 4: Check for pending verification status
        if (company.status === CompanyStatus.PENDING) {
            const config = BANNER_MESSAGES.verificationPending;
            return {
                showBanner: true,
                bannerType: 'verification_pending',
                message: config.message,
            };
        }

        // No banner needed
        return {
            showBanner: false,
            message: 'Account is active and complete',
        };
    }

    private async checkOnboardingCompletion(
        companyId: number,
    ): Promise<{ isComplete: boolean; missingSteps: string[] }> {
        const missingSteps: string[] = [];

        const company = await this.companiesRepository.findById(companyId);

        if (company?.isHaulier) {
            return {
                isComplete: true,
                missingSteps: [],
            };
        }

        const [documents, locations] = await Promise.all([
            this.companyDocumentsRepository.find({ where: { companyId } }),
            this.companyLocationsRepository.find({ where: { companyId } }),
        ]);

        // Step 1: Company information complete (VAT number is a good indicator)
        if (!company.vatNumber) {
            missingSteps.push('company_information');
        }

        // Step 2: Documents uploaded
        if (!documents || documents.length === 0) {
            missingSteps.push('company_documents');
        }

        // Step 3: Locations added (optional for some company types, but good to check)
        if (!locations || locations.length === 0) {
            missingSteps.push('site_locations');
        }

        return {
            isComplete: missingSteps.length === 0,
            missingSteps,
        };
    }

    private async checkDocumentExpiry(
        companyId: number,
    ): Promise<{ name: string; expiryDate: string; daysRemaining: number } | null> {
        const documents = await this.companyDocumentsRepository.find({
            where: {
                companyId,
            },
        });

        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        for (const doc of documents) {
            if (doc.expiryDate) {
                const expiryDate = this.parseDocumentDate(doc.expiryDate);

                // Check if document expires within 30 days
                if (expiryDate && expiryDate >= now && expiryDate <= thirtyDaysFromNow) {
                    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                    return {
                        name: this.getDocumentDisplayName(doc.documentType ?? '', doc.documentName ?? ''),
                        expiryDate: this.formatDate(expiryDate),
                        daysRemaining,
                    };
                }
            }
        }

        return null;
    }

    private parseDocumentDate(dateString: string): Date | null {
        try {
            // Try DD/MM/YYYY format first
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
                const year = parseInt(parts[2], 10);
                return new Date(year, month, day);
            }

            // Fallback to standard Date parsing
            return new Date(dateString);
        } catch {
            return null;
        }
    }

    private formatDate(date: Date): string {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    private getDocumentDisplayName(documentType: string, documentName: string): string {
        const typeDisplayNames: { [key: string]: string } = {
            ENVIRONMENTAL_PERMIT: 'Environmental Permit',
            WASTE_EXEMPTION: 'Waste Exemption',
            WASTE_CARRIER_LICENSE: 'Waste Carrier License',
            other: documentName ?? 'Document',
        };

        return typeDisplayNames[documentType] ?? documentName ?? documentType;
    }
}
