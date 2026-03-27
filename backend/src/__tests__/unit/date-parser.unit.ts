import { expect } from '@loopback/testlab';
import {
    parseDateToISO,
    parseDate,
    formatDateToDDMMYYYY,
    isValidDateFormat,
} from '../../utils/date-parser.util';

describe('date-parser.util (unit)', () => {
    describe('parseDateToISO', () => {
        it('returns null for null/undefined/empty', () => {
            expect(parseDateToISO(null)).to.be.null();
            expect(parseDateToISO(undefined)).to.be.null();
            expect(parseDateToISO('')).to.be.null();
        });

        it('parses DD/MM/YYYY format', () => {
            expect(parseDateToISO('31/12/2023')).to.equal('2023-12-31');
            expect(parseDateToISO('01/01/2000')).to.equal('2000-01-01');
        });

        it('parses ISO date string', () => {
            const result = parseDateToISO('2024-06-15');
            expect(result).to.equal('2024-06-15');
        });

        it('returns null for invalid date string', () => {
            expect(parseDateToISO('not-a-date')).to.be.null();
            // DD/MM/YYYY regex matches format — calendar validation not performed
            // truly non-parseable strings return null
            expect(parseDateToISO('hello world')).to.be.null();
        });
    });

    describe('parseDate', () => {
        it('returns null for null/undefined/empty', () => {
            expect(parseDate(null)).to.be.null();
            expect(parseDate(undefined)).to.be.null();
            expect(parseDate('')).to.be.null();
        });

        it('parses DD/MM/YYYY format to Date object', () => {
            const result = parseDate('15/06/2023');
            expect(result).to.be.instanceof(Date);
            expect(result!.getFullYear()).to.equal(2023);
            expect(result!.getMonth()).to.equal(5); // 0-indexed
            expect(result!.getDate()).to.equal(15);
        });

        it('parses ISO string to Date object', () => {
            const result = parseDate('2023-06-15');
            expect(result).to.be.instanceof(Date);
            expect(result!.getFullYear()).to.equal(2023);
        });

        it('returns null for invalid date', () => {
            expect(parseDate('invalid')).to.be.null();
        });
    });

    describe('formatDateToDDMMYYYY', () => {
        it('formats Date to DD/MM/YYYY', () => {
            expect(formatDateToDDMMYYYY(new Date(2023, 11, 31))).to.equal('31/12/2023');
            expect(formatDateToDDMMYYYY(new Date(2000, 0, 1))).to.equal('01/01/2000');
        });

        it('pads single-digit day and month', () => {
            const result = formatDateToDDMMYYYY(new Date(2024, 2, 5)); // March 5
            expect(result).to.equal('05/03/2024');
        });
    });

    describe('isValidDateFormat', () => {
        it('returns false for null/undefined/empty', () => {
            expect(isValidDateFormat(null)).to.be.false();
            expect(isValidDateFormat(undefined)).to.be.false();
            expect(isValidDateFormat('')).to.be.false();
        });

        it('returns true for valid DD/MM/YYYY', () => {
            expect(isValidDateFormat('01/06/2023')).to.be.true();
        });

        it('returns true for valid ISO format', () => {
            expect(isValidDateFormat('2023-06-01')).to.be.true();
        });

        it('returns false for invalid date strings', () => {
            expect(isValidDateFormat('not-a-date')).to.be.false();
        });
    });
});
