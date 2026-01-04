export function toCents(input: string): number {
    const cleaned = input
    .replace(/\$/g, '')
    .trim()
    .replace(/\./g, '')
    .replace(/,/g, '.');

    const value = Number(cleaned);

    if(Number.isNaN(value)) return 0;

    return Math.round(value * 100);
}

export function formatARS(cents: number): string {
    const value = cents / 100;
    return value.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
    });
}