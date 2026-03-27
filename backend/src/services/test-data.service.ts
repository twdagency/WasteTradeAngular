import { injectable, BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import {
    UserRepository,
    CompaniesRepository,
    ListingsRepository,
    MfiRequestsRepository,
    SampleRequestsRepository,
} from '../repositories';
import { UserRoleEnum, UserStatus, CompanyStatus, CompanyType, ListingType, ListingStatus } from '../enum';
import { BcryptHasher } from './hash.password.bcryptjs';
import { TestDataGenerator } from '../utils/test-data-generator.util';
import { User } from '../models/user.model';
import { Companies } from '../models/companies.model';
import { Listings } from '../models/listings.model';

@injectable({ scope: BindingScope.TRANSIENT })
export class TestDataService {
    constructor(
        @repository(UserRepository) private userRepo: UserRepository,
        @repository(CompaniesRepository) private companyRepo: CompaniesRepository,
        @repository(ListingsRepository) private listingRepo: ListingsRepository,
        @repository(MfiRequestsRepository) private mfiRepo: MfiRequestsRepository,
        @repository(SampleRequestsRepository) private sampleRepo: SampleRequestsRepository,
    ) {}

    async createTestUsers(count: number): Promise<User[]> {
        const hasher = new BcryptHasher(10);
        const defaultPassword = await hasher.hashPassword('Test123!');
        const users = [];
        await this.userRepo.deleteAll({ email: { like: '%@yopmail.com' } });

        for (let i = 1; i <= count; i++) {
            const firstName = TestDataGenerator.randomElement(TestDataGenerator.FIRST_NAMES);
            const lastName = TestDataGenerator.randomElement(TestDataGenerator.LAST_NAMES);
            // Generate 8-digit random username like 60224530
            const username = TestDataGenerator.randomInt(10000000, 99999999).toString();
            const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}@gmail.com`
            
            const existing = await this.userRepo.findOne({ where: { email } });
            if (existing) {
                users.push(existing);
                continue;
            }

            const user = await this.userRepo.create({
                email,
                username,
                passwordHash: defaultPassword,
                firstName,
                lastName,
                prefix: TestDataGenerator.randomElement(TestDataGenerator.PREFIXES),
                jobTitle: TestDataGenerator.randomElement(TestDataGenerator.JOB_TITLES),
                phoneNumber: TestDataGenerator.randomPhoneNumber(),
                mobileNumber: TestDataGenerator.randomPhoneNumber(),
                globalRole: i <= 5 ? UserRoleEnum.ADMIN : UserRoleEnum.USER,
                // Distribute user statuses: ~60% active, ~20% pending, ~10% request_information, ~10% rejected
                status:
                    i <= 5
                        ? UserStatus.ACTIVE // admins always active
                        : TestDataGenerator.randomElement([
                              UserStatus.ACTIVE,
                              UserStatus.ACTIVE,
                              UserStatus.ACTIVE,
                              UserStatus.ACTIVE,
                              UserStatus.ACTIVE,
                              UserStatus.ACTIVE,
                              UserStatus.PENDING,
                              UserStatus.PENDING,
                              UserStatus.REQUEST_INFORMATION,
                              UserStatus.REJECTED,
                          ]),
                isVerified: i <= 5 ? true : Math.random() > 0.3,
                notificationEmailEnabled: true,
                notificationPushEnabled: false,
                notificationInAppEnabled: true,
                isSyncedSalesForce: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            users.push(user);
        }

        return users;
    }

    async createTestCompanies(count: number): Promise<Companies[]> {
        const companies = [];

        for (let i = 0; i < count; i++) {
            const company = await this.companyRepo.create({
                name: TestDataGenerator.COMPANY_NAMES[i % TestDataGenerator.COMPANY_NAMES.length],
                email: `contact@company${i + 1}.com`,
                country: TestDataGenerator.COUNTRIES[i % TestDataGenerator.COUNTRIES.length],
                city: TestDataGenerator.CITIES[i % TestDataGenerator.CITIES.length],
                addressLine1: `${100 + i} Business Park`,
                postalCode: `SW${i + 1} 1AA`,
                phoneNumber: `+44 20 ${7000 + i}0000`,
                companyType: i % 2 === 0 ? CompanyType.MANUFACTURER : CompanyType.PROCESSOR,
                status: CompanyStatus.ACTIVE,
                isHaulier: false,
                isSeller: i % 2 === 0,
                isBuyer: i % 2 === 1,
                favoriteMaterials: [],
                isSyncedSalesForce: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            companies.push(company);
        }

        return companies;
    }

    async createTestListings(count: number, users: User[], companies: Companies[]): Promise<Listings[]> {
        const listings = [];

        for (let i = 0; i < count; i++) {
            const company = companies[i % companies.length];
            const user = users[i % users.length];
            const material = TestDataGenerator.MATERIALS[i % TestDataGenerator.MATERIALS.length];
            const listingType = i % 2 === 0 ? ListingType.SELL : ListingType.WANTED;

            const listing = await this.listingRepo.create({
                companyId: company.id!,
                createdByUserId: user.id!,
                materialType: 'plastic' as any,
                materialItem: material,
                materialForm: TestDataGenerator.randomElement(['Bales', 'Granules', 'Flakes', 'Pellets', 'Regrind']),
                materialGrading: TestDataGenerator.randomElement(['Grade A', 'Grade B', 'Mixed', 'Premium']),
                materialColor: TestDataGenerator.randomElement(['natural', 'black', 'white', 'blue', 'grey']) as any,
                materialFinishing: TestDataGenerator.randomElement(['baled', 'flakes', 'regrind', 'powder', 'sheets']) as any,
                materialPacking: TestDataGenerator.randomElement(['bales', 'bags', 'loose', 'pallets', 'bulk_bags']) as any,
                listingType,
                title: `${material} - ${listingType === ListingType.SELL ? 'For Sale' : 'Wanted'}`,
                description: `High quality ${material} available for trading`,
                // Sell listings use quantity; wanted listings use materialWeightWanted (MT)
                quantity: listingType === ListingType.SELL ? TestDataGenerator.randomInt(100, 1000) : undefined,
                remainingQuantity: listingType === ListingType.SELL ? TestDataGenerator.randomInt(50, 500) : 0,
                materialWeightWanted: listingType === ListingType.WANTED ? TestDataGenerator.randomInt(10, 500) : undefined,
                wasteStoration: listingType === ListingType.WANTED ? TestDataGenerator.randomElement(['indoor', 'outdoor', 'any']) as any : undefined,
                capacityPerMonth: listingType === ListingType.WANTED ? TestDataGenerator.randomInt(5, 100) : undefined,
                weightUnit: 'kg' as any,
                weightPerLoad: listingType === ListingType.SELL ? TestDataGenerator.randomInt(500, 2000) : undefined,
                numberOfLoads: listingType === ListingType.SELL ? TestDataGenerator.randomInt(1, 10) : undefined,
                totalWeight: listingType === ListingType.SELL ? TestDataGenerator.randomInt(1000, 10000) : undefined,
                pricePerMetricTonne: TestDataGenerator.randomInt(100, 1000),
                currency: TestDataGenerator.randomElement(['gbp', 'eur', 'usd']) as any,
                incoterms: TestDataGenerator.randomElement(['EXW', 'FOB', 'CIF', 'DAP', 'DDP']),
                country: TestDataGenerator.randomElement(TestDataGenerator.COUNTRIES),
                ...TestDataGenerator.generateConsistentListingStateStatus(),
                isFeatured: Math.random() > 0.7,
                isUrgent: Math.random() > 0.8,
                startDate: new Date(),
                isSyncedSalesForce: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            listings.push(listing);
        }

        return listings;
    }

    async createMfiRequests(count: number, users: User[], companies: Companies[], listings: Listings[]) {
        const mfiRecords = [];

        for (let i = 0; i < count; i++) {
            const buyerUser = TestDataGenerator.randomElement(users);
            const sellerUser = TestDataGenerator.randomElement(users);
            const buyerCompany = TestDataGenerator.randomElement(companies);
            const sellerCompany = TestDataGenerator.randomElement(companies);
            const listing = TestDataGenerator.randomElement(listings);

            mfiRecords.push(
                TestDataGenerator.generateMfiRequestData({
                    listingId: listing.id!,
                    buyerUserId: buyerUser.id!,
                    buyerCompanyId: buyerCompany.id!,
                    sellerUserId: sellerUser.id!,
                    sellerCompanyId: sellerCompany.id!,
                }),
            );
        }

        return await this.mfiRepo.createAll(mfiRecords);
    }

    async createSampleRequests(count: number, users: User[], companies: Companies[], listings: Listings[]) {
        const sampleRecords = [];

        for (let i = 0; i < count; i++) {
            const buyerUser = TestDataGenerator.randomElement(users);
            const sellerUser = TestDataGenerator.randomElement(users);
            const buyerCompany = TestDataGenerator.randomElement(companies);
            const sellerCompany = TestDataGenerator.randomElement(companies);
            const listing = TestDataGenerator.randomElement(listings);

            sampleRecords.push(
                TestDataGenerator.generateSampleRequestData({
                    listingId: listing.id!,
                    buyerUserId: buyerUser.id!,
                    buyerCompanyId: buyerCompany.id!,
                    sellerUserId: sellerUser.id!,
                    sellerCompanyId: sellerCompany.id!,
                }),
            );
        }

        return await this.sampleRepo.createAll(sampleRecords);
    }

    async cleanupTestData() {
        await this.sampleRepo.deleteAll({});
        await this.mfiRepo.deleteAll({});
        await this.listingRepo.deleteAll({ title: { like: '%For Sale%' } });
        await this.listingRepo.deleteAll({ title: { like: '%Wanted%' } });
        await this.companyRepo.deleteAll({ email: { like: 'contact@company%' } });
        await this.userRepo.deleteAll({ email: { like: '%@yopmail.com' } });
    }
}
