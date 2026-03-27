import { EMAIL_REGEX, PASSWORD_REGEX } from '../constants';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export function isValidArray(item: string | string[]): string[] | boolean {
    item = Array.isArray(item) ? item : [''];
    if (item.length !== 0 && item[0] !== '' && item) {
        return item;
    }
    return false;
}

export function filterValidArrayFromArray(array: (string | string[])[]): (string | string[])[] {
    array = array.filter(isValidArray);
    return array;
}

export function checkValidArray<T>(array?: T[]): boolean {
    return array ? Array.isArray(array) && array.length > 0 : false;
}

export function getValidArray<T>(array?: T[]): T[] {
    return checkValidArray<T>(array) ? (array ?? []) : [];
}

export function checkValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
}

export function checkValidPassword(password: string): boolean {
    return PASSWORD_REGEX.test(password);
}

export function validateDate(date: string, format: string): boolean {
    return dayjs(date, format, true).isValid();
}

/**
 * Calculate Material Requirement Status for wanted listings
 * Based on specification: 6.4.2.3 Wanted Listings status
 */
export function getMaterialRequirementStatus(
    status: string,
    state: string,
    startDate: string | Date | null,
    rejectionReason?: string | null,
): string {
    // If listing is rejected
    if (status === 'rejected' || state === 'rejected') {
        return 'Rejected';
    }

    // If listing is pending admin approval
    if (status === 'pending' || state === 'pending') {
        return 'Pending';
    }

    // If listing is fulfilled/sold
    if (status === 'sold' || state === 'closed') {
        return 'Fulfilled';
    }

    // If admin requires more information (custom status)
    if (rejectionReason === 'more_information_required' || status === 'more_information_required') {
        return 'More Information Required';
    }

    // If listing is available/active
    if (status === 'available' || state === 'active') {
        if (!startDate) {
            return 'Material Required';
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

        const materialRequiredDate = new Date(startDate);
        materialRequiredDate.setHours(0, 0, 0, 0);

        // If required date is today or in the past
        if (materialRequiredDate <= today) {
            return 'Material Required';
        } else {
            // If required date is in the future
            const formattedDate = formatDateForMaterialRequired(materialRequiredDate);
            return `Material Required from ${formattedDate}`;
        }
    }

    // Default fallback
    return 'Material Required';
}

/**
 * Format date for Material Required status display
 * Format: DD/MM/YYYY (e.g., "30/4/2020")
 */
export function formatDateForMaterialRequired(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

export function normalizeTimeToPostgres(value?: string | null): string | null {
    if (value === null || value === undefined) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (trimmed.includes('T')) {
        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) {
            const time = date.toISOString().split('T')[1];
            if (!time) return null;
            return time.split('.')[0] ?? null;
        }
    }

    const match = trimmed.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = match[3] !== undefined ? Number(match[3]) : 0;

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        Number.isNaN(seconds) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59 ||
        seconds < 0 ||
        seconds > 59
    ) {
        return null;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
