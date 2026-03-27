import { expect, sinon } from '@loopback/testlab';
import { WasteTradeNotificationsService } from '../../services/waste-trade-notifications.service';
import { NotificationType } from '../../enum';

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

describe('WasteTradeNotificationsService (unit)', () => {
    describe('createNotification', () => {
        it('creates notification with correct fields', async () => {
            const repo = makeRepo();
            const service = new WasteTradeNotificationsService(repo);

            await service.createNotification(42, NotificationType.DOCUMENT_EXPIRY, { key: 'val' });

            expect(repo.create.calledOnce).to.be.true();
            const arg = repo.create.firstCall.args[0];
            expect(arg.userId).to.equal(42);
            expect(arg.type).to.equal(NotificationType.DOCUMENT_EXPIRY);
            expect(arg.isRead).to.be.false();
        });

        it('skips creation when userId is 0/falsy', async () => {
            const repo = makeRepo();
            const service = new WasteTradeNotificationsService(repo);

            await service.createNotification(0, NotificationType.DOCUMENT_EXPIRY, {});

            expect(repo.create.called).to.be.false();
        });

        it('throws InternalServerError when repo.create fails', async () => {
            const repo = makeRepo({ create: sinon.stub().rejects(new Error('db error')) });
            const service = new WasteTradeNotificationsService(repo);

            await expect(service.createNotification(1, NotificationType.DOCUMENT_EXPIRY, {})).to.be.rejectedWith(
                /Failed to create notification/,
            );
        });
    });

    describe('getNotifications', () => {
        it('returns paginated notifications for user', async () => {
            const notifications = [{ id: 1, userId: 5, isRead: false }];
            const repo = makeRepo({
                count: sinon.stub().resolves({ count: 1 }),
                find: sinon.stub().resolves(notifications),
            });
            const service = new WasteTradeNotificationsService(repo);

            const result = await service.getNotifications(5, { limit: 10, skip: 0 });

            expect(result.totalCount).to.equal(1);
            expect(result.results).to.deepEqual(notifications);
        });

        it('filters by isRead when provided in filter.where', async () => {
            const repo = makeRepo({
                count: sinon.stub().resolves({ count: 2 }),
                find: sinon.stub().resolves([]),
            });
            const service = new WasteTradeNotificationsService(repo);

            await service.getNotifications(5, { where: { isRead: false } } as any);

            const whereArg = repo.find.firstCall.args[0].where;
            expect(whereArg.isRead).to.be.false();
        });
    });

    describe('markAsRead', () => {
        it('marks notification as read', async () => {
            const notification = { id: 10, userId: 5, isRead: false };
            const repo = makeRepo({ findOne: sinon.stub().resolves(notification) });
            const service = new WasteTradeNotificationsService(repo);

            const result = await service.markAsRead(10, 5);

            expect(repo.updateById.calledOnce).to.be.true();
            expect(repo.updateById.firstCall.args[1]).to.containEql({ isRead: true });
            expect(result.status).to.equal('success');
        });

        it('throws NotFound when notification does not belong to user', async () => {
            const repo = makeRepo({ findOne: sinon.stub().resolves(null) });
            const service = new WasteTradeNotificationsService(repo);

            await expect(service.markAsRead(99, 5)).to.be.rejectedWith(/waste-trade-notifications-not-found/);
        });
    });

    describe('markAllAsRead', () => {
        it('calls updateAll with correct userId and isRead false', async () => {
            const repo = makeRepo();
            const service = new WasteTradeNotificationsService(repo);

            const result = await service.markAllAsRead(7);

            expect(repo.updateAll.calledOnce).to.be.true();
            const [updateData, where] = repo.updateAll.firstCall.args;
            expect(updateData.isRead).to.be.true();
            expect(where.userId).to.equal(7);
            expect(result.status).to.equal('success');
        });
    });

    describe('getUnreadCount', () => {
        it('returns unread count for user', async () => {
            const repo = makeRepo({ count: sinon.stub().resolves({ count: 3 }) });
            const service = new WasteTradeNotificationsService(repo);

            const result = await service.getUnreadCount(7);

            expect(result.data?.count).to.equal(3);
        });
    });
});
