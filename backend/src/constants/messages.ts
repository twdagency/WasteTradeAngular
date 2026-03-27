export const messages = {
    // General Server Messages
    serverError: 'server-error',
    notFound: 'not-found',
    noneExistedEntity: 'none-existed-entity',

    // Authentication & Authorization
    unauthorized: 'unauthorized',
    forbidden: 'forbidden',
    needLoginFirst: 'need-login-first',
    accountAndPasswordInvalid: 'account-and-password-invalid',
    accountArchived: 'account-archived',
    accountInvalid: 'account-invalid',

    // Email & Password Management
    invalidEmail: 'invalid-email',
    existedEmail: 'email-is-already-existed',
    invalidPassword: 'invalid-password',
    inValidCurrentPassword: 'invalid-current-password',
    changePasswordSuccessfully: 'change-password-successfully',
    forgotPasswordRateLimit: 'forgot-password-rate-limit',
    sendEmailFail: 'send-email-fail',
    emailServiceError: 'email-service-error',

    // User Management
    existedUser: 'existed-user',
    userNotFound: 'user-not-found',
    userDataInCorrect: 'user-data-in-correct',
    createUserSuccess: 'create-user-success',
    updateUserSuccess: 'update-user-success',
    deleteUserSuccess: 'delete-user-success',
    archiveUserSuccess: 'archive-user-success',
    unarchiveUserSuccess: 'unarchive-user-success',
    activeUserSuccess: 'active-user-success',
    cannotArchiveOrActive: 'cannot-archive-or-active',

    // Admin Management
    createAdminSuccess: 'create-admin-success',
    updateAdminSuccess: 'update-admin-success',
    adminFound: 'admin-found',
    existedEmailAdmin: 'email-admin-is-already-existed',
    noPermissionToCreateSuperAdmin: 'no-permission-to-create-super-admin',
    noPermissionToEditAdminRole: 'no-permission-to-edit-admin-role',
    invalidStatus: 'invalid-status',
    adminNotFound: 'admin-not-found',

    // Project Management
    existedProject: 'existed-project',

    // Company Management
    companyNotFound: 'company-not-found',
    companyLocationNotFound: 'company-location-not-found',
    getCompaniesSuccess: 'get-companies-success',
    sellerCompanyOrLocationNotFound: 'seller-company-or-location-not-found',
    buyerCompanyOrLocationNotFound: 'buyer-company-or-location-not-found',
    notFoundOldUser: 'not-found-old-user',
    notFoundNewUser: 'not-found-new-user',
    reassignUserSuccessfully: 'reassign-user-successfully',
    notFoundCompanyUserRequest: 'not-found-company-user-request',

    // Company User Requests Management
    cannotInviteAdminToCompany: 'cannot-invite-admin-to-company',
    globalAdminCannotRequestToJoinCompany: 'global-admin-cannot-request-to-join-company',
    userAlreadyBelongsToOtherCompany: 'user-already-belongs-to-other-company',
    userAlreadyBelongsToThisCompany: 'user-already-belongs-to-this-company',
    anInvitationHasBeenSentToThisUser: 'an-invitation-has-been-sent-to-this-user',
    companyAdminRemoveUserPendingSuccessfully: 'company-admin-remove-user-pending-successfully',
    aRequestToJoinCompanyHasBeenSentByThisUser: 'a-request-to-join-company-has-been-sent-by-this-user',
    emailDoesNotMatch: 'email-does-not-match',

    // File Upload
    exceedMaximumFileSize: 'exceed-maximum-file-size',
    noFileUploaded: 'no-file-uploaded',
    invalidFileFormat: 'invalid-file-format',

    // Document Management
    invalidDocument: 'invalid-document',
    missingDocumentType: 'missing-document-type',
    missingDocumentUrl: 'missing-document-url',
    invalidExpiryDate: 'invalid-expiry-date',
    invalidDocumentType: 'invalid-document-type',

    // Material Types & Properties
    invalidMaterialTypeEFW: 'invalid-material-type-efw',
    invalidMaterialTypeMetal: 'invalid-material-type-metal',
    invalidMaterialTypeRubber: 'invalid-material-type-rubber',
    invalidMaterialTypeFibre: 'invalid-material-type-fibre',
    invalidMaterialTypePlastic: 'invalid-material-type-plastic',
    invalidMaterialColor: 'invalid-material-color',
    invalidMaterialFinishing: 'invalid-material-finishing',
    invalidMaterialPacking: 'invalid-material-packing',
    invalidMaterialWeightWanted: 'invalid-material-weight-wanted',

    // Capacity & Flow Management
    missingCapacityPerMonth: 'missing-capacity-per-month',
    invalidCapacityPerMonth: 'invalid-capacity-per-month',
    invalidMaterialFlowIndex: 'invalid-material-flow-index',
    missingMaterialFlowIndex: 'missing-material-flow-index',
    quantityExceeded: 'quantity-exceeded',

    // Listing Management
    listingCreated: 'listing-created',
    listingNotFound: 'listing-not-found',
    listingRetrievedSuccessfully: 'listing-retrieved-successfully',
    failedToCreateListing: 'failed-to-create-listing',
    invalidListingType: 'invalid-listing-type',
    invalidStartDate: 'invalid-start-date',
    invalidListingRenewalPeriod: 'invalid-listing-renewal-period',
    invalidListingDuration: 'invalid-listing-duration',
    listingAlreadyAvailable: 'listing-already-available',
    listingAlreadySold: 'listing-already-sold',
    listingAlreadyRejected: 'listing-already-rejected',
    listingNotEligibleForRenewal: 'listing-not-eligible-for-renewal',
    cannotBidOnOwnListing: 'cannot-bid-on-own-listing',
    listingNotAvailable: 'listing-not-available',
    cannotDeleteListingWithApprovedOffers: 'cannot-delete-listing-with-approved-offers',
    cannotEditListingWithOffers: 'cannot-edit-listing-with-offers',
    cannotMarkListingAsSoldNotApproved: 'cannot-mark-listing-as-sold-not-approved',

    // Additional Notes Validation
    additionalNotesContainsPhone: 'additional-notes-contains-phone',
    additionalNotesContainsEmail: 'additional-notes-contains-email',
    additionalNotesContainsUrl: 'additional-notes-contains-url',

    // Offer Management
    offerNotFound: 'offer-not-found',
    offerNotAction: 'offer-not-action',

    // Long Polling
    longPollingSuccess: 'long-polling-success',
    longPollingTimeout: 'long-polling-timeout',
    longPollingError: 'long-polling-error',

    // Data Draft
    dataDraftTokenInvalid: 'data-draft-token-invalid',
    dataDraftTokenExpired: 'data-draft-token-expired',

    // Waste Trade Notifications
    wasteTradeNotificationsNotFound: 'waste-trade-notifications-not-found',

    invalidOfficeTime: 'invalid-office-time',
};
