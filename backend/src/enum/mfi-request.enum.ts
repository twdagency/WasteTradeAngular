export enum EMfiRequestStatus {
    AWAITING_PAYMENT = 'Awaiting Payment',
    PENDING = 'Pending',
    TESTED = 'Tested',
}

/**
 * Tab filter → DB status mapping for MFI.
 * "Unverified"/"Verified" tabs filter by user status, not request status.
 */
export const MFI_TAB_TO_STATUSES: Record<string, EMfiRequestStatus[]> = {
    'Awaiting Payment': [EMfiRequestStatus.AWAITING_PAYMENT],
    Pending: [EMfiRequestStatus.PENDING],
    Tested: [EMfiRequestStatus.TESTED],
};
