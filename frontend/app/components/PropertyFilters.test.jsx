import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertyFilters from './PropertyFilters';

describe('PropertyFilters', () => {

    /**
     * Creates the component with mocked callback functions.
     *
     * This keeps each test short and avoids repeating code.
     */
    function renderFilters() {
        const onSearch = jest.fn();
        const onClear = jest.fn();

        render(
            <PropertyFilters
                onSearch={onSearch}
                onClear={onClear}
            />
        );

        return {
            onSearch,
            onClear,
        };
    }

    test('renders all filter controls', async () => {

        renderFilters();

        const user = userEvent.setup();

        expect(screen.getByPlaceholderText('City')).toBeInTheDocument();

        expect(screen.getByPlaceholderText('ZIP Code')).toBeInTheDocument();

        expect(screen.getByPlaceholderText('Min Price')).toBeInTheDocument();

        expect(screen.getByPlaceholderText('Max Price')).toBeInTheDocument();

        expect(screen.getByDisplayValue('Beds')).toBeInTheDocument();

        expect(screen.getByDisplayValue('Baths')).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: /search/i,
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: /clear filters/i,
            })
        ).toBeInTheDocument();
    });

    test('updates filter values as the user types', async () => {

        renderFilters();

        const user = userEvent.setup();

        const cityInput =
            screen.getByPlaceholderText('City');

        await user.type(
            cityInput,
            'Atlanta'
        );

        expect(cityInput.value).toBe('Atlanta');
    });

    test('calls onSearch with all entered filter values', async () => {

        const { onSearch } = renderFilters();

        const user = userEvent.setup();

        await user.type(
            screen.getByPlaceholderText('City'),
            'Atlanta'
        );

        await user.type(
            screen.getByPlaceholderText('ZIP Code'),
            '30309'
        );

        await user.type(
            screen.getByPlaceholderText('Min Price'),
            '300000'
        );

        await user.selectOptions(
            screen.getByDisplayValue('Beds'),
            '3'
        );

        await user.click(
            screen.getByRole('button', {
                name: /search/i,
            })
        );

        expect(onSearch).toHaveBeenCalledTimes(1);

        expect(onSearch).toHaveBeenCalledWith({
            city: 'Atlanta',
            zipcode: '30309',
            minPrice: '300000',
            maxPrice: '',
            beds: '3',
            baths: '',
        });
    });

    test('clears every input and calls onClear', async () => {
        const { onClear } = renderFilters();
        const user = userEvent.setup();

        const city = screen.getByPlaceholderText('City');
        const zipcode = screen.getByPlaceholderText('ZIP Code');
        const minPrice = screen.getByPlaceholderText('Min Price');
        const maxPrice = screen.getByPlaceholderText('Max Price');
        const beds = screen.getByDisplayValue('Beds');
        const baths = screen.getByDisplayValue('Baths');

        await user.type(city, 'Atlanta');
        await user.type(zipcode, '30309');
        await user.type(minPrice, '300000');
        await user.type(maxPrice, '700000');
        await user.selectOptions(beds, '3');
        await user.selectOptions(baths, '2');

        await user.click(
            screen.getByRole('button', {
            name: /clear filters/i,
            })
        );

        expect(onClear).toHaveBeenCalledTimes(1);

        expect(city).toHaveValue('');
        expect(zipcode).toHaveValue('');
        expect(minPrice).toHaveValue(null);
        expect(maxPrice).toHaveValue(null);
        expect(beds).toHaveValue('');
        expect(baths).toHaveValue('');
    });

});