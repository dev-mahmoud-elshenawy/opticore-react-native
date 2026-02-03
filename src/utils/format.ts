/**
 * Formats a 10-digit phone number as (###) ###-####.
 * @param phone - Input phone string
 */
export function formatPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) return phone;
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
}

/**
 * Formats a number as currency.
 * Uses Intl.NumberFormat.
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'USD')
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

/**
 * Formats a number as a percentage.
 * @param value - Value (e.g., 0.12 for 12%)
 * @param decimals - Number of decimal places (default: 0)
 */
export function formatPercentage(value: number, decimals: number = 0): string {
    return `${(value * 100).toFixed(decimals)}%`;
}
