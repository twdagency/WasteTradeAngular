import { Filter } from '@loopback/repository';
import clone from 'lodash/clone';

export type AggregationPipeline = Record<string, unknown>[];
export type AggregationPayload = { pipeline: AggregationPipeline };
export interface AggregationCount {
    totalCount: number;
}

export function getPaginationPipeline<T extends object>(
    basePipeLine: AggregationPipeline,
    filter?: Filter<T>,
): AggregationPipeline {
    const pipeline: AggregationPipeline = clone(basePipeLine);
    if (filter?.skip) {
        pipeline.push({
            $skip: filter?.skip,
        });
    }
    if (filter?.limit) {
        pipeline.push({
            $limit: filter?.limit,
        });
    }
    return pipeline;
}

export function getTotalCountPipeline(basePipeLine: AggregationPipeline): AggregationPipeline {
    const pipeline: AggregationPipeline = clone(basePipeLine);
    pipeline.push({
        $count: 'totalCount',
    });
    return pipeline;
}

export function getDistinctValuePipeline(fieldName: string, basePipeLine?: AggregationPipeline): AggregationPipeline {
    const pipeline: AggregationPipeline = clone(basePipeLine ?? []);
    return [
        ...pipeline,
        { $group: { _id: `$${fieldName}` } },
        { $sort: { _id: -1 } },
        { $group: { _id: null, data: { $push: '$_id' } } },
        { $project: { _id: 0, data: 1 } },
    ];
}
