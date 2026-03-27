import { Entity, DefaultCrudRepository, DataObject, Options, Where, Count, juggler } from '@loopback/repository';

/**
 * Base repository for models that sync to Salesforce.
 *
 * On every updateById / updateAll / replaceById it automatically:
 *  - sets `updatedAt` to now
 *  - sets `isSyncedSalesForce` to false (marks dirty for next sync)
 *
 * Exception: when the caller explicitly sets `isSyncedSalesForce: true`
 * (i.e. updateSyncTracking after a successful sync), both auto-fields
 * are skipped to avoid marking the record dirty again.
 */
export class SyncAwareCrudRepository<
    T extends Entity,
    ID,
    Relations extends object = {},
> extends DefaultCrudRepository<T, ID, Relations> {
    constructor(entityClass: typeof Entity & { prototype: T }, dataSource: juggler.DataSource) {
        super(entityClass, dataSource);
    }

    private applySyncDefaults(data: DataObject<T>): DataObject<T> {
        const d = data as Record<string, unknown>;

        // When updateSyncTracking marks a record as synced, skip all
        // auto-defaults — bumping updatedAt here would make the record
        // look dirty again (updatedAt > lastSyncedSalesForceDate).
        if (d.isSyncedSalesForce === true) {
            return data;
        }

        // Business update: stamp updatedAt and mark dirty for SF sync
        if (!('updatedAt' in d)) {
            d.updatedAt = new Date();
        }

        if (!('isSyncedSalesForce' in d)) {
            d.isSyncedSalesForce = false;
        }

        return data;
    }

    async updateById(id: ID, data: DataObject<T>, options?: Options): Promise<void> {
        this.applySyncDefaults(data);
        return super.updateById(id, data, options);
    }

    async updateAll(data: DataObject<T>, where?: Where<T>, options?: Options): Promise<Count> {
        this.applySyncDefaults(data);
        return super.updateAll(data, where, options);
    }

    async replaceById(id: ID, data: DataObject<T>, options?: Options): Promise<void> {
        this.applySyncDefaults(data);
        return super.replaceById(id, data, options);
    }
}
