import { CompanyUsersRepository } from './../repositories/company-users.repository';
import { service } from '@loopback/core';
import { EmailService } from '../services/email.service';
import { get, param, response } from '@loopback/rest';
import { authenticate } from '@loopback/authentication';
import { CompaniesRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { IDataResponse } from '../types';
import { messages } from '../constants';
export class ConfirmationController {
    constructor(
        @service(EmailService)
        public emailService: EmailService,
        @repository(CompaniesRepository)
        public companyRepository: CompaniesRepository,
        @repository(CompanyUsersRepository)
        public companyUserRepository: CompanyUsersRepository,
    ) {}

    @authenticate('jwt')
    @get('/confirmation')
    @response(200, {
        description: 'Confirmation email sent',
    })
    async sendConfirmationEmail(@param.query.string('companyId') companyId: string): Promise<IDataResponse> {
        try {
            const company = await this.companyRepository.findOne({
                where: {
                    id: Number(companyId),
                },
            });
            if (!company) {
                throw new HttpErrors[404](messages.companyNotFound);
            }
            await this.emailService.sendAdminNotification(company);

            return {
                status: 'success',
                message: 'Confirmation email sent',
                data: {},
            };
        } catch (error) {
            if (error.code === 400) {
                throw new HttpErrors[400](messages.emailServiceError);
            }
            throw error;
        }
    }
}
