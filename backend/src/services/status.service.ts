import { BindingScope, injectable } from '@loopback/core';
import { OfferStatusEnum, HaulageOfferStatus } from '../enum';

/**
 * Service for managing status display and formatting
 * Task: 6.4.1.20. System Defined Status & State
 */
@injectable({ scope: BindingScope.TRANSIENT })
export class StatusService {
    /**
     * Get formatted shipping status for offers/haulage offers
     * Returns "Load X of X Shipped" format for partial shipments
     */
    public getShippingStatus(status: string, totalLoads: number, shippedLoads?: number): string {
        if (
            status === OfferStatusEnum.PARTIALLY_SHIPPED &&
            totalLoads > 0 &&
            shippedLoads &&
            shippedLoads > 0 &&
            shippedLoads < totalLoads
        ) {
            return `Load ${shippedLoads} of ${totalLoads} Shipped`;
        }

        if (
            status === HaulageOfferStatus.PARTIALLY_SHIPPED &&
            totalLoads > 0 &&
            shippedLoads &&
            shippedLoads > 0 &&
            shippedLoads < totalLoads
        ) {
            return `Load ${shippedLoads} of ${totalLoads} Shipped`;
        }

        // Return standard status for other cases
        switch (status) {
            case OfferStatusEnum.PARTIALLY_SHIPPED:
                return 'Partially Shipped';
            case HaulageOfferStatus.PARTIALLY_SHIPPED:
                return 'Partially Shipped';
            default:
                return this.formatStatusText(status);
        }
    }

    /**
     * Format status text to be more user-friendly
     */
    public formatStatusText(status: string): string {
        return status
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get all available statuses for listings
     */
    public getListingStatuses(): Array<{ value: string; label: string }> {
        return [
            { value: 'pending', label: 'Pending - Awaiting admin approval' },
            { value: 'available', label: 'Available - Ready for trading' },
            { value: 'available_from_date', label: 'Available from Date' },
            { value: 'ongoing', label: 'Ongoing - Recurring listing' },
            { value: 'sold', label: 'Sold - All loads sold' },
            { value: 'expired', label: 'Expired - End date reached' },
            { value: 'rejected', label: 'Rejected - Admin rejected' },
        ];
    }

    /**
     * Get all available statuses for wanted listings
     */
    public getWantedListingStatuses(): Array<{ value: string; label: string }> {
        return [
            { value: 'pending', label: 'Pending - More information required' },
            { value: 'material_required', label: 'Material Required - Ready now' },
            { value: 'material_required_from_date', label: 'Material Required from Date' },
            { value: 'fulfilled', label: 'Fulfilled - Requirements met' },
            { value: 'rejected', label: 'Rejected - Admin rejected' },
        ];
    }

    /**
     * Get all available statuses for trade bids/offers
     */
    public getTradeBidStatuses(): Array<{ value: string; label: string }> {
        return [
            { value: OfferStatusEnum.PENDING, label: 'Pending - Awaiting action' },
            { value: OfferStatusEnum.ACCEPTED, label: 'Accepted - User accepted bid' },
            { value: OfferStatusEnum.REJECTED, label: 'Rejected - User rejected bid' },
            { value: OfferStatusEnum.PARTIALLY_SHIPPED, label: 'Load X of X Shipped' },
            { value: OfferStatusEnum.SHIPPED, label: 'Shipped - All loads shipped' },
        ];
    }

    /**
     * Get all available statuses for haulage bids/offers
     */
    public getHaulageBidStatuses(): Array<{ value: string; label: string }> {
        return [
            { value: HaulageOfferStatus.PENDING, label: 'Pending - Awaiting review' },
            { value: HaulageOfferStatus.APPROVED, label: 'Approved - Admin approved' },
            { value: HaulageOfferStatus.ACCEPTED, label: 'Accepted - User accepted' },
            { value: HaulageOfferStatus.REJECTED, label: 'Rejected - Admin rejected' },
            { value: HaulageOfferStatus.INFORMATION_REQUESTED, label: 'More Information Required' },
            { value: HaulageOfferStatus.PARTIALLY_SHIPPED, label: 'Load X of X Shipped' },
            { value: HaulageOfferStatus.SHIPPED, label: 'Shipped - All loads shipped' },
        ];
    }

    /**
     * Get admin state options for entities
     */
    public getAdminStates(): Array<{ value: string; label: string }> {
        return [
            { value: 'pending', label: 'Pending - Awaiting admin approval/information' },
            { value: 'approved', label: 'Approved - Visible to users, normal trading' },
            { value: 'rejected', label: 'Rejected - Not visible' },
        ];
    }

    /**
     * Get status color for UI display
     */
    public getStatusColor(status: string): string {
        switch (status.toLowerCase()) {
            // Green colors for positive statuses
            case 'approved':
            case 'accepted':
            case 'available':
            case 'shipped':
            case 'fulfilled':
            case 'material_required':
                return 'success';

            // Orange colors for pending/waiting statuses
            case 'pending':
            case 'information_requested':
            case 'partially_shipped':
                return 'warning';

            // Red colors for negative statuses
            case 'rejected':
            case 'expired':
                return 'danger';

            // Blue colors for neutral statuses
            case 'ongoing':
                return 'info';

            default:
                return 'secondary';
        }
    }
}
