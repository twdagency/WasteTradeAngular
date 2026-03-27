import { BindingScope, injectable, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { CompanyDocumentsRepository, DataDraftRepository } from '../repositories';
import { S3WrapperService } from './s3-wrapper.service';
import dayjsTz from '../helpers/dayjsTz.helper';
import { COMPLETE_ACCOUNT_DRAFT_EXPIRED_DAYS } from '../config';

interface ExpiryResult {
    deleted: number;
    s3FilesDeleted: number;
    errors: string[];
}

interface DraftDocument {
    documentUrl?: string;
    documentType?: string;
    expiryDate?: string;
}

@injectable({ scope: BindingScope.TRANSIENT })
export class DataDraftExpiryService {
    // Default expiry: 31 days (matching COMPLETE_ACCOUNT_DRAFT_EXPIRED_DAYS)
    // Config value may contain suffix like '31d', so parseInt strips non-numeric chars
    private readonly EXPIRY_DAYS = parseInt(String(COMPLETE_ACCOUNT_DRAFT_EXPIRED_DAYS), 10) || 31;

    constructor(
        @repository(DataDraftRepository)
        private dataDraftRepository: DataDraftRepository,
        @repository(CompanyDocumentsRepository)
        private companyDocumentsRepository: CompanyDocumentsRepository,
        @service(S3WrapperService)
        private s3WrapperService: S3WrapperService,
    ) {}

    async deleteExpiredDrafts(): Promise<ExpiryResult> {
        const result: ExpiryResult = {
            deleted: 0,
            s3FilesDeleted: 0,
            errors: [],
        };

        try {
            const expiryDate = dayjsTz.utc().subtract(this.EXPIRY_DAYS, 'day').toDate();

            // Find all drafts that haven't been updated in EXPIRY_DAYS
            const expiredDrafts = await this.dataDraftRepository.find({
                where: {
                    updatedAt: { lt: expiryDate },
                },
            });

            console.log(`Found ${expiredDrafts.length} expired data drafts to delete`);

            // Delete expired drafts
            for (const draft of expiredDrafts) {
                try {
                    // Extract and delete S3 files before deleting draft
                    await this.handleDraftS3Files(draft.data, result);

                    // Delete draft
                    await this.dataDraftRepository.deleteById(draft.id);
                    result.deleted++;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    result.errors.push(`Failed to delete draft ${draft.id}: ${errorMessage}`);
                    console.error(`Error deleting draft ${draft.id}:`, errorMessage);
                }
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            result.errors.push(`Failed to query expired drafts: ${errorMessage}`);
            console.error('Error querying expired drafts:', errorMessage);
            return result;
        }
    }

    private async handleDraftS3Files(draftData: string, result: ExpiryResult): Promise<void> {
        try {
            const data = JSON.parse(draftData);
            const documentUrls: string[] = [];

            // Extract from selectedDocumentFile array
            if (Array.isArray(data.selectedDocumentFile)) {
                data.selectedDocumentFile.forEach((doc: DraftDocument) => {
                    if (doc.documentUrl) {
                        documentUrls.push(doc.documentUrl);
                    }
                });
            }

            // Extract from selectedWasteLicenceFile array
            if (Array.isArray(data.selectedWasteLicenceFile)) {
                data.selectedWasteLicenceFile.forEach((doc: DraftDocument) => {
                    if (doc.documentUrl) {
                        documentUrls.push(doc.documentUrl);
                    }
                });
            }

            // Process each document URL
            for (const documentUrl of documentUrls) {
                try {
                    // Check if documentUrl exists in company_documents
                    const existingDoc = await this.companyDocumentsRepository.findOne({
                        where: { documentUrl },
                    });

                    if (!existingDoc) {
                        // Document not in company_documents, delete from S3
                        const s3Key = this.extractS3KeyFromUrl(documentUrl);
                        if (s3Key) {
                            await this.s3WrapperService.deleteFile(s3Key);
                            result.s3FilesDeleted++;
                            console.log(`Deleted S3 file: ${s3Key}`);
                        }
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    result.errors.push(`Failed to delete S3 file ${documentUrl}: ${errorMessage}`);
                    console.error(`Error deleting S3 file ${documentUrl}:`, errorMessage);
                }
            }
        } catch (error) {
            // If JSON parse fails or data structure is invalid, just log and continue
            console.warn('Failed to parse draft data for S3 cleanup:', error);
        }
    }

    private extractS3KeyFromUrl(url: string): string | null {
        try {
            // Match S3 URL pattern: https://bucket.s3.region.amazonaws.com/key
            const s3UrlPattern = /https?:\/\/[^/]+\.s3[^/]*\.amazonaws\.com\/(.+)/;
            const match = url.match(s3UrlPattern);
            return match ? match[1] : null;
        } catch (error) {
            console.error(`Failed to extract S3 key from URL: ${url}`, error);
            return null;
        }
    }
}
