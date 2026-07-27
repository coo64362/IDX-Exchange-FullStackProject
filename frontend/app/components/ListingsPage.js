'use client';
import { useEffect, useState } from 'react';
import { fetchProperties } from '../../lib/api/client.js';
import PropertyCard from './PropertyCard';

export default function ListingsPage() {
    const [data, setData] = useState({
        total: 0,
        limit: 20,
        offset: 0,
        results: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadProperties() {
            try {
                setLoading(true);
                setError(null);

                const propertyData = await fetchProperties({
                    limit: 20, 
                    offset: 0,
                });
                setData(propertyData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadProperties();
    }, []);

    if (loading) {
        return <p>Loading properties...</p>
    }

    if (error) {
        return <p>Error: {error}</p>
    }
    return (
        <main>
            <p>
                Showing {data.results.length} of {data.total} properties
            </p>

            <div className="grid gap-4 grid-cols-3">
                {data.results.map((property) => (
                    <PropertyCard 
                        key={property.L_ListingID}
                        property={property}
                    />
                ))}
            </div>
        </main>
    );
}
