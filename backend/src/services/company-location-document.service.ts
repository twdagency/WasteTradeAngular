import { BindingScope, inject, injectable } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { messages } from '../constants';
import { formatDateDocument, messagesOfCompanyLocationDocument } from '../constants/company-location-document';
import { CompanyLocationDocumentStatus, CompanyUserRoleEnum } from '../enum';
import { CompanyLocationDocuments } from '../models';
import { SalesforceBindings } from '../keys/salesforce';
import { SalesforceLogger } from '../utils/salesforce/salesforce-sync.utils';
import {
    CompanyLocationDocumentsRepository,
    CompanyLocationsRepository,
    CompanyUsersRepository,
} from '../repositories';
import { IDataResponse } from '../types';
import { validateDate, parseDateToISO } from '../utils';
import { SalesforceSyncService } from './salesforce/salesforce-sync.service';

@injectable({ scope: BindingScope.TRANSIENT })
export class CompanyLocationDocumentService {
    constructor(
        @repository(CompanyLocationDocumentsRepository)
        public companyLocationDocumentsRepository: CompanyLocationDocumentsRepository,

        @repository(CompanyUsersRepository)
        public companyUserRepository: CompanyUsersRepository,

        @repository(CompanyLocationsRepository)
        public companyLocationsRepository: CompanyLocationsRepository,

        @inject(SalesforceBindings.SYNC_SERVICE, { optional: true })
        private salesforceSyncService?: SalesforceSyncService,
    ) {}

    public async updateCompanyLocationDocuments(
        companyLocationDocuments: CompanyLocationDocuments[] = [],
        companyLocationId: number,
        userId: number,
    ): Promise<IDataResponse<{ companyLocationDocuments: CompanyLocationDocuments[] }>> {
        // First, get the company location to verify ownership
        const companyLocation = await this.companyLocationsRepository.findById(companyLocationId);

        if (!companyLocation) {
            throw new HttpErrors[404]('Company location not found');
        }

        // Verify user has permission
        const companyUser = await this.companyUserRepository.findOne({
            where: {
                userId: userId,
                companyId: companyLocation.companyId,
                companyRole: CompanyUserRoleEnum.ADMIN,
            },
        });

        if (!companyUser) {
            throw new HttpErrors[403](messages.forbidden);
        }

        // Get existing documents
        const existingDocuments = await this.companyLocationDocumentsRepository.find({
            where: {
                companyLocationId: companyLocationId,
            },
        });

        const resultDocuments: CompanyLocationDocuments[] = [];
        const documentsToKeep: number[] = [];

        // Process each document in request
        for (const document of companyLocationDocuments) {
            // Validate expiry date if provided
            if (document?.expiryDate !== undefined) {
                if (!validateDate(document.expiryDate, formatDateDocument)) {
                    throw new HttpErrors[422](messages.invalidExpiryDate);
                }
            }

            if (document.id) {
                // Update existing document
                const existingDoc = existingDocuments.find((doc) => doc.id === document.id);
                if (!existingDoc) {
                    throw new HttpErrors[404](`Document with ID ${document.id} not found`);
                }

                // Check if document content has actually changed
                const hasContentChanged =
                    existingDoc.documentType !== document.documentType ||
                    existingDoc.documentName !== document.documentName ||
                    existingDoc.documentUrl !== document.documentUrl ||
                    existingDoc.expiryDate !== document.expiryDate;

                // Only change status to PENDING if content has changed, otherwise preserve existing status
                const newStatus = hasContentChanged ? CompanyLocationDocumentStatus.PENDING : existingDoc.status;

                await this.companyLocationDocumentsRepository.updateById(document.id, {
                    documentType: document.documentType,
                    documentName: document.documentName,
                    documentUrl: document.documentUrl,
                    expiryDate: parseDateToISO(document.expiryDate) ?? undefined,
                    status: newStatus,
                    updatedAt: new Date().toISOString(),
                });

                // Get updated document
                const updatedDoc = await this.companyLocationDocumentsRepository.findById(document.id);
                resultDocuments.push(updatedDoc);
                documentsToKeep.push(document.id);
            } else {
                // Create new document - always set to PENDING for new documents
                const newDocument = await this.companyLocationDocumentsRepository.create({
                    uploadedByUserId: Number(userId),
                    companyLocationId: companyLocationId,
                    documentType: document.documentType,
                    documentName: document.documentName,
                    documentUrl: document.documentUrl,
                    expiryDate: parseDateToISO(document.expiryDate) ?? undefined,
                    status: CompanyLocationDocumentStatus.PENDING,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
                resultDocuments.push(newDocument);
                if (newDocument.id) {
                    documentsToKeep.push(newDocument.id);
                }

                // Trigger Salesforce sync after successful document creation
                if (this.salesforceSyncService && newDocument.id) {
                    this.salesforceSyncService.syncLocationDocument(newDocument.id, true, false, 'createLocationDoc').catch((syncError) => {
                        SalesforceLogger.error('Sync failed after location document creation', syncError, { entity: 'CompanyLocationDocument', documentId: newDocument.id, action: 'create' });
                    });
                }
            }
        }

        // Delete documents not in request
        const documentsToDelete = existingDocuments.filter((doc) => doc.id && !documentsToKeep.includes(doc.id));

        for (const docToDelete of documentsToDelete) {
            if (docToDelete.id) {
                await this.companyLocationDocumentsRepository.deleteById(docToDelete.id);
            }
        }

        return {
            status: 'success',
            message: messagesOfCompanyLocationDocument.updateCompanyLocationDocumentSuccess,
            data: {
                companyLocationDocuments: resultDocuments,
            },
        };
    }
}
