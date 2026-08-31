import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
    test.each([
        [450000, '$450,000'],
        ['450000', '$450,000'],
        ['$450,000', '$450,000'],
    ])('formats %p as US currency', (value, expected) => {
        expect(formatPrice(value)).toBe(expected);
    });

    test.each([null, undefined, '', 0, -1, 'not a price'])(
        'returns the fallback for %p',
        (value) => {
            expect(formatPrice(value)).toBe('Price unavailable');
        }
    );
});
