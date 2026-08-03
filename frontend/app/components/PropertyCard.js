export default function PropertyCard({ property }) {
    let firstPhoto = null;

    if (property.L_Photos) {
        try {
            const photos = JSON.parse(property.L_Photos);

            if (Array.isArray(photos) && photos.length > 0) {
                firstPhoto = photos[0];
            }
        } catch {
            firstPhoto = null;
        }
    }
    return (
    <article className="rounded-lg border p-4 transition hover:shadow-lg hover:shadow-white">
        {firstPhoto ? (
            <img 
                className="w-full h-48 object-cover rounded-t-lg"
                src={firstPhoto}
                alt={`${property.L_Address} property`}
            />
        ) : (
            <div className="flex w-full h-48 items-center justify-center rounded-t-lg border">
                <p>No photo available</p>
            </div>
        )}
        <div className="mt-4">
            <h2 className="text-xl font-semibold">${Number(property.L_SystemPrice).toLocaleString()}</h2>

            <p>{property.L_Address}</p>

            <p>{property.L_City}, {property.L_State}</p>

            <p>{property.L_Keyword2} beds · {property.LM_Dec_3 ?? 0} baths · {property.L_Keyword1} sqft</p>
        </div>
    </article>
  );
}
