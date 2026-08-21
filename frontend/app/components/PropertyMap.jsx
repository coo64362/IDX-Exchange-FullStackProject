export default function PropertyMap({ latitude, longitude }) {
    if (!latitude || !longitude) {
        return (
            <div className="flex h-96 items-center justify-center rounded-lg border bg-gray-100">
                <p className="text-gray-500">Map location unavailable</p>
            </div>
        );
    }

    const mapUrl =
        `https://www.google.com/maps/embed/v1/place` +
        `?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}` +
        `&q=${latitude},${longitude}` +
        `&zoom=15`;



    const directionsUrl =
        `https://www.google.com/maps/dir/?api=1&destination=` +
        encodeURIComponent(`${latitude},${longitude}`);

    return (
        <div className="overflow-hidden rounded-lg border">
            <iframe
                src={mapUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                title="Property location map"
                referrerPolicy="strict-origin-when-cross-origin"
            />

            <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="block p-3 text-blue-600 underline"
            >
                Get Directions
            </a>
        </div>
    );
}
