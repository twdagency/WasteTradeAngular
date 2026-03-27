import { repository } from '@loopback/repository';
import { MigrationScript, migrationScript } from 'loopback4-migration';
import { UserRepository } from '../repositories';
import { UserStatus, UserRoleEnum } from '../enum';
import { genSalt, hash } from 'bcryptjs';

interface PresetAccountData {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password?: string; // If not provided, will be auto-generated
    role: UserRoleEnum;
}

@migrationScript()
export class CreatePresetAdminAccounts implements MigrationScript {
    version = '2.0.7';
    scriptName = 'CreatePresetAdminAccounts';
    description = 'Create preset super admin and admin accounts for Wastetrade';

    constructor(
        @repository(UserRepository)
        private userRepository: UserRepository,
    ) {}

    async up(): Promise<void> {
        console.log('Starting preset admin accounts creation...');

        // Define the preset accounts to be created
        const presetAccounts: PresetAccountData[] = [
            // 1 SuperAdmin
            {
                email: 'superadmin@wastetrade.com',
                username: 'WastetradesuperAdmin',
                firstName: 'Super',
                lastName: 'Admin',
                password: 'Test@123',
                role: UserRoleEnum.SUPER_ADMIN,
            },
            // 5 Admins with provided passwords
            {
                email: 'test1@wastetrade.com',
                username: 'Wastetradeadmin1',
                firstName: 'Admin',
                lastName: 'One',
                password: 'Test@123',
                role: UserRoleEnum.ADMIN,
            },
            {
                email: 'test2@wastetrade.com',
                username: 'Wastetradeadmin2',
                firstName: 'Admin',
                lastName: 'Two',
                password: 'Test@123',
                role: UserRoleEnum.ADMIN,
            },
            {
                email: 'test3@wastetrade.com',
                username: 'Wastetradeadmin3',
                firstName: 'Admin',
                lastName: 'Three',
                password: 'Test@123',
                role: UserRoleEnum.ADMIN,
            },
            {
                email: 'test4@wastetrade.com',
                username: 'Wastetradeadmin4',
                firstName: 'Admin',
                lastName: 'Four',
                password: 'Test@123',
                role: UserRoleEnum.ADMIN,
            },
            {
                email: 'test5@wastetrade.com',
                username: 'Wastetradeadmin5',
                firstName: 'Admin',
                lastName: 'Five',
                password: 'Test@123',
                role: UserRoleEnum.ADMIN,
            },
            // 5 more Admins with auto-generated passwords
            ...Array.from({ length: 5 }, (_, i) => ({
                email: `test${i + 6}@wastetrade.com`,
                username: `Wastetradeadmin${i + 6}`,
                firstName: 'Admin',
                lastName: `Auto${i + 6}`,
                role: UserRoleEnum.ADMIN,
            })),
        ];

        const createdCredentials: Array<{ email: string; password: string; username: string }> = [];

        // Helper function to hash passwords using bcryptjs
        const hashPassword = async (password: string): Promise<string> => {
            const salt = await genSalt(10);
            return hash(password, salt);
        };

        // Helper to generate a random password
        const generatePassword = () => Math.random().toString(36).slice(-12) + 'A!1';

        try {
            for (const account of presetAccounts) {
                // Check if email already exists
                const existingUser = await this.userRepository.findOne({
                    where: { email: account.email.toLowerCase() },
                });

                if (existingUser) {
                    console.log(`Deleting ${account.email} - already exists`);
                    this.userRepository.deleteById(existingUser.id);
                }

                // Use provided password or generate one
                const plainPassword = account.password ?? generatePassword();
                const passwordHash = await hashPassword(plainPassword);

                // Create the user
                const userData = {
                    email: account.email.toLowerCase(),
                    username: account.username,
                    passwordHash: passwordHash,
                    firstName: account.firstName,
                    lastName: account.lastName,
                    globalRole: account.role,
                    status: UserStatus.ACTIVE,
                    isVerified: true,
                    notificationEmailEnabled: true,
                    notificationPushEnabled: true,
                    notificationInAppEnabled: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                const createdUser = await this.userRepository.create(userData);

                createdCredentials.push({
                    email: createdUser.email,
                    password: plainPassword,
                    username: createdUser.username || createdUser.email,
                });

                console.log(`✓ Created preset account: ${createdUser.email} (${createdUser.username})`);
            }
        } catch (error) {
            console.error('❌ Preset admin accounts creation failed:', error);
            throw error;
        }
    }

    async down(): Promise<void> {
        console.log('Rolling back preset admin accounts...');

        try {
            // Remove the preset accounts created by this migration
            const presetEmails = [
                'superadmin@wastetrade.com',
                ...Array.from({ length: 10 }, (_, i) => `test${i + 1}@wastetrade.com`),
            ];

            for (const email of presetEmails) {
                const user = await this.userRepository.findOne({
                    where: { email: email.toLowerCase() },
                });

                if (user && (user.globalRole === UserRoleEnum.SUPER_ADMIN || user.globalRole === UserRoleEnum.ADMIN)) {
                    await this.userRepository.deleteById(user.id);
                    console.log(`✓ Removed preset account: ${email}`);
                }
            }

            console.log('✅ Preset admin accounts rollback completed!');
        } catch (error) {
            console.error('❌ Rollback failed:', error);
            throw error;
        }
    }
}
