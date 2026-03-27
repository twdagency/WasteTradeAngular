export enum ESampleRequestStatus {
    SAMPLE_REQUESTED = 'Sample Requested',
    SAMPLE_APPROVED = 'Sample Approved',
    SAMPLE_DISPATCHED = 'Sample Dispatched',
    SAMPLE_IN_TRANSIT = 'Sample In Transit',
    CUSTOMS_CLEARED = 'Customs Cleared',
    SAMPLE_DELIVERED = 'Sample Delivered',
    CUSTOMER_FEEDBACK_REQUESTED = 'Customer Feedback Requested',
    FEEDBACK_PROVIDED = 'Feedback Provided',
    CANCELLED = 'Cancelled',
}

/**
 * Tab filter → DB status mapping (per Paige's confirmation).
 * Tabs are generic groupings; DB stores detailed statuses.
 * "Unverified"/"Verified" tabs filter by user status, not request status.
 */
export const SAMPLE_TAB_TO_STATUSES: Record<string, ESampleRequestStatus[]> = {
    'Awaiting Payment': [ESampleRequestStatus.SAMPLE_REQUESTED],
    Pending: [ESampleRequestStatus.SAMPLE_APPROVED],
    Sent: [
        ESampleRequestStatus.SAMPLE_DISPATCHED,
        ESampleRequestStatus.SAMPLE_IN_TRANSIT,
        ESampleRequestStatus.CUSTOMS_CLEARED,
    ],
    Received: [
        ESampleRequestStatus.SAMPLE_DELIVERED,
        ESampleRequestStatus.CUSTOMER_FEEDBACK_REQUESTED,
        ESampleRequestStatus.FEEDBACK_PROVIDED,
    ],
    Cancelled: [ESampleRequestStatus.CANCELLED],
};
