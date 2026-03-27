import { expect, sinon } from '@loopback/testlab';

import { UserRoleEnum, UserStatus } from '../../enum';
import { AdminService } from '../../services';

describe('AdminService (unit)', () => {
    it('filters active admins and sorts by lastName then firstName', async () => {
        const userRepository = {
            count: sinon.stub().resolves({ count: 2 }),
            find: sinon.stub().resolves([
                { id: 2, firstName: 'A', lastName: 'B', status: UserStatus.ACTIVE },
                { id: 1, firstName: 'C', lastName: 'D', status: UserStatus.ACTIVE },
            ]),
        } as any;

        const adminService = new AdminService(userRepository, {} as any, {} as any, {} as any, {} as any);

        const currentUserProfile = { globalRole: UserRoleEnum.SUPER_ADMIN } as any;
        await adminService.getAdmins(currentUserProfile, { skip: 0, limit: 10 } as any);

        expect(userRepository.count.calledOnce).to.be.true();
        expect(userRepository.count.firstCall.args[0]).to.containEql({
            globalRole: { neq: UserRoleEnum.USER },
        });

        expect(userRepository.find.calledOnce).to.be.true();
        expect(userRepository.find.firstCall.args[0]).to.containEql({
            where: {
                globalRole: { neq: UserRoleEnum.USER },
            },
            order: ['lastName ASC', 'firstName ASC'],
            limit: 10,
            skip: 0,
        });
    });
});
