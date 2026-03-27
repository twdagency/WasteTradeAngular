import { post, requestBody, HttpErrors, Request, RestBindings } from '@loopback/rest';
import { inject, service } from '@loopback/core';
import { SalesforceWebhookService } from '../services';
import { SalesforceLogger } from '../utils/salesforce/salesforce-sync.utils';

/**
 * Salesforce Webhook Controller
 * Handles incoming webhooks from Salesforce for:
 * - Haulage offer documents (CU-869abxxnm)
 * - Haulage offer status updates
 * - Account updates (CU-869abxxq7 CRM Alignment)
 * - Contact updates (CU-869abxxq7 CRM Alignment)
 *
 * All endpoints use untyped payload (@requestBody() payload: any) to avoid
 * LoopBack schema validation rejecting null fields or extra properties from Apex.
 * Authentication is handled via X-Salesforce-Secret header.
 */
export class SalesforceWebhookController {
    constructor(
        @service(SalesforceWebhookService)
        public salesforceWebhookService: SalesforceWebhookService,
    ) {}

    /**
     * Validate webhook authentication from Salesforce
     */
    private validateWebhookAuth(request: Request): void {
        const salesforceSecret = request.headers['x-salesforce-secret'] as string;
        const expectedSecret = process.env.SALESFORCE_WEBHOOK_SECRET;

        if (!expectedSecret) {
            throw new HttpErrors.ServiceUnavailable('Webhook secret not configured');
        }
        if (!salesforceSecret || salesforceSecret !== expectedSecret) {
            throw new HttpErrors.Unauthorized('Invalid or missing webhook secret');
        }
    }

    /**
     * Log incoming webhook call for debugging
     */
    private logWebhookReceived(endpoint: string, payload: Record<string, unknown>): void {
        const env = (payload.externalId as string)?.match(/^(DEV|UAT|TEST|PROD)_/)?.[1] ?? 'UNKNOWN';
        SalesforceLogger.warn(`SF webhook received: ${endpoint} [${env}]`, {
            direction: 'inbound',
            entity: endpoint,
            id: payload.externalId ?? payload.accountId ?? payload.contactId ?? payload.leadId ?? payload.haulageOfferId ?? 'N/A',
        });
    }

    /**
     * Receive haulage offer documents from Salesforce
     * Called when Salesforce generates documents for accepted haulage offers
     */
    @post('/salesforce/webhook/haulage-documents')
    async receiveHaulageDocuments(
        @inject(RestBindings.Http.REQUEST) request: Request,
        @requestBody() payload: any,
    ): Promise<{ status: string; message: string; documentsCreated: number }> {
        try {
            this.logWebhookReceived('haulage-documents', payload as Record<string, unknown>);
            this.validateWebhookAuth(request);

            const result = await this.salesforceWebhookService.processHaulageDocuments(
                payload.haulageOfferId,
                payload.documents,
            );

            return {
                status: 'success',
                message: `Successfully processed ${result.documentsCreated} documents for haulage offer ${payload.haulageOfferId}`,
                documentsCreated: result.documentsCreated,
            };
        } catch (error) {
            SalesforceLogger.error('Salesforce webhook error:', error);

            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            throw new HttpErrors.InternalServerError('Failed to process Salesforce webhook');
        }
    }

    /**
     * Receive haulage offer status updates from Salesforce
     * Called when Salesforce users update haulage offer status (approve/reject/etc)
     */
    @post('/salesforce/webhook/haulage-offer-status')
    async receiveHaulageOfferStatusUpdate(
        @inject(RestBindings.Http.REQUEST) request: Request,
        @requestBody() payload: any,
    ): Promise<{ status: string; message: string; updated: boolean; reason?: string }> {
        try {
            this.logWebhookReceived('haulage-offer-status', payload as Record<string, unknown>);
            this.validateWebhookAuth(request);

            const result = await this.salesforceWebhookService.processHaulageOfferStatusUpdate(payload);

            return {
                status: result.success ? 'success' : 'error',
                message: result.message,
                updated: result.updated,
                reason: result.reason,
            };
        } catch (error) {
            SalesforceLogger.error('Salesforce webhook error:', error);

            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            throw new HttpErrors.InternalServerError('Failed to process Salesforce webhook');
        }
    }

    /**
     * Receive Lead updates from Salesforce (Push Haulier Data - 6.5.1.1)
     * Called when Lead is updated in Salesforce
     */
    @post('/salesforce/webhook/lead-updated')
    async receiveLeadUpdate(
        @inject(RestBindings.Http.REQUEST) request: Request,
        @requestBody() payload: any,
    ): Promise<{ status: string; message: string; updated: boolean; reason?: string }> {
        try {
            this.logWebhookReceived('lead-updated', payload as Record<string, unknown>);
            this.validateWebhookAuth(request);

            const result = await this.salesforceWebhookService.processLeadUpdate(payload);

            return {
                status: result.success ? 'success' : 'error',
                message: result.message,
                updated: result.updated,
                reason: result.reason,
            };
        } catch (error) {
            SalesforceLogger.error('Salesforce webhook error (lead-updated):', error);

            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            throw new HttpErrors.InternalServerError('Failed to process lead update webhook');
        }
    }

    /**
     * Receive Account updates from Salesforce (CRM Alignment - 6.3.3.10)
     * Called when Account is updated in Salesforce
     */
    @post('/salesforce/webhook/account-updated')
    async receiveAccountUpdate(
        @inject(RestBindings.Http.REQUEST) request: Request,
        @requestBody() payload: any,
    ): Promise<{ status: string; message: string; updated: boolean; reason?: string }> {
        try {
            this.logWebhookReceived('account-updated', payload as Record<string, unknown>);
            this.validateWebhookAuth(request);

            const result = await this.salesforceWebhookService.processAccountUpdate(payload);

            return {
                status: result.success ? 'success' : 'error',
                message: result.message,
                updated: result.updated,
                reason: result.reason,
            };
        } catch (error) {
            SalesforceLogger.error('Salesforce webhook error (account-updated):', error);

            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            throw new HttpErrors.InternalServerError('Failed to process account update webhook');
        }
    }

    /**
     * Receive Contact updates from Salesforce (CRM Alignment - 6.3.3.10)
     * Called when Contact role/status is updated in Salesforce
     */
    @post('/salesforce/webhook/contact-updated')
    async receiveContactUpdate(
        @inject(RestBindings.Http.REQUEST) request: Request,
        @requestBody() payload: any,
    ): Promise<{ status: string; message: string; updated: boolean; reason?: string }> {
        try {
            this.logWebhookReceived('contact-updated', payload as Record<string, unknown>);
            this.validateWebhookAuth(request);

            const result = await this.salesforceWebhookService.processContactUpdate(payload);

            return {
                status: result.success ? 'success' : 'error',
                message: result.message,
                updated: result.updated,
                reason: result.reason,
            };
        } catch (error) {
            SalesforceLogger.error('Salesforce webhook error (contact-updated):', error);

            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            throw new HttpErrors.InternalServerError('Failed to process contact update webhook');
        }
    }

    @post('/salesforce/webhook/approval-instruction')
    async receiveApprovalInstruction(
        @inject(RestBindings.Http.REQUEST) request: Request,
        @requestBody() payload: any,
    ): Promise<{
        status: string;
        message: string;
        approved: boolean;
        reason?: string;
        resultingStatus?: string;
    }> {
        try {
            this.logWebhookReceived('approval-instruction', payload as Record<string, unknown>);
            this.validateWebhookAuth(request);

            const result = await this.salesforceWebhookService.processApprovalInstruction(payload);

            return {
                status: result.success ? 'success' : 'error',
                message: result.message,
                approved: result.approved,
                reason: result.reason,
                resultingStatus: result.resultingStatus,
            };
        } catch (error) {
            SalesforceLogger.error('Salesforce webhook error (approval-instruction):', error);

            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            throw new HttpErrors.InternalServerError('Failed to process approval instruction webhook');
        }
    }

    /**
     * Health check endpoint for Salesforce webhook
     */
    @post('/salesforce/webhook/health')
    async webhookHealthCheck(): Promise<{ status: string; timestamp: string; endpoints: string[] }> {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            endpoints: [
                '/salesforce/webhook/haulage-documents',
                '/salesforce/webhook/haulage-offer-status',
                '/salesforce/webhook/lead-updated',
                '/salesforce/webhook/account-updated',
                '/salesforce/webhook/contact-updated',
                '/salesforce/webhook/load-updated',
                '/salesforce/webhook/listing-status-updated',
                '/salesforce/webhook/offer-status-updated',
                '/salesforce/webhook/approval-instruction',
            ],
        };
    }

    /**
     * Receive Listing status updates from Salesforce (6.5.1.4)
     * Called when Salesforce users approve/reject listings
     */
    @post('/salesforce/webhook/listing-status-updated')
    async receiveListingStatusUpdate(
        @inject(RestBindings.Http.REQUEST) request: Request,
        @requestBody() payload: any,
    ): Promise<{ status: string; message: string; updated: boolean; reason?: string }> {
        try {
            this.logWebhookReceived('listing-status-updated', payload as Record<string, unknown>);
            this.validateWebhookAuth(request);
            const result = await this.salesforceWebhookService.processListingStatusUpdate(payload);
            return {
                status: result.success ? 'success' : 'error',
                message: result.message,
                updated: result.updated,
                reason: result.reason,
            };
        } catch (error) {
            SalesforceLogger.error('Salesforce webhook error (listing-status-updated):', error);
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }
            throw new HttpErrors.InternalServerError('Failed to process listing status update webhook');
        }
    }

    /**
     * Receive Offer (Bid) status updates from Salesforce (6.5.1.4)
     * Called when Salesforce users accept/reject offers
     */
    @post('/salesforce/webhook/offer-status-updated')
    async receiveOfferStatusUpdate(
        @inject(RestBindings.Http.REQUEST) request: Request,
        @requestBody() payload: any,
    ): Promise<{ status: string; message: string; updated: boolean; reason?: string }> {
        try {
            this.logWebhookReceived('offer-status-updated', payload as Record<string, unknown>);
            this.validateWebhookAuth(request);
            const result = await this.salesforceWebhookService.processOfferStatusUpdate(payload);
            return {
                status: result.success ? 'success' : 'error',
                message: result.message,
                updated: result.updated,
                reason: result.reason,
            };
        } catch (error) {
            SalesforceLogger.error('Salesforce webhook error (offer-status-updated):', error);
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }
            throw new HttpErrors.InternalServerError('Failed to process offer status update webhook');
        }
    }

    /**
     * Receive Wanted Listing status updates from Salesforce (6.5.1.4)
     * Called when Salesforce users approve/reject wanted listings
     */
    @post('/salesforce/webhook/wanted-listing-status-updated')
    async receiveWantedListingStatusUpdate(
        @inject(RestBindings.Http.REQUEST) request: Request,
        @requestBody() payload: any,
    ): Promise<{ status: string; message: string; updated: boolean; reason?: string }> {
        try {
            this.logWebhookReceived('wanted-listing-status-updated', payload as Record<string, unknown>);
            this.validateWebhookAuth(request);
            const result = await this.salesforceWebhookService.processWantedListingStatusUpdate(payload);
            return {
                status: result.success ? 'success' : 'error',
                message: result.message,
                updated: result.updated,
                reason: result.reason,
            };
        } catch (error) {
            SalesforceLogger.error('Salesforce webhook error (wanted-listing-status-updated):', error);
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }
            throw new HttpErrors.InternalServerError('Failed to process wanted listing status update webhook');
        }
    }

    /**
     * Called when Haulage Load is updated in Salesforce
     */
    @post('/salesforce/webhook/load-updated')
    async receiveLoadUpdate(
        @inject(RestBindings.Http.REQUEST) request: Request,
        @requestBody() payload: any,
    ): Promise<{ status: string; message: string; updated: boolean; reason?: string }> {
        try {
            this.logWebhookReceived('load-updated', payload as Record<string, unknown>);
            this.validateWebhookAuth(request);

            const result = await this.salesforceWebhookService.handleLoadUpdate(payload);
            return result;
        } catch (error) {
            SalesforceLogger.error('Salesforce webhook error (load-updated):', error);

            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            throw new HttpErrors.InternalServerError('Failed to process load update webhook');
        }
    }
}
