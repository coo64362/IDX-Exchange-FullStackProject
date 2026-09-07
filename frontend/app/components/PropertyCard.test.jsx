import { render, screen } from '@testing-library/react';
import PropertyCard from './PropertyCard';

jest.mock('./PropertyImageCarousel', () => {
  return function MockPropertyImageCarousel() {
    return <div data-testid="property-image-carousel" />;
  };
});

const fakeProperty = {
  L_ListingID: 'TEST-100',
  L_SystemPrice: 500000,
  L_Address: '123 Main Street',
  L_City: 'Boston',
  L_State: 'MA',
  L_Keyword2: 3,
  LM_Dec_3: 2,
  LM_Int2_3: 1500,
  L_Photos: '[]',
};

describe('PropertyCard', () => {
    test('renders the property data', () => {
        render(<PropertyCard property={fakeProperty} />);

        expect(
        screen.getByRole('heading', {
            name: '$500,000',
        })
        ).toBeInTheDocument();

        expect(
        screen.getByText('123 Main Street')
        ).toBeInTheDocument();

        expect(
        screen.getByText('Boston, MA')
        ).toBeInTheDocument();

        expect(
        screen.getByText(
            '3 beds · 2 baths · 1500 sqft'
        )
        ).toBeInTheDocument();
    });

    test('links to the property detail page', () => {
        render(<PropertyCard property={fakeProperty} />);

        const propertyLink = screen.getByRole('link');

        expect(propertyLink).toHaveAttribute(
            'href',
           '/property/TEST-100'
        );
    });
});