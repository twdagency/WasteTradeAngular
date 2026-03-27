export interface SuccessData<T> {
    data: T[] | T | object;
}

export interface IInQuery {
    $in: string[];
}

export interface IDataResponse<T = object> {
    status: string;
    message: string;
    data: T;
}

export interface IMessageResponse {
    message: string;
}

export interface ITimeRange {
    $gte: Date;
    $lte: Date;
}

export interface PaginationList<T> {
    results: T[];
    totalCount: number;
}
