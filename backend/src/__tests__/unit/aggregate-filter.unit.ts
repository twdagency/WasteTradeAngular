import { expect } from '@loopback/testlab';
import {
    getPaginationPipeline,
    getTotalCountPipeline,
    getDistinctValuePipeline,
    AggregationPipeline,
} from '../../utils/aggregate-filter';

describe('aggregate-filter utils (unit)', () => {

    // ── getPaginationPipeline ─────────────────────────────────────────────────
    describe('getPaginationPipeline', () => {
        it('returns base pipeline unchanged when no filter provided', () => {
            const base: AggregationPipeline = [{ $match: { status: 'active' } }];
            const result = getPaginationPipeline(base);
            expect(result).to.deepEqual(base);
        });

        it('appends $skip stage when filter.skip is set', () => {
            const base: AggregationPipeline = [{ $match: {} }];
            const result = getPaginationPipeline(base, { skip: 20 });
            expect(result.length).to.equal(2);
            expect(result[1]).to.deepEqual({ $skip: 20 });
        });

        it('appends $limit stage when filter.limit is set', () => {
            const base: AggregationPipeline = [{ $match: {} }];
            const result = getPaginationPipeline(base, { limit: 10 });
            expect(result.length).to.equal(2);
            expect(result[1]).to.deepEqual({ $limit: 10 });
        });

        it('appends both $skip and $limit when both are set', () => {
            const base: AggregationPipeline = [{ $match: {} }];
            const result = getPaginationPipeline(base, { skip: 5, limit: 15 });
            expect(result.length).to.equal(3);
            expect(result[1]).to.deepEqual({ $skip: 5 });
            expect(result[2]).to.deepEqual({ $limit: 15 });
        });

        it('does not mutate the original base pipeline', () => {
            const base: AggregationPipeline = [{ $match: { status: 'active' } }];
            const baseCopy = JSON.parse(JSON.stringify(base));
            getPaginationPipeline(base, { skip: 10, limit: 5 });
            expect(base).to.deepEqual(baseCopy);
        });

        it('returns clone of base with empty filter object (no skip/limit)', () => {
            const base: AggregationPipeline = [{ $match: { x: 1 } }];
            const result = getPaginationPipeline(base, {});
            expect(result).to.deepEqual(base);
            expect(result).to.not.equal(base); // different reference (clone)
        });

        it('handles skip=0 (falsy) — does not append $skip stage', () => {
            const base: AggregationPipeline = [{ $match: {} }];
            const result = getPaginationPipeline(base, { skip: 0 });
            // skip=0 is falsy, so no $skip stage added
            expect(result.length).to.equal(1);
        });
    });

    // ── getTotalCountPipeline ─────────────────────────────────────────────────
    describe('getTotalCountPipeline', () => {
        it('appends $count stage to base pipeline', () => {
            const base: AggregationPipeline = [{ $match: { status: 'active' } }];
            const result = getTotalCountPipeline(base);
            expect(result.length).to.equal(2);
            expect(result[1]).to.deepEqual({ $count: 'totalCount' });
        });

        it('works on empty base pipeline', () => {
            const result = getTotalCountPipeline([]);
            expect(result.length).to.equal(1);
            expect(result[0]).to.deepEqual({ $count: 'totalCount' });
        });

        it('does not mutate the original base pipeline', () => {
            const base: AggregationPipeline = [{ $match: {} }];
            const originalLength = base.length;
            getTotalCountPipeline(base);
            expect(base.length).to.equal(originalLength);
        });

        it('preserves all base stages before the $count', () => {
            const base: AggregationPipeline = [
                { $match: { active: true } },
                { $sort: { createdAt: -1 } },
            ];
            const result = getTotalCountPipeline(base);
            expect(result[0]).to.deepEqual({ $match: { active: true } });
            expect(result[1]).to.deepEqual({ $sort: { createdAt: -1 } });
            expect(result[2]).to.deepEqual({ $count: 'totalCount' });
        });
    });

    // ── getDistinctValuePipeline ─────────────────────────────────────────────
    describe('getDistinctValuePipeline', () => {
        it('returns pipeline with $group, $sort, $group, $project stages', () => {
            const result = getDistinctValuePipeline('status');
            expect(result.length).to.equal(4);
        });

        it('groups by the specified field name', () => {
            const result = getDistinctValuePipeline('category');
            const groupStage = result[0] as any;
            expect(groupStage.$group._id).to.equal('$category');
        });

        it('includes $sort descending on _id', () => {
            const result = getDistinctValuePipeline('material');
            const sortStage = result[1] as any;
            expect(sortStage.$sort._id).to.equal(-1);
        });

        it('final $project exposes data field and hides _id', () => {
            const result = getDistinctValuePipeline('status');
            const projectStage = result[3] as any;
            expect(projectStage.$project._id).to.equal(0);
            expect(projectStage.$project.data).to.equal(1);
        });

        it('prepends base pipeline stages before the group stages', () => {
            const base: AggregationPipeline = [{ $match: { active: true } }];
            const result = getDistinctValuePipeline('status', base);
            expect(result.length).to.equal(5);
            expect(result[0]).to.deepEqual({ $match: { active: true } });
        });

        it('works with empty base pipeline (default)', () => {
            const result = getDistinctValuePipeline('type');
            expect(result.length).to.equal(4);
        });

        it('does not mutate provided base pipeline', () => {
            const base: AggregationPipeline = [{ $match: { x: 1 } }];
            const originalLength = base.length;
            getDistinctValuePipeline('type', base);
            expect(base.length).to.equal(originalLength);
        });
    });
});
