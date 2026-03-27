import { NotificationType } from '../enum/notification.enum';
import { Companies } from '../models/companies.model';
import { Listings } from '../models/listings.model';
import { CompaniesRepository, CompanyUsersRepository } from '../repositories';
import { WasteTradeNotificationsService } from '../services/waste-trade-notifications.service';

export namespace ListingHelper {
    export function getListingTitle(listing: Listings): string {
        if (!listing) {
            return '';
        }

        // switch (listing.materialType) {
        //     case MaterialType.METAL:
        //     case MaterialType.RUBBER:
        //         listingName = listing.materialItem ?? '';
        //         break;
        //     case MaterialType.FIBRE:
        //         listingName = `${listing.materialGrading} - ${listing.materialItem}`;
        //         break;
        //     case MaterialType.PLASTIC:
        //         listingName = `${listing.materialItem} - ${listing.materialForm} - ${listing.materialFinishing}`;
        //         break;
        //     case MaterialType.EFW:
        //         listingName = MaterialType.EFW.toUpperCase();
        //         break;

        //     default:
        //         listingName = listing.materialItem ?? '';
        //         break;
        // }

        return listing.materialItem?.replace(/_/g, ' ')?.toLocaleUpperCase() ?? '';
    }

    export async function sendNotificationNewListing(
        companiesRepository: CompaniesRepository,
        companyUsersRepository: CompanyUsersRepository,
        wasteTradeNotificationsService: WasteTradeNotificationsService,
        listing: Listings,
    ): Promise<void> {
        try {
            const companies = (await companiesRepository.execute(
                'SELECT id FROM companies WHERE favorite_materials @> $1',
                [`["${listing.materialItem?.toLowerCase()}"]`],
            )) as Companies[];

            for (const company of companies) {
                const companyUser = await companyUsersRepository.findOne({
                    where: {
                        companyId: company.id,
                    },
                    fields: {
                        userId: true,
                    },
                });

                if (!companyUser?.userId) {
                    continue;
                }

                wasteTradeNotificationsService
                    .createNotification(companyUser?.userId, NotificationType.LISTING_ADDED, {
                        listingId: listing.id,
                        listingType: listing.listingType,
                        listingTitle: ListingHelper.getListingTitle(listing),
                    })
                    .catch((error) => {
                        console.error(`Error sendNotificationNewListing for company ${company.id}: ${error}`);
                    });
            }
        } catch (error) {
            console.error(`Error sendNotificationNewListing: ${error}`);
        }
    }
}
