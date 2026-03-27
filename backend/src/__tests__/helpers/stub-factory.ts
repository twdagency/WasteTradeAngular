import { sinon } from '@loopback/testlab';

export function createStubRepo(
    methods: string[] = ['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById'],
): any {
    const stub: any = {};
    for (const m of methods) stub[m] = sinon.stub();
    stub.dataSource = { execute: sinon.stub() };
    return stub;
}

export function createStubService(methods: string[]): any {
    const stub: any = {};
    for (const m of methods) stub[m] = sinon.stub().resolves();
    return stub;
}
