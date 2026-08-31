'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    fetchPropertyDetail,
    fetchPropertyOpenHouses,
} from '../../../lib/api/client.js';
import { formatPrice } from '../../../lib/utils/formatPrice';
import PropertyImageGallery from '../../components/PropertyImageGallery';
import PropertyMap from '../../components/PropertyMap';
import OpenHouseList from '../../components/OpenHouseList';

export default function PropertyDetailPage() {
    const { id } = useParams();

    const [property, setProperty] = useState(null);
    const [openHouses, setOpenHouses] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProperty() {
            try {
                setLoading(true);
                setError(null);

                const [propertyData, openHouseData] =
                    await Promise.all([
                        fetchPropertyDetail(id),
                        fetchPropertyOpenHouses(id),
                    ]);

                setProperty(propertyData);
                setOpenHouses(openHouseData);
            } catch (error) {
                console.error('Failed to load property:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            loadProperty();
        }
    }, [id]);

    if (loading) {
        return (
            <main className="mx-auto max-w-6xl p-6">
                <p>Loading property...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="mx-auto max-w-6xl p-6">
                <p className="text-red-600">
                    Error: {error}
                </p>
            </main>
        );
    }

    if (!property) {
        return (
            <main className="mx-auto max-w-6xl p-6">
                <p>Property not found.</p>
            </main>
        );
    }

    let photos = [];

    if (typeof property.L_Photos === 'string' && property.L_Photos.trim()) {
        try {
            const parsedPhotos = JSON.parse(property.L_Photos);

            if (Array.isArray(parsedPhotos)) {
                photos = parsedPhotos;
            }
        } catch {
            photos = [];
        }
    } else if (Array.isArray(property.L_Photos)) {
        photos = property.L_Photos;
    }

    const formattedPrice = formatPrice(property.L_SystemPrice);

    return (
        <main className="mx-auto max-w-6xl p-6">
            <h1 className="mb-6 text-3xl font-bold">
                Property Details
            </h1>

            <PropertyImageGallery photos={photos} />

            <section className="mt-6">
                <h2 className="text-2xl font-semibold">
                    {formattedPrice}
                </h2>

                <p className="mt-2 text-gray-600">
                    {property.L_Address}
                </p>

                <p className="mt-2 text-gray-600">
                    {property.L_City}, {property.L_State} {property.L_Zip}
                </p>

                <p className="mt-2 text-gray-600">
                    {property.L_Keyword2 ?? '—'} beds ·{' '}
                    {property.LM_Dec_3 ?? '—'} baths ·{' '}
                    {property.LM_Int2_3 ?? '—'} sqft ·{' '}
                    Built {property.YearBuilt ?? '—'}
                </p>
            </section>

            <section className="mt-8">
                <h2 className="mb-4 text-2xl font-semibold">
                    Description
                </h2>
                <p className="whitespace-pre-line text-gray-700">
                    {property.L_Remarks || 'No description available.'}
                </p>
            </section>

            <section className="mt-8">
                <h2 className="mb-4 text-2xl font-semibold">
                    Property Details
                </h2>
                <dl className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <dt className="font-semibold">Property type</dt>
                        <dd>{property.L_Class || '—'}</dd>
                    </div>
                    <div>
                        <dt className="font-semibold">Property subtype</dt>
                        <dd>{property.L_Type_ || '—'}</dd>
                    </div>
                    <div>
                        <dt className="font-semibold">Lot size</dt>
                        <dd>{property.L_Keyword1 || '—'}</dd>
                    </div>
                    <div>
                        <dt className="font-semibold">Garage spaces</dt>
                        <dd>{property.L_Keyword5 ?? '—'}</dd>
                    </div>
                </dl>
            </section>

            <section className="mt-8">
                <h2 className="mb-4 text-2xl font-semibold">
                    Location
                </h2>

                <PropertyMap
                    latitude={property.LMD_MP_Latitude}
                    longitude={property.LMD_MP_Longitude}
                />
            </section>

            <section className="mt-8">
                <h2 className="mb-4 text-2xl font-semibold">
                    Open Houses
                </h2>

                <OpenHouseList openHouses={openHouses} />
            </section>
        </main>
    );
}
