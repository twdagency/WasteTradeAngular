import { BindingScope, injectable, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { ListingsRepository, UserRepository } from '../repositories';
import { Listings } from '../models';
import { ListingStatus, ListingType, NotificationType, RenewalPeriod } from '../enum';
import { EmailService } from './email.service';
import { WasteTradeNotificationsService } from './waste-trade-notifications.service';
import dayjsTz from '../helpers/dayjsTz.helper';
import { ListingHelper } from '../helpers';

export interface ExpiryInfo {
    isExpired: boolean;
    isNearingExpiry: boolean;
    daysUntilExpiry: number;
    expiryDate: Date;
}

export interface RenewalResult {
    renewed: number;
    listings: Listings[];
}

@injectable({ scope: BindingScope.TRANSIENT })
export class ListingExpiryService {
    constructor(
        @repository(ListingsRepository)
        private listingsRepository: ListingsRepository,
        @repository(UserRepository)
        private userRepository: UserRepository,

        @service(EmailService)
        private emailService: EmailService,
        @service(WasteTradeNotificationsService)
        private wasteTradeNotificationsService: WasteTradeNotificationsService,
    ) {}

    /**
     * Calculate expiry information for a listing
     * Uses endDate if available, otherwise defaults to 90 days from creation
     * Warning in final 7 days
     */
    calculateExpiryInfo(listing: Listings): ExpiryInfo {
        if (listing.listingType === ListingType.WANTED) {
            const placeholder = new Date();
            placeholder.setFullYear(placeholder.getFullYear() + 50);
            return {
                isExpired: false,
                isNearingExpiry: false,
                daysUntilExpiry: 99999,
                expiryDate: placeholder,
            };
        }

        let expiryDate: Date;

        if (listing.endDate) {
            // Use endDate if explicitly set
            expiryDate = new Date(listing.endDate);
        } else {
            // Fallback to 90 days from creation (Phase 2 requirement)
            const createdAt = new Date(listing.createdAt!);
            expiryDate = new Date(createdAt);
            expiryDate.setDate(expiryDate.getDate() + 90);
        }

        const now = new Date();
        const timeDiff = expiryDate.getTime() - now.getTime();
        const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return {
            isExpired: daysUntilExpiry <= 0,
            isNearingExpiry: daysUntilExpiry > 0 && daysUntilExpiry <= 7,
            daysUntilExpiry: Math.max(0, daysUntilExpiry),
            expiryDate,
        };
    }

    /**
     * Get all listings that are expired but not yet marked as expired
     * Excludes ongoing listings (those with listingRenewalPeriod set)
     */
    async getExpiredListings(): Promise<Listings[]> {
        const activeListings = await this.listingsRepository.find({
            where: {
                status: { inq: [ListingStatus.AVAILABLE, ListingStatus.PENDING] },
            },
        });

        return activeListings.filter((listing) => {
            // Skip ongoing listings - they should be renewed, not expired
            if (listing.listingRenewalPeriod) {
                return false;
            }

            if (listing.listingType === ListingType.WANTED) {
                return false;
            }

            const expiryInfo = this.calculateExpiryInfo(listing);
            return expiryInfo.isExpired;
        });
    }

    /**
     * Get all listings that are nearing expiry (within 7 days)
     */
    async getListingsNearingExpiry(): Promise<Listings[]> {
        const activeListings = await this.listingsRepository.find({
            where: {
                status: { inq: [ListingStatus.AVAILABLE, ListingStatus.PENDING] },
            },
        });

        return activeListings.filter((listing) => {
            const expiryInfo = this.calculateExpiryInfo(listing);
            return expiryInfo.isNearingExpiry;
        });
    }

    /**
     * Mark expired listings as expired
     */
    async markExpiredListings(): Promise<{ updated: number; listings: Listings[] }> {
        const expiredListings = await this.getExpiredListings();

        const updatePromises = expiredListings.map((listing) =>
            this.listingsRepository.updateById(listing.id!, {
                status: ListingStatus.EXPIRED,
                updatedAt: new Date(),
            }),
        );

        await Promise.all(updatePromises);

        console.log(`Marked ${expiredListings.length} listings as expired`);

        return {
            updated: expiredListings.length,
            listings: expiredListings,
        };
    }

    /**
     * Send expiry warning emails to listing owners
     */
    async sendExpiryWarnings(): Promise<{ sent: number; failed: number }> {
        const nearingExpiryListings = await this.getListingsNearingExpiry();
        let sent = 0;
        let failed = 0;

        for (const listing of nearingExpiryListings) {
            try {
                const user = await this.userRepository.findById(listing.createdByUserId);
                const expiryInfo = this.calculateExpiryInfo(listing);

                if (expiryInfo.daysUntilExpiry === 7) {
                    this.wasteTradeNotificationsService
                        .createNotification(listing.createdByUserId, NotificationType.LISTING_EXPIRY_WARNING, {
                            listingId: listing.id!,
                            listingType: listing.listingType,
                            listingTitle: ListingHelper.getListingTitle(listing),
                            expiryDate: listing.endDate,
                        })
                        .catch((error) => {
                            console.error(
                                `Failed to create listing expiry warning notification for listing ${listing.id}:`,
                                error,
                            );
                        });
                }

                await this.emailService.sendListingExpiryWarning(listing, user, expiryInfo.daysUntilExpiry);
                console.log(
                    `Sent expiry warning for listing ${listing.id} to user ${user.email} (${expiryInfo.daysUntilExpiry} days remaining)`,
                );
                sent++;
            } catch (error) {
                console.error(`Failed to send expiry warning for listing ${listing.id}:`, error);
                failed++;
            }
        }

        console.log(`Sent ${sent} expiry warning emails, ${failed} failed`);

        return { sent, failed };
    }

    /**
     * Calculate the next endDate based on renewal period
     */
    private calculateNextEndDate(currentEndDate: Date | undefined, renewalPeriod: RenewalPeriod): Date {
        const baseDate = currentEndDate ? dayjsTz.utc(currentEndDate) : dayjsTz.utc();

        switch (renewalPeriod) {
            case RenewalPeriod.WEEKLY:
                return baseDate.add(7, 'day').toDate();
            case RenewalPeriod.FORTNIGHTLY:
                return baseDate.add(14, 'day').toDate();
            case RenewalPeriod.MONTHLY:
                return baseDate.add(1, 'month').toDate();
            default:
                // Default to weekly if unknown period
                return baseDate.add(7, 'day').toDate();
        }
    }

    /**
     * Get all ongoing listings that need renewal
     */
    async getListingsNeedingRenewal(): Promise<Listings[]> {
        const currentDate = dayjsTz.utc().startOf('day');
        const ongoingListings = await this.listingsRepository.find({
            where: {
                status: { inq: [ListingStatus.AVAILABLE, ListingStatus.PENDING] },
                listingRenewalPeriod: { neq: null as any },
            },
        });

        return ongoingListings.filter((listing) => {
            if (!listing.endDate) {
                // If no endDate set, needs initial endDate based on startDate
                return true;
            }

            const expiryDate = dayjsTz.utc(listing.endDate).startOf('day');
            const daysUntilExpiry = expiryDate.diff(currentDate, 'day');

            // Renew if expired or expiring today
            return daysUntilExpiry <= 0;
        });
    }

    /**
     * Renew ongoing listings by updating their endDate
     */
    async renewOngoingListings(): Promise<RenewalResult> {
        const listingsToRenew = await this.getListingsNeedingRenewal();

        const renewalPromises = listingsToRenew.map(async (listing) => {
            try {
                const newEndDate = this.calculateNextEndDate(listing.endDate, listing.listingRenewalPeriod!);

                const [, user] = await Promise.all([
                    this.listingsRepository.updateById(listing.id!, {
                        endDate: newEndDate,
                        updatedAt: new Date(),
                    }),
                    this.userRepository.findById(listing.createdByUserId, {
                        fields: { id: true, firstName: true, lastName: true, email: true },
                    }),
                ]);

                await Promise.all([
                    this.emailService.sendListingRenewedEmail(user, ListingHelper.getListingTitle(listing), false),
                    this.wasteTradeNotificationsService.createNotification(
                        listing.createdByUserId,
                        NotificationType.LISTING_RENEWED,
                        {
                            listingId: listing.id,
                            listingType: listing.listingType,
                            listingTitle: ListingHelper.getListingTitle(listing),
                            newEndDate: newEndDate.toISOString(),
                            isManual: false,
                        },
                    ),
                ]);

                console.log(
                    `Renewed listing ${listing.id} (${listing.listingRenewalPeriod}) - new endDate: ${newEndDate.toISOString()}`,
                );

                return listing;
            } catch (error) {
                console.error(`Failed to renew listing ${listing.id}:`, error);
                return null;
            }
        });

        const renewedListings = (await Promise.all(renewalPromises)).filter(
            (listing): listing is Listings => listing !== null,
        );

        console.log(`Renewed ${renewedListings.length} ongoing listings`);

        return {
            renewed: renewedListings.length,
            listings: renewedListings,
        };
    }

    /**
     * Reset SOLD ongoing listings back to AVAILABLE when their reset date (endDate) arrives.
     * For ongoing listings marked as SOLD, endDate serves as the "Available from" reset date.
     */
    async resetSoldOngoingListings(): Promise<{ reset: number; listings: Listings[] }> {
        const currentDate = dayjsTz.utc().startOf('day');
        const soldOngoingListings = await this.listingsRepository.find({
            where: {
                status: ListingStatus.SOLD,
                listingRenewalPeriod: { neq: null as any },
            },
        });

        const listingsToReset = soldOngoingListings.filter((listing) => {
            if (!listing.endDate) return false;
            const resetDate = dayjsTz.utc(listing.endDate).startOf('day');
            return resetDate.diff(currentDate, 'day') <= 0;
        });

        const resetPromises = listingsToReset.map(async (listing) => {
            try {
                const newEndDate = this.calculateNextEndDate(listing.endDate, listing.listingRenewalPeriod!);

                const [, user] = await Promise.all([
                    this.listingsRepository.updateById(listing.id!, {
                        status: ListingStatus.AVAILABLE,
                        remainingQuantity: listing.quantity ?? 0,
                        numberOfLoads: listing.numberOfLoads ?? 0,
                        endDate: newEndDate,
                        updatedAt: new Date(),
                    }),
                    this.userRepository.findById(listing.createdByUserId, {
                        fields: { id: true, firstName: true, lastName: true, email: true },
                    }),
                ]);

                const listingTitle = ListingHelper.getListingTitle(listing);
                await Promise.all([
                    this.emailService.sendListingRenewedEmail(user, listingTitle, false),
                    this.wasteTradeNotificationsService
                        .createNotification(listing.createdByUserId, NotificationType.LISTING_RENEWED, {
                            listingId: listing.id,
                            listingType: listing.listingType,
                            listingTitle,
                            newEndDate: newEndDate.toISOString(),
                            isManual: false,
                        }),
                ]).catch((error) => {
                    console.error(`Failed to send reset notifications for listing ${listing.id}:`, error);
                });

                console.log(
                    `Reset SOLD ongoing listing ${listing.id} back to AVAILABLE - new endDate: ${newEndDate.toISOString()}`,
                );

                return listing;
            } catch (error) {
                console.error(`Failed to reset SOLD ongoing listing ${listing.id}:`, error);
                return null;
            }
        });

        const resetListings = (await Promise.all(resetPromises)).filter(
            (listing): listing is Listings => listing !== null,
        );

        console.log(`Reset ${resetListings.length} SOLD ongoing listings back to AVAILABLE`);

        return {
            reset: resetListings.length,
            listings: resetListings,
        };
    }
}
