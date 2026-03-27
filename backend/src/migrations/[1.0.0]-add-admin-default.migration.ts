import { repository } from '@loopback/repository';
import { MigrationScript, migrationScript } from 'loopback4-migration';
import { UserRepository } from '../repositories';
import { UserStatus, UserRoleEnum } from '../enum';
@migrationScript()
export class AddAdminDefault implements MigrationScript {
    version = '1.0.0';
    scriptName = 'AddAdminDefault';
    description = 'Add admin default';

    constructor(
        @repository(UserRepository)
        private userRepository: UserRepository,
    ) {}

    async up(): Promise<void> {
        try {
            await this.userRepository.createAll([
                {
                    email: 'super.admin@wastetrade.com',
                    passwordHash: '$2y$10$NrhbNoTUG1i43uKCuqxMKux5G/u36Db4SCQM5r8yxBLH83rWzM46q',
                    firstName: 'Super',
                    lastName: 'Admin',
                    isVerified: true,

                    globalRole: UserRoleEnum.SUPER_ADMIN,
                    status: UserStatus.ACTIVE,
                    notificationEmailEnabled: true,
                    notificationPushEnabled: true,
                    notificationInAppEnabled: true,
                },
                {
                    email: 'admin@wastetrade.com',
                    passwordHash: '$2y$10$NrhbNoTUG1i43uKCuqxMKux5G/u36Db4SCQM5r8yxBLH83rWzM46q',
                    firstName: 'Admin',
                    lastName: 'Admin',
                    isVerified: true,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    globalRole: 'admin' as any,
                    status: UserStatus.ACTIVE,
                    notificationEmailEnabled: true,
                    notificationPushEnabled: true,
                    notificationInAppEnabled: true,
                },
            ]);
        } catch (error) {
            console.error('Add admin default up script ran failed!:', error);
        }
        console.log('Add admin default up script ran completed!');
    }

    async down(): Promise<void> {
        // write the statements to rollback the migration if required and possible
    }
}
