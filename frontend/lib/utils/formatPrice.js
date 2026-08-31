const USD_FORMATTER = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

export function formatPrice(value) {
    const price = Number(String(value ?? '').replace(/[$,]/g, ''));

    return Number.isFinite(price) && price > 0
        ? USD_FORMATTER.format(price)
        : 'Price unavailable';
}
