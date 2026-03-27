/* eslint-disable @typescript-eslint/no-explicit-any */
import { BindingScope, injectable, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { MyUserProfile } from '../authentication-strategies/type';
import { COMPLETE_ACCOUNT_DRAFT_EXPIRED_DAYS, FE_BASE_URL } from '../config';
import { DataDraftTypeEnum } from '../enum';
import { DataDraft } from '../models';
import { DataDraftRepository } from '../repositories';
import { IUserLoginData } from '../types';
import { IDataResponse } from '../types/common';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { messages } from '../constants/messages';

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);

interface DataDraftPayload {
    draftId?: number;
    email?: string;
    type?: DataDraftTypeEnum;
}

@injectable({ scope: BindingScope.TRANSIENT })
export class DataDraftService {
    constructor(
        @repository(DataDraftRepository)
        public dataDraftRepository: DataDraftRepository,
        @service(EmailService)
        public emailService: EmailService,
        @service(AuthService)
        public authService: AuthService,
    ) {}

    public async saveDataDraft(
        data: unknown,
        isAuto: boolean = false,
        userProfile: Partial<MyUserProfile>,
    ): Promise<IDataResponse<null>> {
        // Validate JSON data
        try {
            JSON.stringify(data);
        } catch (error) {
            throw new HttpErrors[400]('Invalid JSON data format');
        }

        // Check if draft already exists for this email and type
        const existingDrafts = await this.dataDraftRepository.find({
            where: {
                email: userProfile.email,
            },
            limit: 1,
        });
        let draft = existingDrafts[0];

        let secret: string;

        if (draft) {
            // Update existing draft
            // Update new secret to invalidate old token
            secret = isAuto ? draft.secret : uuidv4();

            await this.dataDraftRepository.updateById(draft.id, {
                data: JSON.stringify(data),
                secret, // Update secret to invalidate old token
                updatedAt: new Date(),
            });
        } else {
            // Create new draft
            secret = uuidv4();

            const newDraft: Partial<DataDraft> = {
                type: DataDraftTypeEnum.COMPLETE_ACCOUNT,
                email: userProfile.email,
                data: JSON.stringify(data),
                secret,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            draft = await this.dataDraftRepository.create(newDraft);
        }

        // Only generate token and send email if not auto-save
        if (!isAuto) {
            let token: string;
            try {
                const payload: DataDraftPayload = {
                    draftId: draft.id,
                    email: draft.email,
                    type: draft.type,
                };
                token = await signAsync(payload, secret, {
                    expiresIn: COMPLETE_ACCOUNT_DRAFT_EXPIRED_DAYS,
                });
            } catch (error) {
                throw new HttpErrors[500](`Error generating token: ${error}`);
            }

            const urlDraft = `${FE_BASE_URL}/resume?token=${token}`;

            await this.emailService.sendCompleteAccountDraftEmail(urlDraft, userProfile);
        }

        return {
            status: 'success',
            message: 'Data draft saved successfully',
            data: null,
        };
    }

    public async getLatestDataDraft(
        token: string,
    ): Promise<IDataResponse<{ dataDraft: unknown; userLoginData: IUserLoginData | null } | null>> {
        let decoded: DataDraftPayload;
        let draft: DataDraft | null = null;

        try {
            // First decode without verification to get draft ID
            decoded = jwt.decode(token);

            if (!decoded?.draftId) {
                throw new HttpErrors[400](messages.dataDraftTokenInvalid);
            }

            // Get draft from database
            draft = await this.dataDraftRepository.findById(decoded.draftId);

            if (!draft) {
                throw new HttpErrors[404](messages.dataDraftTokenInvalid);
            }

            // Verify token with draft's secret
            try {
                jwt.verify(token, draft.secret);
            } catch (verifyError) {
                // Token expired or invalid
                if (verifyError.name === 'TokenExpiredError') {
                    // Hard delete expired draft
                    await this.dataDraftRepository.deleteById(draft.id);
                    throw new HttpErrors[401](messages.dataDraftTokenExpired);
                }
                throw new HttpErrors[401](messages.dataDraftTokenInvalid);
            }

            return {
                status: 'success',
                message: 'Data draft retrieved successfully',
                data: {
                    dataDraft: JSON.parse(draft.data),
                    userLoginData: await this.authService
                        .login(
                            {
                                email: draft.email,
                                password: '',
                            },
                            true,
                        )
                        .then((response) => response?.data?.user)
                        .catch(() => null),
                },
            };
        } catch (error: any) {
            // If it's already an HttpError, rethrow it
            if (error.statusCode) {
                throw error;
            }

            // Handle other errors
            throw new HttpErrors[500](`Error retrieving draft: ${error.message}`);
        }
    }
}
