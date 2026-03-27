import { expect } from '@loopback/testlab';
import {
    getMaterialRequirementStatus,
    formatDateForMaterialRequired,
    normalizeTimeToPostgres,
} from '../../utils/common';

describe('common utils - additional coverage (unit)', () => {
    describe('getMaterialRequirementStatus', () => {
        it('returns Rejected when status is rejected', () => {
            expect(getMaterialRequirementStatus('rejected', 'active', null)).to.equal('Rejected');
        });

        it('returns Rejected when state is rejected', () => {
            expect(getMaterialRequirementStatus('available', 'rejected', null)).to.equal('Rejected');
        });

        it('returns Pending when status is pending', () => {
            expect(getMaterialRequirementStatus('pending', 'active', null)).to.equal('Pending');
        });

        it('returns Fulfilled when status is sold', () => {
            expect(getMaterialRequirementStatus('sold', 'active', null)).to.equal('Fulfilled');
        });

        it('returns Fulfilled when state is closed', () => {
            expect(getMaterialRequirementStatus('available', 'closed', null)).to.equal('Fulfilled');
        });

        it('returns More Information Required for rejection reason', () => {
            expect(
                getMaterialRequirementStatus('available', 'active', null, 'more_information_required'),
            ).to.equal('More Information Required');
        });

        it('returns Material Required when no startDate', () => {
            expect(getMaterialRequirementStatus('available', 'active', null)).to.equal('Material Required');
        });

        it('returns Material Required when startDate is today or past', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const result = getMaterialRequirementStatus('available', 'active', yesterday);
            expect(result).to.equal('Material Required');
        });

        it('returns Material Required from {date} when startDate is future', () => {
            const future = new Date();
            future.setDate(future.getDate() + 10);
            const result = getMaterialRequirementStatus('available', 'active', future);
            expect(result).to.startWith('Material Required from ');
        });
    });

    describe('formatDateForMaterialRequired', () => {
        it('formats date as D/M/YYYY without zero-padding', () => {
            const date = new Date(2024, 3, 5); // April 5, 2024
            expect(formatDateForMaterialRequired(date)).to.equal('5/4/2024');
        });

        it('formats date with double-digit day/month', () => {
            const date = new Date(2024, 11, 30); // Dec 30
            expect(formatDateForMaterialRequired(date)).to.equal('30/12/2024');
        });
    });

    describe('normalizeTimeToPostgres', () => {
        it('returns null for null/undefined/empty', () => {
            expect(normalizeTimeToPostgres(null)).to.be.null();
            expect(normalizeTimeToPostgres(undefined)).to.be.null();
            expect(normalizeTimeToPostgres('')).to.be.null();
            expect(normalizeTimeToPostgres('   ')).to.be.null();
        });

        it('parses HH:MM format', () => {
            expect(normalizeTimeToPostgres('09:30')).to.equal('09:30:00');
            expect(normalizeTimeToPostgres('23:59')).to.equal('23:59:00');
        });

        it('parses HH:MM:SS format', () => {
            expect(normalizeTimeToPostgres('14:05:30')).to.equal('14:05:30');
        });

        it('returns null for out-of-range values', () => {
            expect(normalizeTimeToPostgres('25:00')).to.be.null();
            expect(normalizeTimeToPostgres('12:60')).to.be.null();
        });

        it('returns null for non-time strings', () => {
            expect(normalizeTimeToPostgres('not-a-time')).to.be.null();
        });

        it('parses ISO datetime string and extracts time part', () => {
            const result = normalizeTimeToPostgres('2024-01-15T14:30:00.000Z');
            expect(result).to.match(/^\d{2}:\d{2}:\d{2}$/);
        });
    });
});
