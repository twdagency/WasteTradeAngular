import { repository } from '@loopback/repository';
import { MigrationScript, migrationScript } from 'loopback4-migration';
import { UserRepository, CompaniesRepository } from '../repositories';

@migrationScript()
export class UpdatePhoneNumberVarcharLength implements MigrationScript {
    version = '1.0.9';
    scriptName = 'UpdatePhoneNumberVarcharLength';
    description =
        'Update phone_number and mobile_number fields from varchar(20) to varchar(30) in users and companies tables';

    constructor(
        @repository(UserRepository)
        private userRepository: UserRepository,
        @repository(CompaniesRepository)
        private companiesRepository: CompaniesRepository,
    ) {}

    async up(): Promise<void> {
        try {
            const datasource = this.userRepository.dataSource;

            // Update users table phone_number column
            await datasource.execute(`
                ALTER TABLE public.users
                ALTER COLUMN phone_number TYPE varchar(30);
            `);

            // Update users table mobile_number column
            await datasource.execute(`
                ALTER TABLE public.users
                ALTER COLUMN mobile_number TYPE varchar(30);
            `);

            // Update companies table phone_number column
            await datasource.execute(`
                ALTER TABLE public.companies
                ALTER COLUMN phone_number TYPE varchar(30);
            `);

            // Update companies table mobile_number column
            await datasource.execute(`
                ALTER TABLE public.companies
                ALTER COLUMN mobile_number TYPE varchar(30);
            `);

            console.log('Migration completed: Updated phone number fields to varchar(30)');
        } catch (error) {
            console.error('Update phone number varchar length up script failed:', error);
            throw error;
        }
    }

    async down(): Promise<void> {
        try {
            const datasource = this.userRepository.dataSource;

            // Rollback: Update users table phone_number column back to varchar(20)
            // Note: This may truncate data if any phone numbers exceed 20 characters
            await datasource.execute(`
                ALTER TABLE public.users
                ALTER COLUMN phone_number TYPE varchar(20);
            `);

            // Rollback: Update users table mobile_number column back to varchar(20)
            await datasource.execute(`
                ALTER TABLE public.users
                ALTER COLUMN mobile_number TYPE varchar(20);
            `);

            // Rollback: Update companies table phone_number column back to varchar(20)
            await datasource.execute(`
                ALTER TABLE public.companies
                ALTER COLUMN phone_number TYPE varchar(20);
            `);

            // Rollback: Update companies table mobile_number column back to varchar(20)
            await datasource.execute(`
                ALTER TABLE public.companies
                ALTER COLUMN mobile_number TYPE varchar(20);
            `);

            console.log('Migration rollback completed: Reverted phone number fields to varchar(20)');
        } catch (error) {
            console.error('Update phone number varchar length down script failed:', error);
            throw error;
        }
    }
}
