import { expect, sinon } from '@loopback/testlab';

import { ListingType } from '../../enum';
import { AdminAssignmentService } from '../../services';

describe('AdminAssignmentService (unit)', () => {
    it('filters wanted listings when recordType=wanted_listing', async () => {
        const listingsRepository = { find: sinon.stub().resolves([]) } as any;
        const service = new AdminAssignmentService({} as any, listingsRepository, {} as any, {} as any);

        await service.getAssignedRecords(5, 'wanted_listing');

        expect(listingsRepository.find.calledOnce).to.be.true();
        expect(listingsRepository.find.firstCall.args[0]).to.containEql({
            where: {
                assignedAdminId: 5,
                listingType: ListingType.WANTED,
            },
        });
    });

    it('filters sell listings when recordType=listing', async () => {
        const listingsRepository = { find: sinon.stub().resolves([]) } as any;
        const service = new AdminAssignmentService({} as any, listingsRepository, {} as any, {} as any);

        await service.getAssignedRecords(7, 'listing');

        expect(listingsRepository.find.calledOnce).to.be.true();
        expect(listingsRepository.find.firstCall.args[0]).to.containEql({
            where: {
                assignedAdminId: 7,
                listingType: ListingType.SELL,
            },
        });
    });
});
