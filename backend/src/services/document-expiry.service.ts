import { BindingScope, injectable, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { CompanyDocumentStatus, NotificationType } from '../enum';
import dayjsTz from '../helpers/dayjsTz.helper';
import { CompanyDocumentsRepository, UserRepository } from '../repositories';
import { EmailService } from './email.service';
import { WasteTradeNotificationsService } from './waste-trade-notifications.service';

interface DocumentExpiryResult {
    errors: string[];
}

@injectable({ scope: BindingScope.TRANSIENT })
export class DocumentExpiryService {
    // Notification intervals in days before expiry
    private readonly NOTIFICATION_INTERVALS = [30, 20, 15, 10, 7, 5, 3, 0];
    // Email intervals (subset of notification intervals)
    private readonly EMAIL_INTERVALS = [30, 7, 0];

    constructor(
        @repository(CompanyDocumentsRepository)
        private companyDocumentsRepository: CompanyDocumentsRepository,
        @repository(UserRepository)
        private userRepository: UserRepository,
        @service(WasteTradeNotificationsService)
        private wasteTradeNotificationsService: WasteTradeNotificationsService,
        @service(EmailService)
        private emailService: EmailService,
    ) {}

    async checkDocumentExpiry(): Promise<DocumentExpiryResult> {
        const result: DocumentExpiryResult = {
            errors: [],
        };

        try {
            // Process company documents
            const companyDocsResult = await this.processCompanyDocuments();
            result.errors.push(...companyDocsResult.errors);

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            result.errors.push(`Document expiry check failed: ${errorMessage}`);
            return result;
        }
    }

    private async processCompanyDocuments(): Promise<DocumentExpiryResult> {
        const result: DocumentExpiryResult = {
            errors: [],
        };

        try {
            const currentDate = dayjsTz.utc().startOf('day');
            const companyDocuments = await this.companyDocumentsRepository.find({
                where: {
                    expiryDate: { neq: null },
                    status: { nin: [CompanyDocumentStatus.REJECTED] },
                },
            });

            for (const companyDocument of companyDocuments) {
                const dateFormatRegex = /^\d{2}\/\d{2}\/\d{4}$/;
                if (!companyDocument.expiryDate || !dateFormatRegex.test(companyDocument?.expiryDate)) {
                    continue;
                }

                try {
                    const expiryDate = dayjsTz.utc(companyDocument.expiryDate, 'DD/MM/YYYY');
                    const daysUntilExpiry = expiryDate.diff(currentDate, 'day');

                    for (const interval of this.NOTIFICATION_INTERVALS) {
                        if (interval === daysUntilExpiry) {
                            const user = await this.userRepository.findById(companyDocument.uploadedByUserId, {
                                fields: {
                                    firstName: true,
                                    email: true,
                                },
                            });

                            if (!user) {
                                continue;
                            }

                            await Promise.all([
                                this.wasteTradeNotificationsService.createNotification(
                                    companyDocument.uploadedByUserId,
                                    NotificationType.DOCUMENT_EXPIRY,
                                    {
                                        companyDocumentId: companyDocument.id,
                                        documentType: companyDocument.documentType,
                                        documentName: companyDocument.documentName,
                                        expiryDate: companyDocument.expiryDate,
                                    },
                                ),
                                this.EMAIL_INTERVALS.includes(daysUntilExpiry)
                                    ? this.emailService.sendDocumentExpiryEmail(user, companyDocument.expiryDate ?? '')
                                    : undefined,
                            ]);
                        }
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    result.errors.push(`Error processing document ${companyDocument.id}: ${errorMessage}`);
                }
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            result.errors.push(`Error processing company documents: ${errorMessage}`);
            return result;
        }
    }
}
