export default function PropertyMap({ latitude, longitude }) {
    if (latitude === null || latitude === undefined ||
        longitude === null || longitude === undefined) {
        return null;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return (
            <p className="text-red-500">
                Google Maps API key is missing.
            </p>
        );
    }

    const mapUrl =
        `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=15`;

    const directionsUrl =
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    return (
        <section className="mt-8">
            <h2 className="mb-4 text-2xl font-semibold">
                Location
            </h2>

            <iframe
                src={mapUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="Property location"
            />

            <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-blue-600 hover:underline"
            >
                Get Directions
            </a>
        </section>
    );
}