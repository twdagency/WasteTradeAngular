// Date parsing utilities to handle multiple date formats
// Supports DD/MM/YYYY, ISO formats, and other standard formats

// Parse date string in multiple formats and return YYYY-MM-DD format
export function parseDateToISO(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;

    // Try to parse DD/MM/YYYY format first (common frontend format)
    const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(ddmmyyyyRegex);

    if (match) {
        const [, day, month, year] = match;
        return `${year}-${month}-${day}`;
    }

    // Try to parse as ISO date or other valid formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
    }

    return null;
}

// Parse date string and return Date object
export function parseDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;

    // Try DD/MM/YYYY format first
    const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(ddmmyyyyRegex);

    if (match) {
        const [, day, month, year] = match;
        const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    // Try standard Date parsing
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
}

// Format Date object to DD/MM/YYYY format
export function formatDateToDDMMYYYY(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Validate date string format
export function isValidDateFormat(dateStr: string | null | undefined): boolean {
    if (!dateStr) return false;
    return parseDateToISO(dateStr) !== null;
}
