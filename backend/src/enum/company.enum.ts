export enum CompanyStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
    REJECTED = 'rejected',
    REQUEST_INFORMATION = 'request_information',
}

export enum CompanyType {
    MANUFACTURER = 'manufacturer',
    PROCESSOR = 'processor',
    RECYCLER = 'recycler',
    BROKER = 'broker',
    WASTE_PRODUCER = 'waste_producer',
}

export enum CompanyInterest {
    BUYER = 'buyer',
    SELLER = 'seller',
    BOTH = 'both',
}

export enum CompanyUserRoleSearch {
    COMPANY_ADMIN = 'company admin',
    BUYER = 'buyer',
    SELLER = 'seller',
    DUAL = 'dual',
    HAULIER = 'haulier',
}

// Legacy ContainerType enum - kept for backward compatibility
// New code should use TrailerType from haulage-offer.enum.ts
export enum ContainerType {
    // SF trailer types (new values)
    CURTAIN_SIDER = 'Curtain Sider',
    CONTAINERS = 'Containers',
    TIPPER_TRUCKS = 'Tipper Trucks',
    WALKING_FLOOR = 'Walking Floor',
    // Legacy values for backward compatibility
    SHPPING_CONTAINER = 'shipping_container',
    CURTAIN_SLIDER_STANDARD = 'curtain_slider_standard',
    CURTAIN_SLIDER_HIGH_CUBE = 'curtain_slider_high_cube',
    ALL = 'all',
}

export enum FleetType {
    FREIGHT_FORWARDER = 'freight_forwarder',
    OWN_FLEET = 'own_fleet',
}

export enum AreaCovered {
    UK_ONLY = 'uk_only',
    WORLDWIDE = 'worldwide',
    AUSTRIA = 'austria',
    ALBANIA = 'albania',
    BELGIUM = 'belgium',
    BULGARIA = 'bulgaria',
    CROATIA = 'croatia',
    CZECH_REPUBLIC = 'czech_republic',
    DENMARK = 'denmark',
    ESTONIA = 'estonia',
    FINLAND = 'finland',
    FRANCE = 'france',
    GERMANY = 'germany',
    GREECE = 'greece',
    HUNGARY = 'hungary',
    IRELAND = 'ireland',
    ITALY = 'italy',
    LATVIA = 'latvia',
    LITHUANIA = 'lithuania',
    LUXEMBOURG = 'luxembourg',
    MALTA = 'malta',
    NETHERLANDS = 'netherlands',
    POLAND = 'poland',
    PORTUGAL = 'portugal',
    ROMANIA = 'romania',
    SLOVAKIA = 'slovakia',
    SLOVENIA = 'slovenia',
    SPAIN = 'spain',
    SWEDEN = 'sweden',
    CYPRUS = 'cyprus',
}

export enum OnboardingStatus {
    COMPANY_INFORMATION_COMPLETE = 'company_information_complete',
    COMPANY_INFORMATION_IN_PROGRESS = 'company_information_in_progress',
    COMPANY_DOCUMENTS_ADDED = 'company_documents_added',
    COMPANY_DOCUMENTS_IN_PROGRESS = 'company_documents_in_progress',
    SITE_LOCATION_ADDED = 'site_location_added',
    SITE_LOCATION_IN_PROGRESS = 'site_location_in_progress',
}
