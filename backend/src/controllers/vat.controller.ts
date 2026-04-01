import {get, HttpErrors, param, response} from '@loopback/rest';
import axios from 'axios';

const VATSENSE_API_URL = 'https://api.vatsense.com/1.0/validate';

function getAuthHeader(): string {
    const apiKey = process.env.VATSENSE_API_KEY ?? '';
    return `Basic ${Buffer.from(`user:${apiKey}`).toString('base64')}`;
}

export class VatController {
    @get('/vat/validate')
    @response(200, {
        description: 'Validate VAT number via VATSense',
    })
    async validateVat(
        @param.query.string('vat_number') vatNumber: string,
    ): Promise<unknown> {
        if (!vatNumber) {
            throw new HttpErrors.BadRequest('vat_number is required');
        }

        try {
            const {data} = await axios.get(VATSENSE_API_URL, {
                params: {vat_number: vatNumber},
                headers: {Authorization: getAuthHeader()},
            });
            return data;
        } catch (error: any) {
            const status = error.response?.status;
            if (status === 404 || status === 400) {
                return {
                    success: false,
                    code: status,
                    data: {valid: false},
                    message: 'VAT number is invalid',
                };
            }

            return {
                success: false,
                code: status ?? 502,
                data: {valid: false},
                message: 'Unable to verify VAT number at the moment',
            };
        }
    }
}
