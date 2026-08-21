import PropertyImageCarousel from './PropertyImageCarousel';
import Link from 'next/link';

export default function PropertyCard({ property }) {
let photos = [];
    const price = Number(
        String(property.L_SystemPrice ?? '').replace(/[$,]/g, '')
    );
    const formattedPrice =
        Number.isFinite(price) && price > 0
            ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
              }).format(price)
            : 'Price unavailable';

    if (property.L_Photos) {
        try {
            const parsedPhotos = JSON.parse(property.L_Photos);

            if (Array.isArray(parsedPhotos)) {
                photos = parsedPhotos;
            }
        } catch {
            photos = [];
        }   
    }
    return (
        <Link href={`/property/${property.L_ListingID}`}>
            <article className="rounded-lg border p-4 transition hover:shadow-lg hover:shadow-white">
                <PropertyImageCarousel photos={photos} />
            
            <div className="mt-4">
                <h2 className="text-xl font-semibold">{formattedPrice}</h2>

                <p>{property.L_Address}</p>

                <p>{property.L_City}, {property.L_State}</p>

                <p>{property.L_Keyword2} beds · {property.LM_Dec_3} baths · {property.LM_Int2_3} sqft</p>
            </div>
            </article>
        </Link>
  );
}
