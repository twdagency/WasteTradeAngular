import { EMfiRequestStatus, ESampleRequestStatus, ListingStatus } from '../enum';
import { ListingState } from '../enum/listing.enum';

export class TestDataGenerator {
    static readonly PREFIXES = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'];

    static readonly JOB_TITLES = [
        'Procurement Manager', 'Operations Director', 'Supply Chain Manager', 'Waste Management Coordinator',
        'Environmental Officer', 'Logistics Manager', 'Purchasing Manager', 'Sustainability Manager',
        'Operations Manager', 'Business Development Manager', 'Sales Manager', 'Account Manager'
    ];

    static readonly PHONE_PREFIXES = ['+44', '+33', '+49', '+31', '+32'];

    static randomPhoneNumber(): string {
        const prefix = this.randomElement(this.PHONE_PREFIXES);
        const number = this.randomInt(100000000, 999999999);
        return `${prefix} ${number}`;
    }

    static readonly FIRST_NAMES = [
        'John', 'Emma', 'Michael', 'Sophia', 'William', 'Olivia', 'James', 'Ava',
        'Robert', 'Isabella', 'David', 'Mia', 'Richard', 'Charlotte', 'Joseph', 'Amelia',
        'Thomas', 'Harper', 'Charles', 'Evelyn', 'Daniel', 'Abigail', 'Matthew', 'Emily',
        'Anthony', 'Elizabeth', 'Mark', 'Sofia', 'Donald', 'Avery'
    ];

    static readonly LAST_NAMES = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
        'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
        'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White',
        'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Hall'
    ];

    static readonly COMPANY_NAMES = [
        'Green Recycling Ltd',
        'EcoWaste Solutions',
        'Plastic Traders Inc',
        'Metal Recovery Co',
        'Waste Management Pro',
        'Sustainable Materials',
        'Circular Economy Ltd',
        'Resource Recovery',
        'Clean Earth Trading',
        'Global Waste Exchange',
    ];

    static readonly MATERIALS = [
        'HDPE Natural',
        'LDPE Film',
        'PP Granules',
        'PET Flakes',
        'Mixed Plastics',
        'Rubber Crumb',
        'Steel Scrap',
        'Aluminum Cans',
        'Copper Wire',
        'Paper Waste',
    ];

    static readonly LOCATIONS = [
        'London, UK',
        'Manchester, UK',
        'Birmingham, UK',
        'Paris, France',
        'Berlin, Germany',
        'Amsterdam, Netherlands',
        'Brussels, Belgium',
    ];

    static readonly COUNTRIES = ['United Kingdom', 'France', 'Germany', 'Netherlands', 'Belgium'];

    static readonly CITIES = ['London', 'Paris', 'Berlin', 'Amsterdam', 'Brussels'];

    static readonly ADDRESSES = [
        '123 Industrial Estate, Zone A',
        '45 Manufacturing Park, Unit 12',
        '78 Business Center, Building 3',
        '90 Trade Avenue, Floor 2',
        '156 Commerce Street, Suite 5',
        '234 Factory Road, Warehouse 7',
    ];

    static readonly BUYER_MESSAGES = [
        'We need to test material quality before placing bulk order',
        'Requesting MFI test to verify material specifications',
        'Sample needed for quality assurance testing',
        'Need to confirm material meets our requirements',
        'Testing required for compliance certification',
    ];

    static readonly SAMPLE_SIZES = ['Small (100g)', 'Medium (500g)', 'Large (1kg)', 'Extra Large (5kg)'];

    static randomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomDate(daysAgo: number): Date {
        return new Date(Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
    }

    /**
     * Generate consistent state + status for listings.
     * pending/rejected state → matching status; approved → available/sold/expired.
     */
    static generateConsistentListingStateStatus(): { state: ListingState; status: ListingStatus } {
        const state = this.randomElement([ListingState.APPROVED, ListingState.PENDING, ListingState.REJECTED]);
        if (state === ListingState.PENDING) return { state, status: ListingStatus.PENDING };
        if (state === ListingState.REJECTED) return { state, status: ListingStatus.REJECTED };
        // Approved: mostly available, some sold/expired
        const status = this.randomElement([
            ListingStatus.AVAILABLE, ListingStatus.AVAILABLE, ListingStatus.AVAILABLE,
            ListingStatus.SOLD, ListingStatus.EXPIRED,
        ]);
        return { state, status };
    }

    static generateMfiRequestData(params: {
        listingId: number;
        buyerUserId: number;
        buyerCompanyId: number;
        sellerUserId: number;
        sellerCompanyId: number;
    }) {
        const status = this.randomElement(Object.values(EMfiRequestStatus));
        const createdAt = this.randomDate(90);
        const isTested = status === EMfiRequestStatus.TESTED;

        return {
            listingId: params.listingId,
            buyerUserId: params.buyerUserId,
            buyerCompanyId: params.buyerCompanyId,
            sellerUserId: params.sellerUserId,
            sellerCompanyId: params.sellerCompanyId,
            assignedAdminId: Math.random() > 0.3 ? this.randomInt(1, 5) : undefined,
            buyerMessage: this.randomElement(this.BUYER_MESSAGES),
            status,
            testedDate: isTested ? new Date(createdAt.getTime() + this.randomInt(3, 14) * 24 * 60 * 60 * 1000) : undefined,
            mfiResult: isTested ? Math.round((Math.random() * 50 + 1) * 100) / 100 : undefined,
            isSyncedSalesForce: false,
            adminNote: undefined,
            assignAdmin: undefined,
            lastSyncedSalesForceDate: undefined,
            salesforceId: undefined,
            createdAt: createdAt.toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    static generateSampleRequestData(params: {
        listingId: number;
        buyerUserId: number;
        buyerCompanyId: number;
        sellerUserId: number;
        sellerCompanyId: number;
    }) {
        const status = this.randomElement(Object.values(ESampleRequestStatus));
        const createdAt = this.randomDate(90);
        const isSent = [
            ESampleRequestStatus.SAMPLE_DISPATCHED,
            ESampleRequestStatus.SAMPLE_IN_TRANSIT,
            ESampleRequestStatus.CUSTOMS_CLEARED,
            ESampleRequestStatus.SAMPLE_DELIVERED,
        ].includes(status);
        const isReceived = status === ESampleRequestStatus.SAMPLE_DELIVERED;

        return {
            listingId: params.listingId,
            buyerUserId: params.buyerUserId,
            buyerCompanyId: params.buyerCompanyId,
            sellerUserId: params.sellerUserId,
            sellerCompanyId: params.sellerCompanyId,
            assignedAdminId: Math.random() > 0.3 ? this.randomInt(1, 5) : undefined,
            numberOfSamples: this.randomInt(1, 10),
            sampleSize: this.randomElement(this.SAMPLE_SIZES),
            buyerMessage: this.randomElement(this.BUYER_MESSAGES),
            status,
            sentDate: isSent ? new Date(createdAt.getTime() + this.randomInt(1, 5) * 24 * 60 * 60 * 1000) : undefined,
            receivedDate: isReceived ? new Date(createdAt.getTime() + this.randomInt(7, 21) * 24 * 60 * 60 * 1000) : undefined,
            postageLabelUrl: isSent ? `https://s3.amazonaws.com/wastetrade/postage-labels/label-${this.randomInt(1000, 9999)}.pdf` : undefined,
            isSyncedSalesForce: false,
            adminNote: undefined,
            assignAdmin: undefined,
            lastSyncedSalesForceDate: undefined,
            salesforceId: undefined,
            createdAt: createdAt.toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
}
