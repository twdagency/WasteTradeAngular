/**
 * offer.service-6.unit.ts
 * Coverage for: getOfferById (visibility rules, currency conversion, location mapping)
 */
import { expect, sinon } from '@loopback/testlab';
import { OfferService } from '../../services/offer.service';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildSvc(overrides: Record<string, any> = {}) {
    const offersRepo = overrides.offersRepo ?? createStubRepo();
    const listingsRepo = overrides.listingsRepo ?? createStubRepo();
    const companiesRepo = overrides.companiesRepo ?? createStubRepo();
    const userRepo = overrides.userRepo ?? createStubRepo();
    const companyUsersRepo = overrides.companyUsersRepo ?? createStubRepo();
    const companyLocationsRepo = overrides.companyLocationsRepo ?? createStubRepo();
    const listingDocsRepo = overrides.listingDocsRepo ?? createStubRepo();
    const emailService = overrides.emailService ?? createStubService([
        'sendOfferCreatedEmail', 'sendOfferAcceptEmail', 'sendOfferRejectionEmail',
        'sendOfferRequestInformationEmail', 'sendOfferStatusUpdatedEmail',
        'sendNewHaulageOpportunityEmail', 'sendAdminNotification',
    ]);
    const exchangeRateService = overrides.exchangeRateService ?? {
        convertOfferToBaseCurrency: sinon.stub().resolves({ offeredPricePerUnit: 100, totalPrice: 1000, currency: 'gbp', originalCurrency: 'eur' }),
        convertToBaseCurrency: sinon.stub().resolves(200),
        baseCurrencyCode: 'gbp',
    };
    const notificationsService = overrides.notificationsService ?? createStubService(['createNotification']);

    const svc = new OfferService(
        offersRepo, listingsRepo, companiesRepo, userRepo,
        companyUsersRepo, companyLocationsRepo, listingDocsRepo,
        emailService, exchangeRateService as any, notificationsService,
    );
    return { svc, offersRepo, listingsRepo, companyLocationsRepo, listingDocsRepo, exchangeRateService };
}

function makeProfile(o: any = {}): any {
    return { id: 5, email: 'u@t.com', firstName: 'J', lastName: 'D', username: 'jd', name: 'J D', companyName: 'Co', globalRole: 'user', companyId: 2, companyRole: 'buyer', isHaulier: false, ...o };
}

function makeOfferRow(o: any = {}): any {
    return {
        id: 1, created_at: '2024-01-01', quantity: 10, offered_price_per_unit: 50,
        total_price: 500, status: 'approved', state: 'active', expires_at: '2025-01-01',
        earliest_delivery_date: '2024-02-01', latest_delivery_date: '2024-03-01',
        currency: 'gbp', message: '', rejection_reason: null, incoterms: 'EXW',
        shipping_port: '', needs_transport: false, listing_id: 10,
        buyer_company_id: 2, buyer_location_id: 20, buyer_user_id: 5,
        seller_company_id: 3, seller_location_id: 30, seller_user_id: 6,
        created_by_user_id: 5, accepted_by_user_id: null, rejected_by_user_id: null,
        updated_at: '2024-01-01', seller_total_amount: 500,
        listing_title: 'Test', listing_status: 'available', listing_state: 'approved',
        listing_quantity: 100, listing_remaining_quantity: 90,
        listing_material_packing: null, listing_material_type: 'plastic',
        listing_material_item: null, listing_material_finishing: null, listing_material_form: null,
        listing_material_weight_per_unit: 5, listing_material_weight_wanted: 50,
        listing_weight_per_load: 10, listing_price_per_metric_tonne: 200,
        listing_pern: null, listing_created_at: '2024-01-01', listing_currency: 'gbp',
        listing_location_id: 30, number_of_offers: 3,
        best_offer: 60, best_offer_currency: 'eur',
        buyer_company_name: 'BuyerCo', buyer_company_country: 'GB', buyer_company_status: 'active',
        buyer_address_line_1: '1 St', buyer_address_line_2: null, buyer_city: 'London',
        buyer_country: 'GB', buyer_state_province: null, buyer_postal_code: 'E1',
        seller_company_name: 'SellerCo', seller_company_country: 'FR', seller_company_status: 'active',
        seller_address_line_1: '2 Rue', seller_address_line_2: null, seller_city: 'Paris',
        seller_country: 'FR', seller_state_province: null, seller_postal_code: '75001',
        buyer_username: 'buyer1', seller_username: 'seller1',
        buyer_first_name: 'Buy', buyer_last_name: 'Er',
        seller_first_name: 'Sell', seller_last_name: 'Er',
        buyer_location_address_line: '1 St', buyer_location_street: 'Main',
        buyer_location_city: 'London', buyer_location_country: 'GB',
        buyer_location_postcode: 'E1', buyer_location_state_province: null,
        buyer_office_open_time: '09:00', buyer_office_close_time: '17:00',
        buyer_access_restrictions: 'None', buyer_container_type: 'box',
        seller_location_address_line: '2 Rue', seller_location_street: 'Ave',
        seller_location_city: 'Paris', seller_location_country: 'FR',
        seller_location_postcode: '75001', seller_location_state_province: null,
        seller_office_open_time: '08:00', seller_office_close_time: '16:00',
        seller_access_restrictions: 'Gate', seller_container_type: 'pallet',
        rejection_source: null,
        ...o,
    };
}

describe('OfferService — Part 6 getOfferById (unit)', () => {
    it('throws 404 when offer not found (null result)', async () => {
        const offersRepo = createStubRepo();
        offersRepo.dataSource = { execute: sinon.stub().resolves(null) };
        const { svc } = buildSvc({ offersRepo });
        await expect(svc.getOfferById(999, makeProfile())).to.be.rejected();
    });

    it('returns full offer detail for buyer (no visibility restrictions)', async () => {
        const offersRepo = createStubRepo();
        offersRepo.dataSource = { execute: sinon.stub().resolves([makeOfferRow()]) };
        const listingDocsRepo = createStubRepo();
        listingDocsRepo.find.resolves([{ id: 1, url: 'doc.pdf' }]);
        const companyLocationsRepo = createStubRepo();
        companyLocationsRepo.findById.resolves({ addressLine: '2 Rue', street: 'Ave', postcode: '75001', city: 'Paris', country: 'FR', stateProvince: null });
        const { svc } = buildSvc({ offersRepo, listingDocsRepo, companyLocationsRepo });

        const result = await svc.getOfferById(1, makeProfile({ companyId: 2 }));
        expect(result.status).to.equal('success');
        expect((result.data as any).offer.id).to.equal(1);
        expect((result.data as any).listing.bestOffer).to.equal(200);
        expect((result.data as any).seller.companyName).to.equal('SellerCo');
        expect((result.data as any).buyer.companyName).to.equal('BuyerCo');
    });

    it('returns offer for admin bypassing visibility', async () => {
        const offersRepo = createStubRepo();
        offersRepo.dataSource = { execute: sinon.stub().resolves([makeOfferRow({ state: 'pending', status: 'pending' })]) };
        const listingDocsRepo = createStubRepo();
        listingDocsRepo.find.resolves([]);
        const companyLocationsRepo = createStubRepo();
        companyLocationsRepo.findById.resolves(null);
        const { svc } = buildSvc({ offersRepo, listingDocsRepo, companyLocationsRepo });

        const result = await svc.getOfferById(1, makeProfile(), true);
        expect(result.status).to.equal('success');
    });

    it('blocks seller from seeing admin-rejected offer', async () => {
        const offersRepo = createStubRepo();
        offersRepo.dataSource = { execute: sinon.stub().resolves([makeOfferRow({
            state: 'closed', status: 'rejected', rejection_source: 'admin', seller_company_id: 3,
        })]) };
        const { svc } = buildSvc({ offersRepo });
        await expect(svc.getOfferById(1, makeProfile({ companyId: 3 }))).to.be.rejected();
    });

    it('blocks seller from seeing pending offer they did not create', async () => {
        const offersRepo = createStubRepo();
        offersRepo.dataSource = { execute: sinon.stub().resolves([makeOfferRow({
            state: 'pending', status: 'pending', seller_company_id: 3, created_by_user_id: 999,
        })]) };
        const { svc } = buildSvc({ offersRepo });
        await expect(svc.getOfferById(1, makeProfile({ companyId: 3 }))).to.be.rejected();
    });

    it('allows seller to see approved active offer', async () => {
        const offersRepo = createStubRepo();
        offersRepo.dataSource = { execute: sinon.stub().resolves([makeOfferRow({ seller_company_id: 3 })]) };
        const listingDocsRepo = createStubRepo();
        listingDocsRepo.find.resolves([]);
        const companyLocationsRepo = createStubRepo();
        companyLocationsRepo.findById.resolves(null);
        const { svc } = buildSvc({ offersRepo, listingDocsRepo, companyLocationsRepo });

        const result = await svc.getOfferById(1, makeProfile({ companyId: 3 }));
        expect(result.status).to.equal('success');
    });

    it('handles offer without best_offer (no currency conversion)', async () => {
        const offersRepo = createStubRepo();
        offersRepo.dataSource = { execute: sinon.stub().resolves([makeOfferRow({ best_offer: null, best_offer_currency: null })]) };
        const listingDocsRepo = createStubRepo();
        listingDocsRepo.find.resolves([]);
        const companyLocationsRepo = createStubRepo();
        companyLocationsRepo.findById.resolves(null);
        const { svc, exchangeRateService } = buildSvc({ offersRepo, listingDocsRepo, companyLocationsRepo });

        const result = await svc.getOfferById(1, makeProfile());
        expect(exchangeRateService.convertToBaseCurrency.called).to.be.false();
        expect((result.data as any).listing.bestOffer).to.equal(0);
    });

    it('handles offer without listing_location_id', async () => {
        const offersRepo = createStubRepo();
        offersRepo.dataSource = { execute: sinon.stub().resolves([makeOfferRow({ listing_location_id: null })]) };
        const listingDocsRepo = createStubRepo();
        listingDocsRepo.find.resolves([]);
        const { svc } = buildSvc({ offersRepo, listingDocsRepo });

        const result = await svc.getOfferById(1, makeProfile());
        expect((result.data as any).listing.location).to.be.null();
    });

    it('includes loading times when location has open/close times', async () => {
        const offersRepo = createStubRepo();
        offersRepo.dataSource = { execute: sinon.stub().resolves([makeOfferRow()]) };
        const listingDocsRepo = createStubRepo();
        listingDocsRepo.find.resolves([]);
        const companyLocationsRepo = createStubRepo();
        companyLocationsRepo.findById.resolves({ addressLine: 'x', street: 'y', postcode: 'z', city: 'c', country: 'FR', stateProvince: null });
        const { svc } = buildSvc({ offersRepo, listingDocsRepo, companyLocationsRepo });

        const result = await svc.getOfferById(1, makeProfile());
        expect((result.data as any).seller.loadingTimes).to.not.be.null();
        expect((result.data as any).buyer.loadingTimes).to.not.be.null();
    });

    it('seller sees system-rejected closed offer', async () => {
        const offersRepo = createStubRepo();
        offersRepo.dataSource = { execute: sinon.stub().resolves([makeOfferRow({
            state: 'closed', status: 'rejected', rejection_source: 'system', seller_company_id: 3,
        })]) };
        const listingDocsRepo = createStubRepo();
        listingDocsRepo.find.resolves([]);
        const companyLocationsRepo = createStubRepo();
        companyLocationsRepo.findById.resolves(null);
        const { svc } = buildSvc({ offersRepo, listingDocsRepo, companyLocationsRepo });

        const result = await svc.getOfferById(1, makeProfile({ companyId: 3 }));
        expect(result.status).to.equal('success');
    });
});
