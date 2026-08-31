import PropertyImageCarousel from './PropertyImageCarousel';
import Link from 'next/link';
import { formatPrice } from '../../lib/utils/formatPrice';

export default function PropertyCard({ property }) {
let photos = [];
    const formattedPrice = formatPrice(property.L_SystemPrice);

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
