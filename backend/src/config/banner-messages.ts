export interface BannerConfig {
    message: string;
}

export interface BannerMessages {
    incompleteOnboarding: BannerConfig;
    verificationPending: BannerConfig;
    verificationFailed: BannerConfig;
    documentExpiring: BannerConfig;
}

/**
 * Banner message configurations
 * These are company-specific messages that relate to the company's onboarding and verification status
 * These can be easily modified without touching the service logic
 */
export const BANNER_MESSAGES: BannerMessages = {
    incompleteOnboarding: {
        message: 'Complete account (all onboarding steps are not complete)',
    },
    verificationPending: {
        message: 'Your account is being verified',
    },
    verificationFailed: {
        message: 'Verification failed, please contact the WasteTrade team at support@wastetrade.com',
    },
    documentExpiring: {
        message:
            '{documentName} is due to expire on {expiryDate}. Please upload the latest version to keep your access.',
    },
};
