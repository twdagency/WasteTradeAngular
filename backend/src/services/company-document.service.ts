import { BindingScope, inject, injectable } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { MyUserProfile } from '../authentication-strategies/type';
import { messages } from '../constants';
import { formatDateDocument, messagesOfCompanyDocument } from '../constants/company-document';
import { CompanyDocumentStatus, CompanyUserRoleEnum, UserStatus } from '../enum';
import { CompanyDocuments } from '../models';
import { SalesforceBindings } from '../keys/salesforce';
import { SalesforceLogger } from '../utils/salesforce/salesforce-sync.utils';
import { CompanyDocumentsRepository, CompanyUsersRepository } from '../repositories';
import { CompaniesRepository } from '../repositories/companies.repository';
import { IDataResponse } from '../types';
import { validateDate, parseDateToISO } from '../utils';
import { SalesforceSyncService } from './salesforce/salesforce-sync.service';
import { OnboardingCompanyDocs } from './../models/onboarding-company-docs.model';

@injectable({ scope: BindingScope.TRANSIENT })
export class CompanyDocumentService {
    constructor(
        @repository(CompanyDocumentsRepository)
        public companyDocumentsRepository: CompanyDocumentsRepository,

        @repository(CompanyUsersRepository)
        public companyUserRepository: CompanyUsersRepository,

        @repository(CompaniesRepository)
        public companiesRepository: CompaniesRepository,

        @inject(SalesforceBindings.SYNC_SERVICE, { optional: true })
        private salesforceSyncService?: SalesforceSyncService,
    ) {}

    public async createCompanyDocument(
        onboardingCompanyDocs: OnboardingCompanyDocs,
        userProfile: MyUserProfile,
    ): Promise<IDataResponse> {
        const userId = userProfile.id;
        const companyId = userProfile.companyId;

        const companyUser = await this.companyUserRepository.findOne({
            where: {
                userId: userId,
                companyId: companyId,
                companyRole: CompanyUserRoleEnum.ADMIN,
            },
        });

        if (!companyUser || companyUser === null) {
            throw new HttpErrors[401](messages.unauthorized);
        }

        const existingDocuments = await this.companyDocumentsRepository.find({
            where: {
                companyId: companyId,
            },
        });

        if (existingDocuments && existingDocuments.length > 0) {
            await this.companyDocumentsRepository.deleteAll({
                companyId: companyId,
            });
        }
        const companyDocumentData: CompanyDocuments[] = [];
        for (const document of onboardingCompanyDocs.documents) {
            if (document?.expiryDate) {
                if (!validateDate(document.expiryDate, formatDateDocument)) {
                    throw new HttpErrors[422](messages.invalidExpiryDate);
                }
            }
            const companyDocument = await this.companyDocumentsRepository.create({
                uploadedByUserId: Number(userId),
                companyId: companyId,
                documentType: document.documentType,
                documentName: document.documentType,
                documentUrl: document.documentUrl,
                expiryDate: parseDateToISO(document.expiryDate) ?? undefined,
                status: CompanyDocumentStatus.PENDING,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            companyDocumentData.push(companyDocument);

            // Trigger Salesforce sync after successful document creation (fire-and-forget)
            if (this.salesforceSyncService && companyDocument.id) {
                this.salesforceSyncService.syncCompanyDocument(companyDocument.id, true, false, 'createCompanyDoc').catch((err) => {
                    SalesforceLogger.error('Sync failed after company document creation', err, { entity: 'CompanyDocument', documentId: companyDocument.id, action: 'create' });
                });
            }
        }

        if (onboardingCompanyDocs.boxClearingAgent) {
            const company = await this.companiesRepository.findOne({
                where: {
                    id: companyId,
                },
            });

            if (company) {
                company.boxClearingAgent = onboardingCompanyDocs.boxClearingAgent;
                await this.companiesRepository.updateById(companyId, company);
            }
        }

        return {
            status: 'success',
            message: messagesOfCompanyDocument.createCompanyDocumentSuccess,
            data: {
                companyDocument: companyDocumentData,
            },
        };
    }

    public async updateCompanyDocuments(
        companyDocuments: CompanyDocuments[],
        companyId: number,
        userId: number,
    ): Promise<IDataResponse<CompanyDocuments[]>> {
        // Verify user has permission
        const companyUser = await this.companyUserRepository.findOne({
            where: {
                userId: userId,
                companyId: companyId,
                companyRole: CompanyUserRoleEnum.ADMIN,
            },
            include: ['user'],
        });

        if (!companyUser) {
            throw new HttpErrors[403](messages.forbidden);
        }

        // Get existing documents
        const existingDocuments = await this.companyDocumentsRepository.find({
            where: {
                companyId: companyId,
            },
        });

        const resultDocuments: CompanyDocuments[] = [];
        const documentsToKeep: number[] = [];

        // Process each document in request
        for (const document of companyDocuments) {
            // Validate expiry date if provided
            if (document?.expiryDate) {
                if (!validateDate(document.expiryDate, formatDateDocument)) {
                    throw new HttpErrors[422](messages.invalidExpiryDate);
                }
            }
            let newStatus = CompanyDocumentStatus.PENDING;

            switch (companyUser?.user?.status) {
                case UserStatus.ACTIVE:
                    newStatus = CompanyDocumentStatus.ACTIVE;
                    break;
                case UserStatus.REJECTED:
                    newStatus = CompanyDocumentStatus.REJECTED;
                    break;
                case UserStatus.REQUEST_INFORMATION:
                    newStatus = CompanyDocumentStatus.REQUEST_INFORMATION;
                    break;

                default:
                    break;
            }

            if (document.id) {
                // Update existing document
                const existingDoc = existingDocuments.find((doc) => doc.id === document.id);
                if (!existingDoc) {
                    throw new HttpErrors[404](`Document with ID ${document.id} not found`);
                }

                // // Check if document content has actually changed
                // const hasContentChanged =
                //     existingDoc.documentType !== document.documentType ||
                //     existingDoc.documentName !== document.documentName ||
                //     existingDoc.documentUrl !== document.documentUrl ||
                //     existingDoc.expiryDate !== document.expiryDate;

                // // Only change status to PENDING if content has changed, otherwise preserve existing status
                // const newStatus = hasContentChanged ? CompanyDocumentStatus.PENDING : existingDoc.status;

                await this.companyDocumentsRepository.updateById(document.id, {
                    documentType: document.documentType,
                    documentName: document.documentName,
                    documentUrl: document.documentUrl,
                    expiryDate: parseDateToISO(document.expiryDate) ?? undefined,
                    status: newStatus,
                    updatedAt: new Date().toISOString(),
                });

                // Get updated document
                const updatedDoc = await this.companyDocumentsRepository.findById(document.id);
                resultDocuments.push(updatedDoc);
                documentsToKeep.push(document.id);
            } else {
                const newDocument = await this.companyDocumentsRepository.create({
                    uploadedByUserId: Number(userId),
                    companyId: companyId,
                    documentType: document.documentType,
                    documentName: document.documentName,
                    documentUrl: document.documentUrl,
                    expiryDate: parseDateToISO(document.expiryDate) ?? undefined,
                    status: newStatus,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
                resultDocuments.push(newDocument);
                if (newDocument.id) {
                    documentsToKeep.push(newDocument.id);
                }
            }
        }

        // Delete documents not in request
        const documentsToDelete = existingDocuments.filter((doc) => doc.id && !documentsToKeep.includes(doc.id));

        for (const docToDelete of documentsToDelete) {
            if (docToDelete.id) {
                await this.companyDocumentsRepository.deleteById(docToDelete.id);
            }
        }

        return {
            status: 'success',
            message: messagesOfCompanyDocument.updateCompanyDocumentSuccess,
            data: resultDocuments,
        };
    }
}
