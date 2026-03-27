/**
 * waste-trade-notifications.service-2.unit.ts
 * Coverage for: markAsUnread, error paths for markAsRead/markAllAsRead/getNotifications/getUnreadCount
 */
import { expect, sinon } from '@loopback/testlab';
import { WasteTradeNotificationsService } from '../../services/waste-trade-notifications.service';

function makeRepo(overrides = {}) {
    return {
        create: sinon.stub().resolves({ id: 1 }),
        find: sinon.stub().resolves([]),
        findOne: sinon.stub().resolves(null),
        count: sinon.stub().resolves({ count: 0 }),
        updateById: sinon.stub().resolves(),
        updateAll: sinon.stub().resolves({ count: 1 }),
        ...overrides,
    } as any;
}

describe('WasteTradeNotificationsService Part 2 (unit)', () => {
    describe('markAsUnread()', () => {
        it('marks notification as unread', async () => {
            const repo = makeRepo({ findOne: sinon.stub().resolves({ id: 10, userId: 5, isRead: true }) });
            const svc = new WasteTradeNotificationsService(repo);

            const result = await svc.markAsUnread(10, 5);
            expect(result.status).to.equal('success');
            expect(repo.updateById.calledOnce).to.be.true();
            expect(repo.updateById.firstCall.args[1]).to.containEql({ isRead: false });
        });

        it('throws NotFound when notification not found', async () => {
            const repo = makeRepo();
            const svc = new WasteTradeNotificationsService(repo);
            await expect(svc.markAsUnread(999, 5)).to.be.rejectedWith(/not-found/);
        });

        it('throws InternalServerError on unexpected error', async () => {
            const repo = makeRepo({
                findOne: sinon.stub().rejects(new Error('db crash')),
            });
            const svc = new WasteTradeNotificationsService(repo);
            await expect(svc.markAsUnread(10, 5)).to.be.rejectedWith(/Failed to mark notification/);
        });
    });

    describe('markAsRead() — error paths', () => {
        it('throws InternalServerError on unexpected error', async () => {
            const repo = makeRepo({
                findOne: sinon.stub().rejects(new Error('db crash')),
            });
            const svc = new WasteTradeNotificationsService(repo);
            await expect(svc.markAsRead(10, 5)).to.be.rejectedWith(/Failed to mark notification/);
        });
    });

    describe('markAllAsRead() — error path', () => {
        it('throws InternalServerError when updateAll fails', async () => {
            const repo = makeRepo({
                updateAll: sinon.stub().rejects(new Error('db error')),
            });
            const svc = new WasteTradeNotificationsService(repo);
            await expect(svc.markAllAsRead(7)).to.be.rejectedWith(/Failed to mark all/);
        });
    });

    describe('getNotifications() — error path', () => {
        it('throws InternalServerError when query fails', async () => {
            const repo = makeRepo({
                count: sinon.stub().rejects(new Error('connection lost')),
            });
            const svc = new WasteTradeNotificationsService(repo);
            await expect(svc.getNotifications(5)).to.be.rejectedWith(/Failed to retrieve/);
        });

        it('passes include filter through', async () => {
            const repo = makeRepo({
                count: sinon.stub().resolves({ count: 0 }),
                find: sinon.stub().resolves([]),
            });
            const svc = new WasteTradeNotificationsService(repo);
            await svc.getNotifications(5, { include: [{ relation: 'user' }] } as any);
            const findArg = repo.find.firstCall.args[0];
            expect(findArg.include).to.deepEqual([{ relation: 'user' }]);
        });
    });

    describe('getUnreadCount() — error path', () => {
        it('throws InternalServerError when count fails', async () => {
            const repo = makeRepo({
                count: sinon.stub().rejects(new Error('db down')),
            });
            const svc = new WasteTradeNotificationsService(repo);
            await expect(svc.getUnreadCount(5)).to.be.rejectedWith(/Failed to retrieve unread/);
        });
    });
});
