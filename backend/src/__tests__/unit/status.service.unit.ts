import { expect } from '@loopback/testlab';
import { StatusService } from '../../services/status.service';
import { OfferStatusEnum, HaulageOfferStatus } from '../../enum';

describe('StatusService (unit)', () => {
    let service: StatusService;

    beforeEach(() => {
        service = new StatusService();
    });

    describe('getShippingStatus', () => {
        it('returns partial load string for PARTIALLY_SHIPPED offer', () => {
            const result = service.getShippingStatus(OfferStatusEnum.PARTIALLY_SHIPPED, 5, 2);
            expect(result).to.equal('Load 2 of 5 Shipped');
        });

        it('returns partial load string for PARTIALLY_SHIPPED haulage offer', () => {
            const result = service.getShippingStatus(HaulageOfferStatus.PARTIALLY_SHIPPED, 10, 3);
            expect(result).to.equal('Load 3 of 10 Shipped');
        });

        it('returns Partially Shipped when shippedLoads equals totalLoads', () => {
            const result = service.getShippingStatus(OfferStatusEnum.PARTIALLY_SHIPPED, 5, 5);
            expect(result).to.equal('Partially Shipped');
        });

        it('returns formatted status for non-partial status', () => {
            // formatStatusText does NOT lowercase — splits on _ only
            const result = service.getShippingStatus('ACCEPTED', 5);
            expect(result).to.equal('ACCEPTED');
        });

        it('returns Partially Shipped when shippedLoads is undefined', () => {
            const result = service.getShippingStatus(OfferStatusEnum.PARTIALLY_SHIPPED, 5);
            expect(result).to.equal('Partially Shipped');
        });
    });

    describe('formatStatusText', () => {
        it('splits on underscore and joins with space (preserves case of each word)', () => {
            // charAt(0).toUpperCase() + slice(1) does NOT lowercase rest of word
            expect(service.formatStatusText('PARTIALLY_SHIPPED')).to.equal('PARTIALLY SHIPPED');
        });

        it('returns single word unchanged when no underscores', () => {
            expect(service.formatStatusText('PENDING')).to.equal('PENDING');
        });

        it('handles mixed-case input', () => {
            expect(service.formatStatusText('partially_shipped')).to.equal('Partially Shipped');
        });
    });

    describe('getStatusColor', () => {
        it('returns success for approved status', () => {
            expect(service.getStatusColor('approved')).to.equal('success');
        });

        it('returns warning for pending status', () => {
            expect(service.getStatusColor('pending')).to.equal('warning');
        });

        it('returns danger for rejected status', () => {
            expect(service.getStatusColor('rejected')).to.equal('danger');
        });

        it('returns secondary for unknown status', () => {
            expect(service.getStatusColor('unknown_status')).to.equal('secondary');
        });

        it('returns info for ongoing status', () => {
            expect(service.getStatusColor('ongoing')).to.equal('info');
        });
    });

    describe('getListingStatuses', () => {
        it('returns array of listing statuses', () => {
            const statuses = service.getListingStatuses();
            expect(statuses).to.be.an.Array();
            expect(statuses.length).to.be.greaterThan(0);
            expect(statuses[0]).to.have.properties(['value', 'label']);
        });
    });

    describe('getWantedListingStatuses', () => {
        it('returns array of wanted listing statuses', () => {
            const statuses = service.getWantedListingStatuses();
            expect(statuses).to.be.an.Array();
            expect(statuses.length).to.be.greaterThan(0);
        });
    });
});
