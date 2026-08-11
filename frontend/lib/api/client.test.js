import {
    fetchProperties,
    fetchPropertyDetail,
} from './client';

describe('fetchProperties', () => {

    /**
     * Reset mocks after every test so
     * each test starts with a clean slate.
     */
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('fetches properties successfully', async () => {

        const mockResponse = {
            total: 2,
            limit: 20,
            offset: 0,
            results: [
                {
                    L_ListingID: '1',
                    L_Address: '123 Main Street',
                },
                {
                    L_ListingID: '2',
                    L_Address: '456 Oak Avenue',
                },
            ],
        };

        /**
         * Replace the real fetch()
         * with a fake implementation.
         */
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await fetchProperties();

        expect(global.fetch).toHaveBeenCalledTimes(1);

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/properties'
        );

        expect(result).toEqual(mockResponse);
    });

    test('builds query string from filters', async () => {

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                total: 0,
                results: [],
            }),
        });

        await fetchProperties({
            city: 'Atlanta',
            beds: 3,
            minPrice: 300000,
        });

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/properties?city=Atlanta&beds=3&minPrice=300000'
        );
    });

    test('does not include empty filter values', async () => {

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                total: 0,
                results: [],
            }),
        });

        await fetchProperties({
            city: '',
            zipcode: '',
            beds: 3,
            baths: '',
        });

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/properties?beds=3'
        );
    });

    test('throws an error when the request fails', async () => {

        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({
                error: 'Server exploded.',
            }),
        });

        await expect(
            fetchProperties()
        ).rejects.toThrow('Server exploded.');
    });

});

describe('fetchPropertyDetail', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('fetches one property by id', async () => {

        const property = {
            L_ListingID: '123',
            L_Address: '789 Pine Road',
        };

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => property,
        });

        const result = await fetchPropertyDetail('123');

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/properties/123'
        );

        expect(result).toEqual(property);
    });

});